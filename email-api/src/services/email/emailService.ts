import { google } from 'googleapis';
import { Buffer } from 'buffer';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

// ✅ IMPORTS
import { generateVerificationToken } from './verificationService';
import { 
  VERIFICATION_EMAIL_HTML_TEMPLATE, 
  VERIFICATION_EMAIL_TEXT_TEMPLATE 
} from './templates/verificationTemplate';

// 🎯 NOUVEAU : Import du template de bienvenue
import { 
  WELCOME_EMAIL_HTML_TEMPLATE, 
  WELCOME_EMAIL_TEXT_TEMPLATE,
  replaceWelcomeTemplateVariables
} from './templates/welcomeTemplate';

// Configuration anti-spam
const IMPERSONATED_SENDER_EMAIL = 'teamsupport@christennous.com';
const SENDER_NAME = 'Christ en Nous';
const DOMAIN = 'christennous.com';
const UNSUBSCRIBE_URL = 'https://app-christ-en-nous.firebaseapp.com/unsubscribe';
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// Limites anti-spam
const DAILY_SEND_LIMIT = 2000; // Gmail limite
const SEND_DELAY_MS = 100; // Délai entre envois
const BATCH_SIZE = 50; // Envois par batch

// Interface pour les données utilisateur
interface UserData {
  userId: string;
  email: string;
  prenom: string;
  nom: string;
}

// Interface pour les variables du template
interface TemplateVariables {
  prenom: string;
  verificationLink: string;
  email: string;
  unsubscribeLink: string;
  messageId: string;
  timestamp: string;
}

/**
 * Remplace les variables dans les templates
 */
function replaceTemplateVariables(
  template: string, 
  data: TemplateVariables
): string {
  return template
    .replace(/{{PRENOM}}/g, data.prenom)
    .replace(/{{VERIFICATION_LINK}}/g, data.verificationLink)
    .replace(/{{EMAIL}}/g, data.email)
    .replace(/{{UNSUBSCRIBE_LINK}}/g, data.unsubscribeLink)
    .replace(/{{MESSAGE_ID}}/g, data.messageId)
    .replace(/{{TIMESTAMP}}/g, data.timestamp);
}

/**
 * Génère un Message-ID unique conforme RFC 5322
 */
function generateMessageId(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `<${timestamp}.${random}@${DOMAIN}>`;
}

/**
 * Encode le sujet en UTF-8 pour les caractères spéciaux
 */
function encodeSubject(subject: string): string {
  return `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
}

/**
 * Construit un email raw conforme aux standards 2025
 */
function buildRawEmail(
  toEmail: string,
  toName: string,
  subject: string,
  plainTextContent: string,
  htmlContent: string,
  messageId: string,
  unsubscribeToken: string
): string {
  const boundary = `----=_Part_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  const timestamp = new Date().toUTCString();
  
  // Headers anti-spam complets
  const emailParts = [
    // Headers d'identification
    `Message-ID: ${messageId}`,
    `Date: ${timestamp}`,
    `From: "${SENDER_NAME}" <${IMPERSONATED_SENDER_EMAIL}>`,
    `To: "${toName}" <${toEmail}>`,
    `Subject: ${encodeSubject(subject)}`,
    
    // Headers MIME
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    
    // Headers anti-spam critiques
    `List-Unsubscribe: <${UNSUBSCRIBE_URL}?token=${unsubscribeToken}&email=${encodeURIComponent(toEmail)}>, <mailto:${IMPERSONATED_SENDER_EMAIL}?subject=Unsubscribe>`,
    `List-Unsubscribe-Post: List-Unsubscribe=One-Click`,
    `List-ID: <verification.${DOMAIN}>`,
    `List-Help: <mailto:${IMPERSONATED_SENDER_EMAIL}>`,
    `List-Subscribe: <https://app-christ-en-nous.firebaseapp.com/subscribe>`,
    
    // Headers de réputation
    `Precedence: bulk`,
    `X-Priority: 3`,
    `X-Mailer: Christ en Nous Mailer v2.0`,
    `X-Campaign-ID: verification-email`,
    `X-Mail-Category: transactional`,
    
    // Headers de feedback loop
    `Feedback-ID: verification:christennous:transactional`,
    `X-SES-MESSAGE-TAGS: campaign=verification`,
    
    // Corps du message
    '',
    `This is a multi-part message in MIME format.`,
    '',
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    '',
    Buffer.from(plainTextContent, 'utf8').toString('base64'),
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    '',
    Buffer.from(htmlContent, 'utf8').toString('base64'),
    '',
    `--${boundary}--`
  ];

  return emailParts.join('\r\n');
}

/**
 * Génère un token de désabonnement sécurisé
 */
function generateUnsubscribeToken(email: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(`${email}-${process.env.UNSUBSCRIBE_SECRET || 'christ-en-nous-2025'}`);
  return hash.digest('hex').substring(0, 16);
}

/**
 * Vérifie la validité d'une adresse email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const disposableDomainsRegex = /@(tempmail|guerrillamail|mailinator|10minutemail)/i;
  
  return emailRegex.test(email) && !disposableDomainsRegex.test(email);
}

/**
 * Service principal d'envoi d'email avec protection anti-spam
 */
export class EmailService {
  private auth: any;
  private gmail: any;
  private sendCount: number = 0;
  private lastSendTime: number = 0;
  
  constructor() {
    this.initializeGmailAuth();
  }
  
  private async initializeGmailAuth() {
    try {
      // Lecture du service account
      const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
      
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error('Service account file not found');
      }
      
      const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountContent);
      
      // Configuration de l'authentification JWT
      this.auth = new google.auth.JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: SCOPES,
        subject: IMPERSONATED_SENDER_EMAIL,
      });
      
      // ✅ CORRECTION : Gmail API avec auth séparé
      this.gmail = google.gmail({
        version: 'v1',
        auth: this.auth
      } as any); // Type assertion pour contourner le problème temporaire
      
      console.log('✅ Gmail authentication initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gmail auth:', error);
      throw error;
    }
  }
  
  /**
   * Applique un délai anti-spam entre les envois
   */
  private async applyRateLimit() {
    const now = Date.now();
    const timeSinceLastSend = now - this.lastSendTime;
    
    if (timeSinceLastSend < SEND_DELAY_MS) {
      await new Promise(resolve => setTimeout(resolve, SEND_DELAY_MS - timeSinceLastSend));
    }
    
    this.lastSendTime = Date.now();
    this.sendCount++;
    
    // Reset quotidien
    if (this.sendCount >= DAILY_SEND_LIMIT) {
      throw new Error('Daily send limit reached');
    }
  }
  
  /**
   * Envoie un email de vérification optimisé anti-spam
   */
  async sendCustomVerificationEmail(userData: UserData): Promise<boolean> {
    console.log(`📧 Sending verification email to ${userData.email}`);
    
    try {
      // Validation de l'email
      if (!isValidEmail(userData.email)) {
        console.error('❌ Invalid email address:', userData.email);
        return false;
      }
      
      // Application du rate limit
      await this.applyRateLimit();
      
      // Génération des données
      const messageId = generateMessageId();
      const unsubscribeToken = generateUnsubscribeToken(userData.email);
      const verificationToken = await generateVerificationToken(userData.userId, userData.email);
      const verificationLink = `https://app-christ-en-nous.firebaseapp.com/verify-email.html?token=${verificationToken}`;
      const unsubscribeLink = `${UNSUBSCRIBE_URL}?token=${unsubscribeToken}&email=${encodeURIComponent(userData.email)}`;
      
      // Variables pour les templates
      const templateData: TemplateVariables = {
        prenom: userData.prenom,
        verificationLink: verificationLink,
        email: userData.email,
        unsubscribeLink: unsubscribeLink,
        messageId: messageId,
        timestamp: new Date().toISOString(),
      };
      
      // Génération du contenu
      const htmlContent = replaceTemplateVariables(VERIFICATION_EMAIL_HTML_TEMPLATE, templateData);
      const textContent = replaceTemplateVariables(VERIFICATION_EMAIL_TEXT_TEMPLATE, templateData);
      
      // Construction de l'email
      const rawEmail = buildRawEmail(
        userData.email,
        `${userData.prenom} ${userData.nom}`,
        'Confirmez votre inscription - Christ en Nous',
        textContent,
        htmlContent,
        messageId,
        unsubscribeToken
      );
      
      // Encodage pour l'API Gmail
      const encodedMessage = Buffer.from(rawEmail)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // Envoi via Gmail API
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
      
      console.log('✅ Verification email sent successfully!', {
        messageId: messageId,
        gmailId: response.data.id,
      });
      
      // Log pour monitoring
      this.logEmailSent({
        to: userData.email,
        messageId: messageId,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
      
      return true;
      
    } catch (error: any) {
      console.error('❌ Error sending verification email:', error);
      
      // Log d'erreur pour debugging
      this.logEmailError({
        to: userData.email,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      
      return false;
    }
  }

  /**
   * 🎯 NOUVELLE MÉTHODE : Envoie un email de bienvenue après vérification du compte
   */
  async sendWelcomeEmail(userData: {
    userId: string;
    email: string;
    prenom: string;
    nom: string;
  }): Promise<boolean> {
    console.log(`🎉 Sending welcome email to ${userData.email}`);
    
    try {
      // Validation de l'email
      if (!isValidEmail(userData.email)) {
        console.error('❌ Invalid email address:', userData.email);
        return false;
      }
      
      // Application du rate limit
      await this.applyRateLimit();
      
      // Génération des données
      const messageId = generateMessageId();
      const unsubscribeToken = generateUnsubscribeToken(userData.email);
      const unsubscribeLink = `${UNSUBSCRIBE_URL}?token=${unsubscribeToken}&email=${encodeURIComponent(userData.email)}`;
      
      // Variables pour les templates de bienvenue
      const templateData = {
        prenom: userData.prenom,
        email: userData.email,
        unsubscribeLink: unsubscribeLink,
        messageId: messageId,
        timestamp: new Date().toISOString(),
      };
      
      // Génération du contenu de bienvenue
      const htmlContent = replaceWelcomeTemplateVariables(WELCOME_EMAIL_HTML_TEMPLATE, templateData);
      const textContent = replaceWelcomeTemplateVariables(WELCOME_EMAIL_TEXT_TEMPLATE, templateData);
      
      // Construction de l'email de bienvenue
      const rawEmail = buildRawEmail(
        userData.email,
        `${userData.prenom} ${userData.nom}`,
        'Bienvenue dans la famille Christ en Nous !',
        textContent,
        htmlContent,
        messageId,
        unsubscribeToken
      );
      
      // Encodage pour l'API Gmail
      const encodedMessage = Buffer.from(rawEmail)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // Envoi via Gmail API
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
      
      console.log('✅ Welcome email sent successfully!', {
        messageId: messageId,
        gmailId: response.data.id,
        recipient: userData.email
      });
      
      // Log pour monitoring
      this.logEmailSent({
        to: userData.email,
        messageId: messageId,
        timestamp: new Date().toISOString(),
        status: 'success',
        type: 'welcome'
      });
      
      return true;
      
    } catch (error: any) {
      console.error('❌ Error sending welcome email:', error);
      
      // Log d'erreur pour debugging
      this.logEmailError({
        to: userData.email,
        error: error.message,
        timestamp: new Date().toISOString(),
        type: 'welcome'
      });
      
      return false;
    }
  }
  
  /**
   * Envoie un batch d'emails avec protection anti-spam
   */
  async sendBatch(userDataList: UserData[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;
    
    // Traitement par batch
    for (let i = 0; i < userDataList.length; i += BATCH_SIZE) {
      const batch = userDataList.slice(i, i + BATCH_SIZE);
      
      for (const userData of batch) {
        const result = await this.sendCustomVerificationEmail(userData);
        if (result) {
          success++;
        } else {
          failed++;
        }
      }
      
      // Pause entre les batchs
      if (i + BATCH_SIZE < userDataList.length) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 secondes
      }
    }
    
    return { success, failed };
  }
  
  /**
   * Log des emails envoyés pour monitoring
   */
  private logEmailSent(data: any) {
    // Implémenter selon votre système de logging
    console.log('📊 Email sent:', data);
  }
  
  /**
   * Log des erreurs pour debugging
   */
  private logEmailError(data: any) {
    // Implémenter selon votre système de logging
    console.error('📊 Email error:', data);
  }
}

// Export singleton
export const emailService = new EmailService();
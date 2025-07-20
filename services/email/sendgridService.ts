// services/email/sendgridService.ts
import { generateVerificationToken } from './verificationService';

// Configuration SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
 // À remplacer par ta vraie clé
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';
const FROM_EMAIL = 'teamsupport@christennous.com';
const FROM_NAME = 'Christ en Nous';

// URL de base pour la vérification (à adapter selon ton hébergement)
const VERIFICATION_BASE_URL = 'https://app-christ-en-nous.web.app/verify-email.html';
// Pour tester en local, tu peux utiliser : 'http://localhost:3000/verify-email'

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envoie un email via SendGrid
 */
export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    const response = await fetch(SENDGRID_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: data.to }],
        }],
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME,
        },
        subject: data.subject,
        content: [
          {
            type: 'text/plain',
            value: data.text || 'Email de Christ en Nous',
          },
          {
            type: 'text/html',
            value: data.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erreur SendGrid:', error);
      return false;
    }

    console.log('✅ Email envoyé avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
}

/**
 * Envoie l'email de vérification personnalisé avec NOTRE lien
 */
export async function sendCustomVerificationEmail(userData: {
  userId: string;
  email: string;
  prenom: string;
  nom: string;
}): Promise<boolean> {
  try {
    // Générer notre propre token de vérification
    const verificationToken = await generateVerificationToken(userData.userId, userData.email);
    
    // Créer le lien de vérification
    const verificationLink = `${VERIFICATION_BASE_URL}?token=${verificationToken}`;
    
    console.log('🔗 Lien de vérification généré:', verificationLink);
    
    // Template HTML magnifique et personnalisé
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #002366 0%, #003d82 50%, #0052cc 100%);
            color: white;
            padding: 50px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 0.8; }
          }
          .header h1 {
            margin: 0;
            font-size: 36px;
            font-weight: bold;
            position: relative;
            z-index: 1;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.95;
            font-size: 18px;
            position: relative;
            z-index: 1;
          }
          .dove-icon {
            font-size: 50px;
            margin-bottom: 20px;
            animation: float 3s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .content {
            padding: 50px 40px;
            background: linear-gradient(to bottom, #ffffff 0%, #f9f9f9 100%);
          }
          .greeting {
            font-size: 28px;
            color: #002366;
            margin-bottom: 25px;
            font-weight: bold;
            text-align: center;
          }
          .message {
            margin-bottom: 35px;
            color: #555;
            line-height: 1.8;
            text-align: center;
            font-size: 16px;
          }
          .button-container {
            text-align: center;
            margin: 45px 0;
          }
          .verify-button {
            display: inline-block;
            padding: 20px 60px;
            background: linear-gradient(135deg, #FFD700 0%, #FFC500 100%);
            color: #002366;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 20px;
            box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          .verify-button::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.5);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
          }
          .verify-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px rgba(255, 215, 0, 0.5);
          }
          .verify-button:hover::before {
            width: 300px;
            height: 300px;
          }
          .features {
            background: #e8f4f8;
            border-radius: 10px;
            padding: 30px;
            margin: 30px 0;
          }
          .features h3 {
            color: #002366;
            margin-bottom: 20px;
            font-size: 20px;
          }
          .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
          }
          .feature-icon {
            font-size: 24px;
            margin-right: 15px;
          }
          .security-note {
            background: linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%);
            border: 2px solid #ffeaa7;
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
            font-size: 14px;
            color: #856404;
            text-align: center;
          }
          .security-note strong {
            display: block;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .footer {
            background-color: #002366;
            color: white;
            padding: 40px 30px;
            text-align: center;
            font-size: 14px;
          }
          .footer .verse {
            font-style: italic;
            color: #FFD700;
            margin-top: 20px;
            font-size: 16px;
            font-weight: 500;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: white;
            text-decoration: none;
            font-size: 20px;
          }
          .link-copy {
            background: #f0f0f0;
            padding: 15px;
            border-radius: 8px;
            margin-top: 30px;
            word-break: break-all;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="dove-icon">🕊️</div>
            <h1>Christ en Nous</h1>
            <p>L'Espérance de la Gloire</p>
          </div>
          
          <div class="content">
            <h2 class="greeting">Shalom ${userData.prenom} ${userData.nom} ! ✨</h2>
            
            <div class="message">
              <p><strong>Bienvenue dans la famille Christ en Nous !</strong></p>
              <p>Nous sommes ravis de t'accueillir parmi nous. Tu es sur le point de rejoindre une communauté bienveillante et grandissante dans la foi.</p>
              <p>Pour finaliser ton inscription et sécuriser ton compte, nous avons juste besoin que tu confirmes ton adresse email.</p>
            </div>
            
            <div class="button-container">
              <a href="${verificationLink}" class="verify-button">
                ✉️ Confirmer mon email maintenant
              </a>
            </div>
            
            <div class="features">
              <h3>🎁 Ce qui t'attend après la confirmation :</h3>
              <div class="feature-item">
                <span class="feature-icon">📖</span>
                <span>Accès complet à tous les contenus spirituels</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🙏</span>
                <span>Participation aux groupes de prière</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">💬</span>
                <span>Connexion avec la communauté</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📅</span>
                <span>Notifications des événements de l'église</span>
              </div>
            </div>
            
            <div class="security-note">
              <strong>🔒 Note de sécurité</strong>
              Ce lien est unique et valable pendant 24 heures.<br>
              Si tu n'as pas demandé cette inscription, tu peux ignorer cet email en toute sécurité.
            </div>
            
            <div class="link-copy">
              <p style="margin: 0; color: #999;">Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :</p>
              <p style="margin: 5px 0 0 0; color: #0066cc;">
                ${verificationLink}
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé à <strong>${userData.email}</strong></p>
            <p>© 2024 Christ en Nous - Tous droits réservés</p>
            
            <div class="social-links">
              <a href="#">📘</a>
              <a href="#">📷</a>
              <a href="#">🐦</a>
            </div>
            
            <p class="verse">
              "Christ en vous, l'espérance de la gloire"<br>
              - Colossiens 1:27
            </p>
            
            <p style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
              Tu reçois cet email car tu t'es inscrit sur l'application Christ en Nous.<br>
              Pour toute question, contacte-nous à ${FROM_EMAIL}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Shalom ${userData.prenom} ${userData.nom} !
      
      Bienvenue dans la famille Christ en Nous !
      
      Pour finaliser ton inscription et sécuriser ton compte, confirme ton adresse email en cliquant sur ce lien :
      
      ${verificationLink}
      
      Ce lien est valable pendant 24 heures.
      
      Ce qui t'attend après la confirmation :
      - Accès complet à tous les contenus spirituels
      - Participation aux groupes de prière  
      - Connexion avec la communauté
      - Notifications des événements de l'église
      
      Que Dieu te bénisse abondamment !
      
      L'équipe Christ en Nous
      
      ---
      "Christ en vous, l'espérance de la gloire" - Colossiens 1:27
    `;

    // Envoie notre superbe email personnalisé
    return await sendEmail({
      to: userData.email,
      subject: `✉️ ${userData.prenom}, confirme ton inscription - Christ en Nous`,
      html,
      text,
    });
  } catch (error) {
    console.error('Erreur sendCustomVerificationEmail:', error);
    return false;
  }
}
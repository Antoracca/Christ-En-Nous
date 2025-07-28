// services/email/emailService.ts
import { generateVerificationToken } from './verificationService';

/**
 * ✅ Import du template HTML depuis le fichier TypeScript
 */
import { VERIFICATION_EMAIL_TEMPLATE } from './templates/verificationTemplate';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;


/**
 * ✅ Remplace les variables dans le template HTML
 */
function replaceTemplateVariables(template: string, data: {
  prenom: string;
  verificationLink: string;
  email: string;
}): string {
  return template
    .replace(/{{PRENOM}}/g, data.prenom)
    .replace(/{{VERIFICATION_LINK}}/g, data.verificationLink)
    .replace(/{{PRENOM_EMAIL}}/g, data.email)
    .replace(/{{UNSUBSCRIBE_LINK}}/g, '#'); // Tu peux modifier plus tard
}

/**
 * ✅ Envoi d'email avec SendGrid API + Template HTML externe
 */
export async function sendCustomVerificationEmail(userData: {
  userId: string;
  email: string;
  prenom: string;
  nom: string;
}): Promise<boolean> {
  
  console.log(`🚀 Envoi d'email de vérification à ${userData.email} via SendGrid`);

  try {
    // 1. Générer le token de vérification
    const verificationToken = await generateVerificationToken(userData.userId, userData.email);
    console.log('🎫 Token généré:', verificationToken);

    // 2. Construire le lien de vérification
    const verificationLink = `https://app-christ-en-nous.firebaseapp.com/verify-email.html?token=${verificationToken}`;
    
    // 3. Utiliser le template HTML importé
    console.log('📄 Utilisation du template HTML...');
    const htmlTemplate = VERIFICATION_EMAIL_TEMPLATE;
    
    // 4. Remplacer les variables dans le template
    const htmlContent = replaceTemplateVariables(htmlTemplate, {
      prenom: userData.prenom,
      verificationLink: verificationLink,
      email: userData.email
    });

    // 5. Payload SendGrid
    const payload = {
      personalizations: [
        {
          to: [{ email: userData.email, name: userData.prenom }],
          subject: "Confirmez votre inscription - Christ en Nous"
        }
      ],
      from: {
        email: "teamsupport@christennous.com",
        name: "Christ en Nous"
      },
      content: [
        {
          type: "text/html",
          value: htmlContent
        }
      ]
    };

    console.log('📧 Envoi via SendGrid...');

    // 6. Appel API SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('✅ Email envoyé avec succès via SendGrid');
      console.log(`📬 Email de vérification envoyé à ${userData.email}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Erreur SendGrid:', response.status, errorText);
      return false;
    }

  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
}
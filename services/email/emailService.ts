// services/email/emailService.ts
import { generateVerificationToken } from './verificationService';
import { VERIFICATION_EMAIL_TEMPLATE } from './templates/verificationTemplate';

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
    .replace(/{{UNSUBSCRIBE_LINK}}/g, '#');
}

/**
 * ✅ Envoi d'email avec SendGrid API + Template HTML externe - VERSION ANTI-SPAM
 */
export async function sendCustomVerificationEmail(userData: {
  userId: string;
  email: string;
  prenom: string;
  nom: string;
}): Promise<boolean> {
  
  console.log(`🚀 Envoi d'email de vérification à ${userData.email} via SendGrid`);

  // 🔧 Récupérer la clé depuis process.env (méthode qui marche)
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

  // 🔧 Debug : Vérifier que la clé est bien chargée
  console.log('🔑 Clé API SendGrid chargée:', SENDGRID_API_KEY ? 'OUI' : 'NON');
  console.log('🔑 Premiers caractères:', SENDGRID_API_KEY?.substring(0, 10) || 'VIDE');
  
  if (!SENDGRID_API_KEY || !SENDGRID_API_KEY.startsWith('SG.')) {
    console.error('❌ ERREUR: Clé SendGrid manquante ou invalide');
    console.error('💡 Assure-toi que ton fichier .env contient SENDGRID_API_KEY=SG.xxxxx');
    return false;
  }

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

    // 5. Payload SendGrid optimisé ANTI-SPAM
    const payload = {
      personalizations: [
        {
          to: [{ 
            email: userData.email, 
            name: `${userData.prenom} ${userData.nom}` // ✅ Nom complet
          }],
          subject: "Confirmez votre inscription - Christ en Nous"
        }
      ],
      from: {
        email: "teamsupport@christennous.com", // ✅ TON domaine authentifié
        name: "Christ en Nous - Équipe Support"
      },
      // ✅ AJOUTS ANTI-SPAM CRITIQUES
      reply_to: {
        email: "admin@christennous.com", // ✅ Maintenant verified !
        name: "Administration Christ en Nous"
      },
      content: [
        // ✅ IMPORTANT: text/plain DOIT être en premier !
        {
          type: "text/plain",
          value: `
Bonjour ${userData.prenom},

Bienvenue dans la communauté Christ en Nous !

Pour activer votre compte, cliquez sur ce lien :
${verificationLink}

Si le lien ne fonctionne pas, copiez-collez l'URL dans votre navigateur.

Merci de votre confiance,
L'équipe Christ en Nous

---
Cet email a été envoyé à ${userData.email}
Si vous n'avez pas demandé cette inscription, contactez admin@christennous.com
          `.trim()
        },
        // ✅ Puis text/html en second
        {
          type: "text/html",
          value: htmlContent
        }
      ],
      // ✅ HEADERS ANTI-SPAM ESSENTIELS
      headers: {
        "X-Priority": "3", // Priorité normale
        "X-Mailer": "Christ en Nous App",
        "List-Unsubscribe": "<mailto:admin@christennous.com?subject=Unsubscribe>",
      },
      // ✅ Catégories SendGrid pour le tracking
      categories: ["email-verification", "onboarding"],
      // ✅ Désactiver le tracking des clics (parfois considéré comme spam)
      tracking_settings: {
        click_tracking: { enable: false },
        open_tracking: { enable: true },
        subscription_tracking: { enable: false }
      }
    };

    console.log('📧 Envoi via SendGrid avec configuration anti-spam...');
    console.log('🎯 Destinataire:', userData.email);
    console.log('📨 Expéditeur:', payload.from.email);

    // 6. Appel API SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📊 Statut de réponse:', response.status);

    if (response.ok) {
      console.log('✅ Email envoyé avec succès via SendGrid (config anti-spam activée)');
      console.log(`📬 Email de vérification envoyé à ${userData.email}`);
      console.log('💡 Si l\'email est en spam, demande à vérifier les dossiers indésirables');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Erreur SendGrid:', response.status, errorText);
      
      // Messages d'erreur plus clairs
      if (response.status === 401) {
        console.error('🔑 PROBLÈME: Clé API SendGrid invalide ou expirée');
      } else if (response.status === 403) {
        console.error('🚫 PROBLÈME: Permissions insuffisantes sur la clé SendGrid');
      } else if (response.status === 400) {
        console.error('📝 PROBLÈME: Configuration email invalide (vérifiez from/reply_to)');
      }
      
      return false;
    }

  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    console.error('🔍 Type d\'erreur:', error.name);
    console.error('🔍 Message:', error.message);
    return false;
  }
}
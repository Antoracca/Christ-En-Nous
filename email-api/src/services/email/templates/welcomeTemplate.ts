// services/email/templates/welcomeTemplate.ts

/**
 * ✅ Template HTML de l'e-mail de bienvenue officielle.
 * Version 2.1 : Correction du badge App Store, optimisation des images pour l'anti-spam.
 * Variables supportées: {{PRENOM}}, {{EMAIL}}, {{TIMESTAMP}}, {{MESSAGE_ID}}, {{UNSUBSCRIBE_LINK}}
 */
export const WELCOME_EMAIL_HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Bienvenue chez Christ En Nous App</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset & Base Styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

    /* Main Container */
    .email-wrapper {
      background-color: #f8f9fa;
      padding: 40px 10px;
    }
    .email-content {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid #e9ecef;
    }

    /* Header */
    .header {
      padding: 40px 20px 20px;
      text-align: center;
    }
    .header img {
      width: 80px;
      height: 80px;
      margin: 0 auto;
    }
    .header-devise {
        font-size: 14px;
        color: #86868b;
        font-style: italic;
        letter-spacing: 0.4px;
        margin-top: 16px;
        padding: 0 20px;
    }

    /* Body */
    .body-section {
      padding: 20px 30px 30px;
      color: #212529;
      font-size: 16px;
      line-height: 1.7;
    }
    .body-section h1 {
      font-size: 26px;
      font-weight: 700;
      color: #002366;
      margin: 0 0 20px;
      text-align: center;
    }
    .body-section p {
      margin: 0 0 20px;
    }
    .body-section ul {
        list-style-position: inside;
        padding-left: 0;
        margin-bottom: 25px;
        text-align: left;
    }
    .highlight {
        color: #0052cc;
        font-weight: 600;
    }

    /* Sections Divider */
    .section-divider {
        padding: 40px 20px 10px;
        border-top: 1px solid #e9ecef;
    }
    .section-title {
        font-size: 20px;
        font-weight: 700;
        color: #002366;
        text-align: center;
        margin-bottom: 30px;
    }

    /* App Download Section */
    .app-download-section {
        text-align: center;
        padding: 10px 0 30px;
    }
    .app-download-section a {
        display: inline-block;
        margin: 5px 5px;
    }
    .app-download-section img {
        height: 45px;
        width: auto;
    }

    /* Resources Section */
    .resource-item {
        text-align: center;
        padding-bottom: 30px;
    }
    .resource-item img {
        height: 80px;
        width: auto;
        max-width: 150px;
        margin: 0 auto 10px;
    }
    .resource-item .title {
        font-weight: 600;
        color: #212529;
        font-size: 15px;
    }
    .resource-item .description {
        font-size: 14px;
        color: #6c757d;
        padding: 0 10px;
    }

    /* Community Section */
    .whatsapp-item {
        padding-bottom: 20px;
    }
    .whatsapp-icon {
        width: 40px;
        vertical-align: middle;
    }
    .whatsapp-text {
        vertical-align: middle;
        padding-left: 15px;
        font-size: 15px;
        color: #212529;
    }
    .whatsapp-text a {
        color: #0052cc;
        font-weight: 600;
        text-decoration: none;
    }

    /* Footer */
    .footer {
      background-color: #002366;
      color: #adb5bd;
      padding: 40px;
      font-size: 12px;
      line-height: 1.6;
    }
    .footer .section-title-footer {
        color: #FFD700;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 15px;
        text-transform: uppercase;
        text-align: left;
    }
    .footer a {
        color: #ffffff;
        text-decoration: none;
    }
    .social-links {
        text-align: center;
        margin-bottom: 20px;
    }
    .social-links a {
        display: inline-block;
        margin: 0 8px;
    }
    .social-links img {
        width: 32px;
        height: 32px;
    }
    .footer-divider {
        border-top: 1px solid #003a9e;
        margin: 20px 0;
    }
    .footer-contact-section {
        text-align: left;
    }
    .security-note, .address, .copyright, .legal-links {
        text-align: center;
        margin-top: 20px;
    }
    .copyright {
        color: #6c757d;
    }
    .legal-links a {
        color: #adb5bd;
        text-decoration: underline;
        margin: 0 5px;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      body, .email-wrapper { background-color: #000000 !important; }
      .email-content { background-color: #1c1c1e !important; border-color: #38383a !important; }
      .body-section, .resource-item .title, .whatsapp-text { color: #e1e1e6 !important; }
      .body-section h1, .section-title { color: #ffffff !important; }
      .highlight, .whatsapp-text a { color: #58a6ff !important; }
      .resource-item .description, .footer { color: #86868b !important; }
      .section-divider { border-top-color: #38383a !important; }
      .footer { background-color: #121212 !important; }
      .footer-divider { border-top-color: #38383a !important; }
      .copyright, .legal-links a { color: #6e6e73 !important; }
    }

  </style>
</head>
<body>
  <div style="display:none; max-height:0; max-width:0; opacity:0; overflow:hidden;">
    Bienvenue dans la famille Christ en Nous ! Votre aventure spirituelle commence maintenant.
  </div>

  <div class="email-wrapper">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" class="email-content" border="0" cellpadding="0" cellspacing="0" width="100%">
            <!-- Header: Logo -->
            <tr>
              <td class="header">
                <img src="https://app-christ-en-nous.web.app/assets/logoP.png" alt="Logo Christ en Nous" width="100" height="100">
                <p class="header-devise">Servir • Faire des Disciples • Évangéliser</p>
              </td>
            </tr>
            <!-- Body: Content -->
            <tr>
              <td class="body-section">
                <h1>Bénédiction sur vous, {{PRENOM}} !</h1>
                <p>
                  L'église <span class="highlight">Christ En Nous</span> vous souhaite officiellement la bienvenue sur sa plateforme digitale. Votre inscription s'est déroulée avec succès et votre compte est désormais actif !
                </p>
                <p>
                  Cette étape marque le début d'un parcours innovant, où la technologie se met au service de la foi. Bénéficiez désormais de toutes nos fonctionnalités :
                </p>
                <ul>
                  <li><strong>Cours & Enseignements :</strong> Accédez à des formations exclusives.</li>
                  <li><strong>Suivis & Parcours :</strong> Programmez des entretiens et avancez dans votre vie de disciple.</li>
                  <li><strong>Événements :</strong> Restez informé de tous les événements de l'église.</li>
                  <li><strong>Notifications :</strong> Recevez les nouvelles importantes par e-mail et sur l'application.</li>
                </ul>
              </td>
            </tr>

            <!-- App Download Section -->
            <tr>
                <td class="app-download-section">
                    <p style="font-size: 14px; color: #6c757d; text-align: center; margin-bottom: 15px; padding: 0 20px;">
                        Inscrit depuis notre site web ? Continuez l'expérience sur mobile !
                    </p>
                    <a href="https://apps.apple.com/VOTRE-LIEN" target="_blank" rel="noopener noreferrer">
                        <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store/black/fr/download-on-the-app-store.svg" alt="Télécharger sur l'App Store" style="height: 45px; width: auto;">
                    </a>
                    <a href="https://play.google.com/VOTRE-LIEN" target="_blank" rel="noopener noreferrer">
                        <img src="https://play.google.com/intl/en_us/badges/static/images/badges/fr_badge_web_generic.png" alt="Disponible sur Google Play" style="height: 45px; width: auto;">
                    </a>
                </td>
            </tr>

            <!-- Resources Section -->
            <tr>
                <td class="section-divider">
                    <h2 class="section-title">Découvrez nos Ministères</h2>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td class="resource-item">
                                <img src="https://app-christ-en-nous.web.app/assets/ChristAcademy.png" alt="Logo Christ en Nous Académie" style="height: 80px; width: auto; max-width: 150px;">
                                <div class="title">Christ en Nous Académie</div>
                                <div class="description">Formations théologiques et ministérielles.</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="resource-item">
                                <img src="https://app-christ-en-nous.web.app/assets/markos.png" alt="Logo Markos" style="height: 80px; width: auto; max-width: 150px;">
                                <div class="title">Marcos, Ministère des Jeunes</div>
                                <div class="description">Activités et enseignements pour la jeunesse.</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="resource-item">
                                <img src="https://app-christ-en-nous.web.app/assets/mission.png" alt="Logo Mission Bonnes Œuvres" style="height: 80px; width: auto; max-width: 150px;">
                                <div class="title">Mission Bonnes Œuvres</div>
                                <div class="description">Impactez des vies à travers nos actions sociales.</div>
                            </td>
                        </tr>
                    </table>
                    <p style="font-size: 14px; color: #6c757d; text-align: center; padding: 0 20px;">
                        Programmez vos cours de baptême, de discipolat ou d'élévation au ministère directement depuis l'application.
                    </p>
                </td>
            </tr>

            <!-- Community Section -->
            <tr>
                <td class="section-divider">
                    <h2 class="section-title">Rejoignez la Communauté</h2>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 auto; max-width: 400px;">
                        <tr class="whatsapp-item">
                            <td>
                                <img src="https://img.icons8.com/color/48/000000/whatsapp--v1.png" alt="Icône WhatsApp" width="40" height="40" class="whatsapp-icon">
                                <span class="whatsapp-text">
                                    Groupe de l'Église - <a href="https://votre-lien-whatsapp.com" target="_blank" rel="noopener noreferrer">Nous rejoindre</a>
                                </span>
                            </td>
                        </tr>
                        <tr class="whatsapp-item">
                            <td>
                                <img src="https://img.icons8.com/color/48/000000/whatsapp--v1.png" alt="Icône WhatsApp" width="40" height="40" class="whatsapp-icon">
                                <span class="whatsapp-text">
                                    Groupe de l'Académie - <a href="https://votre-lien-whatsapp.com" target="_blank" rel="noopener noreferrer">Nous rejoindre</a>
                                </span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="footer">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td>
                            <div class="section-title-footer" style="text-align: center;">Suivez-nous</div>
                            <div class="social-links">
                                <a href="https://facebook.com/ChristEnNous" target="_blank" rel="noopener noreferrer"><img src="https://img.icons8.com/fluency/48/ffffff/facebook-new.png" alt="Facebook" width="32" height="32"></a>
                                <a href="https://wa.me/23675535338" target="_blank" rel="noopener noreferrer"><img src="https://img.icons8.com/fluency/48/ffffff/whatsapp.png" alt="WhatsApp" width="32" height="32"></a>
                                <a href="https://www.youtube.com/@ChristEnNous" target="_blank" rel="noopener noreferrer"><img src="https://img.icons8.com/fluency/48/ffffff/youtube-play.png" alt="YouTube" width="32" height="32"></a>
                                <a href="https://votre-lien-live.com" target="_blank" rel="noopener noreferrer"><img src="https://app-christ-en-nous.web.app/assets/live.ico" alt="Live" width="32" height="32"></a>
                                <a href="https://www.tiktok.com/@christennous" target="_blank" rel="noopener noreferrer"><img src="https://img.icons8.com/fluency/48/ffffff/tiktok.png" alt="TikTok" width="32" height="32"></a>
                                <a href="https://www.linkedin.com/company/christ-en-nous" target="_blank" rel="noopener noreferrer"><img src="https://img.icons8.com/fluency/48/ffffff/linkedin.png" alt="LinkedIn" width="32" height="32"></a>
                            </div>
                        </td>
                    </tr>
                    <tr><td><div class="footer-divider"></div></td></tr>
                    <tr>
                        <td class="footer-contact-section">
                            <div class="section-title-footer">Contacts & Support</div>
                            Support : <a href="mailto:teamsupport@christennous.com">teamsupport@christennous.com</a><br>
                            Administration : <a href="mailto:admin@christennous.com">admin@christennous.com</a><br>
                            Infos : <a href="mailto:infocontact@christennous.com">infocontact@christennous.com</a><br>
                            Téléphone : +236 75 53 53 38
                        </td>
                    </tr>
                    <tr><td style="padding-top:20px;" class="footer-contact-section">
                        <div class="section-title-footer">Soutien & Pastorat</div>
                        Votre générosité nous permet de poursuivre l'œuvre. Soutenez la mission en donnant :<br>
                        Dîmes & Offrandes : <a href="mailto:offrandes@christennous.com" style="font-weight: bold; text-decoration: underline;">offrandes@christennous.com</a><br>
                        Dons & Libéralités : <a href="mailto:don@christennous.com" style="font-weight: bold; text-decoration: underline;">don@christennous.com</a><br>
                        Mission Bonnes Œuvres (BOMI) : <a href="mailto:bomi@christennous.com" style="font-weight: bold; text-decoration: underline;">bomi@christennous.com</a><br>
                        Pasteur Principal : <a href="mailto:pasteur-principal@christennous.com">pasteur-principal@christennous.com</a>
                    </td></tr>
                    <tr><td><div class="footer-divider"></div></td></tr>
                    <tr><td>
                        <div class="security-note">
                            Pour votre sécurité, ne partagez jamais vos informations de connexion. Notre équipe ne vous demandera jamais votre mot de passe.
                        </div>
                        <div class="address">
                            Christ en Nous, République Centrafricaine, Bangui, Sica 3 Pont Castor
                        </div>
                        <div class="copyright">
                            &copy; 2025 Christ En Nous. Tous droits réservés.
                        </div>
                        <div class="legal-links">
                            <a href="https://votre-lien.com/faq" target="_blank">FAQ</a> &bull;
                            <a href="https://votre-lien.com/confidentialite" target="_blank">Règles de confidentialité</a> &bull;
                            <a href="https://votre-lien.com/conditions" target="_blank">Conditions d'utilisation</a>
                        </div>
                        <div style="margin-top: 20px; font-size: 11px; color: #6c757d; text-align: center; word-break: break-all;">
                            Envoyé à {{EMAIL}} (ID: {{MESSAGE_ID}})
                        </div>
                    </td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

/**
 * ✅ Version texte simple pour l'email de bienvenue
 */
export const WELCOME_EMAIL_TEXT_TEMPLATE = `
Bienvenue {{PRENOM}} dans la famille Christ En Nous !

L'église Christ En Nous vous souhaite officiellement la bienvenue sur sa plateforme digitale. 
Votre inscription s'est déroulée avec succès et votre compte est désormais actif !

Cette étape marque le début d'un parcours innovant, où la technologie se met au service de la foi. 
Bénéficiez désormais de toutes nos fonctionnalités :

• Cours & Enseignements : Accédez à des formations exclusives.
• Suivis & Parcours : Programmez des entretiens et avancez dans votre vie de disciple.
• Événements : Restez informé de tous les événements de l'église.
• Notifications : Recevez les nouvelles importantes par e-mail et sur l'application.

DÉCOUVREZ NOS RESSOURCES :

Christ en Nous Académie - Formations théologiques et ministérielles.
Marcos, Ministère des Jeunes - Activités et enseignements pour la jeunesse.
Mission Bonnes Œuvres - Impactez des vies à travers nos actions sociales.

REJOIGNEZ LA COMMUNAUTÉ :

Groupe de l'Église WhatsApp
Groupe de l'Académie WhatsApp

---
Christ En Nous

Support : teamsupport@christennous.com
Administration : admin@christennous.com  
Téléphone : +236 75 53 53 38
République Centrafricaine, Bangui, Sica 3 Pont Castor

Envoyé à {{EMAIL}} le {{TIMESTAMP}} (ID: {{MESSAGE_ID}})
`;

/**
 * ✅ Interface TypeScript pour les variables du template de bienvenue
 */
export interface WelcomeTemplateVariables {
  prenom: string;
  email: string;
  timestamp: string;
  messageId: string;
  unsubscribeLink?: string;
}

/**
 * ✅ Fonction utilitaire pour remplacer les variables de bienvenue
 */
export function replaceWelcomeTemplateVariables(
  template: string,
  data: WelcomeTemplateVariables
): string {
  return template
    .replace(/{{PRENOM}}/g, data.prenom)
    .replace(/{{EMAIL}}/g, data.email)
    .replace(/{{TIMESTAMP}}/g, data.timestamp)
    .replace(/{{MESSAGE_ID}}/g, data.messageId)
    .replace(/{{UNSUBSCRIBE_LINK}}/g, data.unsubscribeLink || '');
}

/**
 * ✅ Configuration de l'email de bienvenue
 */
export const WELCOME_EMAIL_CONFIG = {
  subject: ' [IMPORTANT] Bienvenue dans la famille Christ En Nous !',
  from: {
    name: 'Équipe Christ En Nous',
    email: 'teamsupport@christennous.com'
  },
  replyTo: 'admin@christennous.com',
  headers: {
    'X-Priority': '2',
    'X-MSMail-Priority': 'High', 
    'Importance': 'high',
    'X-Auto-Response-Suppress': 'OOF', // Évite réponses auto
    'List-Unsubscribe': '<mailto:unsubscribe@christennous.com>' // Légal
  }
};
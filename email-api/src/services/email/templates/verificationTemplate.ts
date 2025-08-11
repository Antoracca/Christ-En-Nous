// services/email/templates/verificationTemplate.ts

/**
 * ✅ Template HTML Email Vérification - Christ en Nous
 * Version épurée et moderne, compatible avec votre emailService.ts existant.
 * Variables supportées: {{PRENOM}}, {{VERIFICATION_LINK}}, {{EMAIL}}, {{TIMESTAMP}}, {{MESSAGE_ID}}
 */
export const VERIFICATION_EMAIL_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Votre voyage commence - Christ en Nous</title>
  <style>
    /* Reset & base */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; -ms-interpolation-mode: bicubic; display:block; outline:none; text-decoration:none; }
    body { margin:0; padding:0; width:100% !important; background:#f5f5f7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color:#1d1d1f; }

    /* Container */
    .email-wrapper {
      width: 100%;
      background: #f5f5f7;
      padding: 40px 0;
    }
    .email-content {
      max-width: 650px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    
    /* Devise avec bordure neutre et plus fine */
    .devise {
      margin-top: 35px;
      padding-top: 25px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
    }
    .devise-text {
      font-size: 15px;
      color: #6e6e73;
      font-style: italic;
      letter-spacing: 0.5px;
      line-height: 1.4;
    }
    .devise-text span {
      color: #d4af37;
      font-weight: 600;
      margin: 0 8px;
    }
    
    /* Header logo - Style épuré */
    .header {
      text-align: center;
      padding: 30px 0 0;
      background: #ffffff;
    }
    .header img {
      width: 60px;
      height: 60px;
      margin: 0 auto;
      display: block;
      object-fit: contain;
    }
    
    /* Body - Spacieux */
    .body-section {
      padding: 20px 45px 45px;
      line-height: 1.7;
      font-size: 17px;
      color: #3c3c43;
    }
    .body-section h1 {
      font-weight: 600;
      font-size: 32px;
      margin: 0 0 25px;
      letter-spacing: -0.5px;
      color: #000;
    }
    .body-section p {
      margin: 0 0 20px;
      line-height: 1.8;
    }
    .highlight {
      color: #d4af37;
      font-weight: 500;
    }
    
    /* Button - Moderne */
    .btn-container {
      text-align: center;
      margin: 40px 0;
    }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #0071e3 0%, #005bb5 100%);
      color: #fff !important;
      text-decoration: none;
      padding: 18px 45px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 17px;
      font-family: inherit;
      text-align: center;
      box-shadow: 0 8px 20px rgba(0,113,227,0.3);
      transition: all 0.3s ease;
      line-height: 1.2;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 25px rgba(0,113,227,0.4);
    }
    
    /* Secondary text */
    .small-text {
      font-size: 14px;
      color: #6e6e73;
      line-height: 1.6;
      margin-top: 30px;
      text-align: center;
      padding: 0 20px;
    }
    .small-text a {
      color: #0071e3;
      text-decoration: underline;
    }
    
    /* Footer redesigné, simplifié et épuré */
    .footer {
      background: #ffffff;
      padding: 40px 36px;
      font-size: 13px;
      color: #6e6e73;
      text-align: center;
      line-height: 1.6;
      border-top: 1px solid #e5e5e5;
    }
    
    /* Structure de centrage pour le logo et le texte */
    .footer-brand {
      margin: 0 auto 35px;
      text-align: center;
    }
    .footer-brand img {
      height: 50px;
      width: 50px;
      margin: 0 auto 10px auto;
    }
    .footer-brand-text {
      font-weight: 700;
      font-size: 20px;
      color: #0d2340;
      letter-spacing: -0.3px;
    }
    
    /* Section des réseaux sociaux, toujours centrée mais plus espacée */
    .social-section {
      margin-bottom: 35px;
    }
    .social-title {
      font-weight: 600;
      margin-bottom: 20px;
      font-size: 15px;
      color: #1d1d1f;
    }
    .social-links a {
      display: inline-block;
      margin: 0 15px;
      transition: transform 0.2s ease;
    }
    .social-links a:hover {
      transform: scale(1.15);
    }
    .social-links img {
      width: 40px;
      height: 40px;
    }
    
    /* Section des œuvres avec bordure simple */
    .oeuvres-section {
      margin: 35px 0;
      padding: 25px 0;
      border-top: 1px solid #e5e5e5;
      border-bottom: 1px solid #e5e5e5;
    }
    .oeuvres-title {
      font-weight: 600;
      margin-bottom: 20px;
      font-size: 15px;
      color: #1d1d1f;
    }
    .oeuvres-links {
      display: flex;
      justify-content: center;
      gap: 50px;
      flex-wrap: wrap;
    }
    .oeuvres-links a {
      text-decoration: none;
      color: #6e6e73;
      transition: color 0.2s ease;
    }
    .oeuvres-links a:hover {
      color: #0071e3;
    }
    
    /* Contact section */
    .footer-contact {
      margin: 30px 0;
      line-height: 1.8;
    }
    .footer-contact strong {
      color: #1d1d1f;
      font-size: 14px;
    }
    .footer-contact a {
      color: #0071e3;
      text-decoration: none;
    }
    .footer-contact a:hover {
      text-decoration: underline;
    }
    
    /* Section légale avec bordure simple */
    .legal-text {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
    }
    .security-note, .address, .copyright, .tracking {
      max-width: 450px;
      margin-left: auto;
      margin-right: auto;
    }
    .security-note { font-size: 12px; color: #a1a1a6; font-style: italic; margin-bottom: 20px; line-height: 1.5; }
    .address { font-size: 13px; color: #6e6e73; margin-bottom: 15px; }
    .copyright { font-size: 12px; color: #a1a1a6; margin-bottom: 10px; }
    .tracking { font-size: 11px; color: #c1c1c6; word-wrap: break-word; word-break: break-all; margin-top: 15px; }
    
    /* Responsive */
    @media screen and (max-width: 480px) {
      .email-content { border-radius: 0; }
      .header { padding: 25px 0 0; }
      .header img { width: 50px; height: 50px; }
      .body-section { padding: 15px 25px 35px; font-size: 16px; }
      .body-section h1 { font-size: 26px; }
      .btn-primary { padding: 16px 35px; font-size: 16px; }
      .footer { padding: 30px 20px; }
      .social-links a { margin: 0 10px; }
      .social-links img { width: 35px; height: 35px; }
      .oeuvres-links { gap: 30px; }
    }
    
    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      body { background: #000; color: #e1e1e1; }
      .email-content { background: #1c1c1e; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
      .header, .footer { background: #1c1c1e; }
      .devise, .oeuvres-section, .legal-text, .footer { border-color: #38383a; }
      .body-section { color: #d1d1d6; }
      .body-section h1 { color: #f5f5f7; }
      .small-text, .devise-text { color: #86868b; }
      .devise-text span { color: #d4af37; }
      .footer { color: #86868b; }
      .footer-brand-text { color: #f5f5f7; }
      .social-title, .oeuvres-title, .footer-contact strong { color: #d1d1d6; }
    }
  </style>
</head>
<body>
  <div style="display:none;max-height:0;max-width:0;opacity:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff;">
    Votre voyage commence avec Christ en Nous - Confirmez votre compte maintenant.
  </div>

  <div class="email-wrapper">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" class="email-content" border="0" cellpadding="0" cellspacing="0" width="100%">
            
            <tr>
              <td class="header">
                <img src="https://app-christ-en-nous.web.app/assets/logoP.png" alt="Logo Christ en Nous" />
              </td>
            </tr>

            <tr>
              <td class="body-section">
                <h1><span class="highlight">Shalom</span>, {{PRENOM}}</h1>
                
                <p>
                  Nous sommes ravis de vous compter parmi nous ! Votre compte est presque prêt.
                </p>
                
                <p>
                  Pour finaliser votre inscription et accéder à toutes nos fonctionnalités — programmes, groupes de discussion et ressources spirituelles — il vous suffit de valider votre adresse e-mail. C'est la dernière étape !
                </p>

                <div class="btn-container">
                  <a href="{{VERIFICATION_LINK}}" class="btn-primary" target="_blank" rel="noopener noreferrer">
                    Je confirme mon compte
                  </a>
                </div>

                <p class="small-text">
                  Si le bouton ne fonctionne pas, <a href="{{VERIFICATION_LINK}}" target="_blank" rel="noopener noreferrer">cliquez ici</a> pour confirmer votre compte.<br/>
                  Ce lien est à usage unique et expire dans 24 heures.
                </p>
                
                <div class="devise">
                  <div class="devise-text">
                    Servir <span>•</span> Faire des Disciples <span>•</span> Évangéliser
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td class="footer">
                <div class="footer-brand">
                  <img src="https://app-christ-en-nous.web.app/assets/logoP.png" alt="Logo Christ En Nous" />
                  <div class="footer-brand-text">
                    Christ <span class="highlight">En Nous</span>
                  </div>
                </div>

                <div class="social-section">
                  <div class="social-title">Suivez-nous</div>
                  <div class="social-links">
                    <a href="https://facebook.com/ChristEnNous" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                      <img src="https://img.icons8.com/fluent/48/000000/facebook-new.png" alt="Facebook" />
                    </a>
                    <a href="https://wa.me/23675535338" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                      <img src="https://img.icons8.com/fluent/48/000000/whatsapp.png" alt="WhatsApp" />
                    </a>
                    <a href="https://www.youtube.com/@ChristEnNous" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                      <img src="https://img.icons8.com/fluent/48/000000/youtube-play.png" alt="YouTube" />
                    </a>
                    <a href="https://www.tiktok.com/@christennous" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                      <img src="https://img.icons8.com/fluent/48/000000/tiktok.png" alt="TikTok" />
                    </a>
                    <a href="https://www.linkedin.com/company/christ-en-nous" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                      <img src="https://img.icons8.com/fluent/48/000000/linkedin.png" alt="LinkedIn" />
                    </a>
                  </div>
                </div>

                <div class="oeuvres-section">
                  <div class="oeuvres-title">Œuvres et Mission</div>
                  <div class="oeuvres-links">
                    <a href="https://www.facebook.com/share/19DuvUTySP/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
                      <img src="https://app-christ-en-nous.web.app/assets/markos.png" alt="Logo Markos" width="120" style="display:block; margin:0 auto 10px;" />
                      <div>Markos, Ministère des Jeunes</div>
                    </a>
                    <a href="https://www.facebook.com/share/18GJU7N7RL/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
                      <img src="https://app-christ-en-nous.web.app/assets/mission.png" alt="Logo Mission" width="55" style="display:block; margin:0 auto 10px;" />
                      <div>Bonnes Œuvres Internationales</div>
                    </a>
                  </div>
                </div>

                <div class="footer-contact">
                  <strong>Contacts & Support</strong><br />
                  Support technique : <a href="mailto:teamsupport@christennous.com">teamsupport@christennous.com</a><br />
                  Administration : <a href="mailto:admin@christennous.com">admin@christennous.com</a><br />
                  Téléphone : +236 75 53 53 38 / +236 72 53 01 01
                </div>

                <div class="legal-text">
                  <div class="security-note">
                    Pour votre sécurité, ne partagez jamais vos liens de confirmation ou vos informations de connexion. Notre équipe ne vous demandera jamais votre mot de passe.
                  </div>
                  
                  <div class="address">
                    République Centrafricaine, Bangui, Sica 3 Pont Castor
                  </div>
                  
                  <div class="copyright">
                    &copy; 2025 Christ En Nous. Tous droits réservés.
                  </div>
                  
                  <div class="tracking">
                    Envoyé à {{EMAIL}} le {{TIMESTAMP}} (ID: {{MESSAGE_ID}})
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

/**
 * ✅ Version texte simple pour compatibilité anti-spam
 */
export const VERIFICATION_EMAIL_TEXT_TEMPLATE = `
Shalom {{PRENOM}},

Nous sommes ravis de vous compter parmi nous ! Votre compte est presque prêt.

Pour finaliser votre inscription et accéder à toutes nos fonctionnalités — programmes, groupes de discussion et ressources spirituelles — il vous suffit de valider votre adresse e-mail.

Cliquez sur ce lien pour confirmer votre compte :
{{VERIFICATION_LINK}}

Ce lien est à usage unique et expire dans 24 heures.

Servir • Faire des Disciples • Évangéliser

---
Christ En Nous

Suivez-nous :
• Facebook : https://facebook.com/ChristEnNous
• WhatsApp : https://wa.me/23675535338
• YouTube : https://www.youtube.com/@ChristEnNous
• TikTok : https://www.tiktok.com/@christennous
• LinkedIn : https://www.linkedin.com/company/christ-en-nous

Œuvres et Mission :
• Markos, Ministère des Jeunes
• Bonnes Œuvres Internationales

Support technique : teamsupport@christennous.com
Administration : admin@christennous.com
Téléphone : +236 75 53 53 38 / +236 72 53 01 01

République Centrafricaine, Bangui, Sica 3 Pont Castor
© 2025 Christ En Nous. Tous droits réservés.

Envoyé à {{EMAIL}} le {{TIMESTAMP}} (ID: {{MESSAGE_ID}})
`;

/**
 * ✅ Interface TypeScript pour les variables du template
 */
export interface TemplateVariables {
  prenom: string;
  verificationLink: string;
  email: string;
  timestamp: string;
  messageId: string;
  unsubscribeLink?: string; // Optionnel pour compatibilité
}

/**
 * ✅ Fonction utilitaire pour remplacer les variables
 */
export function replaceTemplateVariables(
  template: string,
  data: TemplateVariables
): string {
  return template
    .replace(/{{PRENOM}}/g, data.prenom)
    .replace(/{{VERIFICATION_LINK}}/g, data.verificationLink)
    .replace(/{{EMAIL}}/g, data.email)
    .replace(/{{TIMESTAMP}}/g, data.timestamp)
    .replace(/{{MESSAGE_ID}}/g, data.messageId)
    .replace(/{{UNSUBSCRIBE_LINK}}/g, data.unsubscribeLink || '');
}

/**
 * ✅ Fonction pour générer l'email complet avec les variables
 */
export function generateVerificationEmail(
  data: TemplateVariables,
  format: 'html' | 'text' = 'html'
): string {
  const template = format === 'html' 
    ? VERIFICATION_EMAIL_HTML_TEMPLATE 
    : VERIFICATION_EMAIL_TEXT_TEMPLATE;
  
  return replaceTemplateVariables(template, data);
}

/**
 * ✅ Configuration de l'email pour votre service
 */
export const VERIFICATION_EMAIL_CONFIG = {
  subject: 'Confirmez votre compte - Christ En Nous',
  from: {
    name: 'Christ En Nous',
    email: 'noreply@christennous.com'
  },
  replyTo: 'teamsupport@christennous.com',
  headers: {
    'X-Priority': '1',
    'X-MSMail-Priority': 'High',
    'Importance': 'high'
  }
};
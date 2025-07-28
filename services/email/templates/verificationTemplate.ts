// services/email/templates/verificationTemplate.ts

/**
 * ✅ Template HTML exporté comme string constant.
 * Version 5.1 : Design "Tech Épuré" finalisé avec logo centré et footer complet.
 * Le meilleur équilibre entre minimalisme et information professionnelle.
 */
export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vérifiez votre compte</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        /* Base & Reset */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; display: block; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f4f5; /* Light gray background, like GitHub/Apple */ }
        a { color: #18181b; text-decoration: underline; font-weight: 500; }

        /* Font & Text */
        body, table, td, p, a {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        h1 { font-weight: 700; margin: 0 0 24px; }
        p { font-weight: 400; margin: 0 0 24px; }

        /* Main Container: The "Card" */
        .card {
            max-width: 580px;
            margin: 40px auto;
            background-color: #ffffff;
            border: 1px solid #e4e4e7; /* Subtle border */
            border-radius: 12px; /* Softer corners */
            overflow: hidden;
        }

        /* Header: Minimalist Logo Centered */
        .header { padding: 32px 40px 24px; text-align: center; }
        .logo { width: 48px; height: 48px; margin: 0 auto; }

        /* Content */
        .content { padding: 0 40px 24px; }
        .content h1 { font-size: 24px; color: #18181b; }
        .content p { font-size: 16px; line-height: 1.6; color: #52525b; }
        
        /* Button */
        .button {
            display: inline-block;
            background-color: #18181b; /* Strong, modern black */
            color: #ffffff;
            font-size: 15px;
            font-weight: 500;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
        }
        
        /* Divider & Footer */
        .divider { padding: 0 40px; }
        .hr { border: 0; border-top: 1px solid #e4e4e7; width: 100%; margin: 0; }

        .footer { padding: 24px 40px 32px; text-align: center; }
        .footer p {
            font-size: 13px;
            line-height: 1.6;
            color: #71717a;
            margin: 0 0 16px;
        }
        .footer .motto { color: #a1a1aa; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; margin-bottom: 24px; }
        .footer .contact-block { margin-top: 24px; }
        .footer .contact-block p { margin-bottom: 8px; }
        .footer .copyright { font-size: 12px; color: #a1a1aa; margin-top: 24px; margin-bottom: 0; }


        /* Responsive */
        @media screen and (max-width: 600px) {
            body { background-color: #ffffff; }
            .card { width: 100% !important; margin: 0 !important; border: none !important; border-radius: 0 !important; }
            .header { padding: 24px 24px 16px !important; }
            .content, .divider, .footer { padding-left: 24px !important; padding-right: 24px !important; }
        }
    </style>
</head>
<body>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td style="background-color: #f4f4f5;">
                <div class="card">
                    <div class="header">
                        <img src="https://app-christ-en-nous.web.app/assets/logoP.png" alt="Logo Christ en Nous" class="logo">
                    </div>
                    
                    <div class="content">
                        <h1>Vérifiez votre adresse e-mail</h1>
                        <p>
                            Pour finaliser la création de votre compte, veuillez cliquer sur le bouton ci-dessous. Ce lien est valide pendant 24 heures.
                        </p>
                        <p>
                            <a href="{{VERIFICATION_LINK}}" target="_blank" class="button">Confirmer le compte</a>
                        </p>
                    </div>

                    <div class="divider">
                        <div class="hr"></div>
                    </div>

                    <div class="footer">
                        <p class="motto">ÉVANGELISER &bull; FAIRE DES DISCIPLES &bull; SERVIR</p>
                        <p>
                            <strong>Un problème ? Une question ? Contactez-nous.</strong>
                        </p>
                        <div class="contact-block">
                            <p>Support Technique : <a href="mailto:teamsupport@christennous.com">teamsupport@christennous.com</a></p>
                            <p>Administration : <a href="mailto:admin@christennous.com">admin@christennous.com</a></p>
                            <p>Conseil & Suivi Pastoral : <a href="mailto:Pasteur-Principal@christennous.com">Pasteur-Principal@christennous.com</a></p>
                        </div>

                        <div class="contact-block">
                            <p>
                                <strong>Christ en Nous International Ministries</strong><br>
                                Bangui, République Centrafricaine (SICA 3)<br>
                                Nantes, France
                            </p>
                        </div>
                        
                        <p class="copyright">
                            © 2025 Christ en Nous. Tous droits réservés.<br>
                            Cet e-mail a été envoyé à {{PRENOM_EMAIL}} suite à votre inscription.
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
`;
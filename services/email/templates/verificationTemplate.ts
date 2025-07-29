// services/email/templates/verificationTemplate.ts

/**
 * ✅ Template HTML Ultra Épuré - Style Apple Morphisme
 * Version 6.0 : Design révolutionnaire avec identité Christ en Nous
 * Morphisme authentique, animations haptiques, typography Apple
 */
export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmez votre compte - Christ en Nous</title>
    <style>
        /* ==========================================
           🍎 BASE RESET & APPLE TYPOGRAPHY
           ========================================== */
        * { box-sizing: border-box; }
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; display: block; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-feature-settings: 'kern' 1;
            text-rendering: optimizeLegibility;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
        }

        /* ==========================================
           🎨 CHRIST EN NOUS BRAND COLORS
           ========================================== */
        :root {
            --christ-blue-primary: #1e3a8a;
            --christ-blue-secondary: #3b82f6;
            --christ-blue-light: #dbeafe;
            --christ-gold: #fbbf24;
            --christ-gold-light: #fef3c7;
            --christ-white: #ffffff;
            --christ-gray-50: #f8fafc;
            --christ-gray-100: #f1f5f9;
            --christ-gray-200: #e2e8f0;
            --christ-gray-300: #cbd5e1;
            --christ-gray-400: #94a3b8;
            --christ-gray-500: #64748b;
            --christ-gray-600: #475569;
            --christ-gray-700: #334155;
            --christ-gray-800: #1e293b;
            --christ-gray-900: #0f172a;
        }

        /* ==========================================
           🌟 MORPHISM CONTAINER
           ========================================== */
        .email-wrapper {
            padding: 20px;
            max-width: 100%;
        }

        .morphism-card {
            max-width: 480px;
            margin: 60px auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 28px;
            box-shadow: 
                0 8px 32px rgba(30, 58, 138, 0.12),
                0 2px 16px rgba(30, 58, 138, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.4);
            overflow: hidden;
            position: relative;
        }

        .morphism-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
        }

        /* ==========================================
           ✨ ANIMATED HEADER
           ========================================== */
        .header-section {
            padding: 50px 40px 30px;
            text-align: center;
            position: relative;
            background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%);
        }

        .logo-container {
            position: relative;
            display: inline-block;
            margin-bottom: 24px;
        }

        .logo-glow {
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            background: radial-gradient(circle, rgba(30, 58, 138, 0.15) 0%, transparent 70%);
            border-radius: 50%;
            animation: gentle-pulse 4s ease-in-out infinite;
        }

        @keyframes gentle-pulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.05); opacity: 0.8; }
        }

        .christ-logo {
            width: 72px;
            height: 72px;
            position: relative;
            background: var(--christ-white);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 
                0 8px 25px rgba(30, 58, 138, 0.15),
                0 2px 10px rgba(30, 58, 138, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.6);
            border: 2px solid rgba(248, 250, 252, 0.8);
            z-index: 2;
            position: relative;
        }

        .logo-letter {
            width: 54px;
            height: 54px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Logo "C" avec cercles concentriques améliorés */
        .logo-letter::before {
            content: '';
            position: absolute;
            width: 54px;
            height: 54px;
            border: 7px solid var(--christ-blue-primary);
            border-right: 7px solid transparent;
            border-radius: 50%;
            transform: rotate(-45deg);
        }

        .logo-letter::after {
            content: '';
            position: absolute;
            width: 32px;
            height: 32px;
            border: 5px solid var(--christ-blue-secondary);
            border-right: 5px solid transparent;
            border-radius: 50%;
            transform: rotate(-45deg);
        }

        .brand-title {
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(135deg, var(--christ-blue-primary) 0%, var(--christ-blue-secondary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0 0 8px 0;
            letter-spacing: -0.5px;
        }

        .brand-subtitle {
            font-size: 11px;
            font-weight: 600;
            color: var(--christ-gray-500);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin: 0;
        }

        /* ==========================================
           📝 CONTENT SECTION
           ========================================== */
        .content-section {
            padding: 40px 40px 30px;
            text-align: center;
        }

        .welcome-badge {
            display: inline-flex;
            align-items: center;
            background: linear-gradient(135deg, var(--christ-gold-light) 0%, rgba(251, 191, 36, 0.1) 100%);
            border: 1px solid rgba(251, 191, 36, 0.2);
            border-radius: 20px;
            padding: 8px 16px;
            margin-bottom: 24px;
            font-size: 12px;
            font-weight: 600;
            color: var(--christ-gray-700);
            letter-spacing: 0.5px;
        }

        .welcome-badge::before {
            content: '✨';
            margin-right: 6px;
            font-size: 14px;
        }

        .main-heading {
            font-size: 28px;
            font-weight: 800;
            color: var(--christ-gray-900);
            margin: 0 0 16px 0;
            letter-spacing: -0.8px;
            line-height: 1.2;
        }

        .description-text {
            font-size: 16px;
            font-weight: 400;
            color: var(--christ-gray-600);
            line-height: 1.5;
            margin: 0 0 36px 0;
            letter-spacing: -0.2px;
        }

        /* ==========================================
           🚀 MORPHISM BUTTON (HAPTIQUE)
           ========================================== */
        .button-container {
            margin-bottom: 20px;
        }

        .morphism-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--christ-blue-primary) 0%, var(--christ-blue-secondary) 100%);
            color: var(--christ-white);
            text-decoration: none;
            font-size: 16px;
            font-weight: 600;
            padding: 18px 40px;
            border-radius: 16px;
            min-width: 200px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 
                0 4px 20px rgba(30, 58, 138, 0.25),
                0 2px 8px rgba(30, 58, 138, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            letter-spacing: 0.2px;
        }

        .morphism-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }

        .morphism-button:hover::before {
            left: 100%;
        }

        .morphism-button:hover {
            transform: translateY(-2px);
            box-shadow: 
                0 6px 25px rgba(30, 58, 138, 0.3),
                0 4px 12px rgba(30, 58, 138, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .morphism-button:active {
            transform: translateY(0);
            transition: transform 0.1s;
        }

        .button-icon {
            margin-left: 8px;
            font-size: 18px;
            transition: transform 0.3s ease;
        }

        .morphism-button:hover .button-icon {
            transform: translateX(2px);
        }

        .security-note {
            font-size: 13px;
            color: var(--christ-gray-500);
            margin: 0;
            font-weight: 500;
        }

        /* ==========================================
           🎯 MISSION DIVIDER
           ========================================== */
        .mission-divider {
            padding: 30px 40px;
            text-align: center;
            position: relative;
        }

        .mission-divider::before {
            content: '';
            position: absolute;
            top: 0;
            left: 40px;
            right: 40px;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--christ-gray-200), transparent);
        }

        .mission-text {
            font-size: 10px;
            font-weight: 700;
            color: var(--christ-gray-400);
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 0;
            position: relative;
            background: var(--christ-white);
            padding: 0 20px;
            display: inline-block;
        }

        /* ==========================================
           📱 FOOTER SECTION
           ========================================== */
        .footer-section {
            padding: 30px 40px 40px;
            text-align: center;
            background: linear-gradient(135deg, rgba(248, 250, 252, 0.4) 0%, rgba(241, 245, 249, 0.2) 100%);
        }

        .footer-text {
            font-size: 12px;
            color: var(--christ-gray-500);
            line-height: 1.4;
            margin: 0 0 16px 0;
            font-weight: 500;
        }

        .footer-link {
            color: var(--christ-blue-primary);
            text-decoration: none;
            font-weight: 600;
        }

        .footer-link:hover {
            color: var(--christ-blue-secondary);
        }

        .company-info {
            font-size: 11px;
            color: var(--christ-gray-400);
            font-weight: 500;
            margin: 0;
        }

        /* ==========================================
           📱 RESPONSIVE MAGIC
           ========================================== */
        @media screen and (max-width: 600px) {
            .email-wrapper { padding: 10px; }
            
            .morphism-card { 
                margin: 20px auto; 
                border-radius: 20px;
            }
            
            .header-section { padding: 40px 30px 25px; }
            .content-section { padding: 30px 30px 25px; }
            .mission-divider { padding: 25px 30px; }
            .footer-section { padding: 25px 30px 35px; }
            
            .main-heading { font-size: 24px; }
            .description-text { font-size: 15px; }
            .morphism-button { padding: 16px 32px; font-size: 15px; }
            
            .christ-logo { width: 64px; height: 64px; }
            .logo-letter { width: 48px; height: 48px; }
            .logo-letter::before { width: 48px; height: 48px; border-width: 6px; border-right: 6px solid transparent; }
            .logo-letter::after { width: 28px; height: 28px; border-width: 4px; border-right: 4px solid transparent; }
        }

        /* ==========================================
           🌟 SUBTLE ANIMATIONS
           ========================================== */
        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .morphism-card {
            animation: fade-in-up 0.8s ease-out;
        }

        /* ==========================================
           🎨 GLASS EFFECT ENHANCEMENTS
           ========================================== */
        .morphism-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
            pointer-events: none;
            border-radius: 28px;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="morphism-card">
            
            <!-- ✨ HEADER AVEC LOGO ANIMÉ -->
            <div class="header-section">
                <div class="logo-container">
                    <div class="logo-glow"></div>
                    <div class="christ-logo">
                        <div class="logo-letter"></div>
                    </div>
                </div>
                <h1 class="brand-title">Christ en Nous</h1>
                <p class="brand-subtitle">International Ministries</p>
            </div>

            <!-- 📝 CONTENU PRINCIPAL -->
            <div class="content-section">
                <div class="welcome-badge">Bienvenue dans la famille</div>
                
                <h2 class="main-heading">Confirmez votre compte</h2>
                
                <p class="description-text">
                    Un clic suffit pour finaliser votre inscription et rejoindre notre communauté spirituelle.
                </p>

                <div class="button-container">
                    <a href="{{VERIFICATION_LINK}}" class="morphism-button" target="_blank">
                        Activer mon compte
                        <span class="button-icon">→</span>
                    </a>
                </div>

                <p class="security-note">
                    Ce lien expire dans 24 heures pour votre sécurité
                </p>
            </div>

            <!-- 🎯 MISSION -->
            <div class="mission-divider">
                <p class="mission-text">Évangéliser • Faire des Disciples • Servir</p>
            </div>

            <!-- 📱 FOOTER -->
            <div class="footer-section">
                <p class="footer-text">
                    Besoin d'aide ? Contactez notre équipe : 
                    <a href="mailto:teamsupport@christennous.com" class="footer-link">teamsupport@christennous.com</a>
                </p>
                
                <p class="company-info">
                    Christ en Nous International Ministries<br>
                    Bangui • Nantes • © 2025
                </p>
            </div>

        </div>
    </div>
</body>
</html>
`;
// ============================================================================
// 📁 src/index.ts - VERSION DÉFINITIVE AVEC TYPES ANY
// ============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { emailService } from './services/email/emailService';

// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// --- Interface pour le body de la requête ---
interface SendEmailRequest {
  userId: string;
  email: string;
  prenom: string;
  nom: string;
}

// 🎯 NOUVEAU : Interface pour l'email de bienvenue
interface SendWelcomeEmailRequest {
  userId: string;
  email: string;
  prenom: string;
  nom: string;
}

// --- Route de santé pour Cloud Run ---
app.get('/health', (req: any, res: any) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Email API is running',
    timestamp: new Date().toISOString()
  });
});

// --- Route racine ---
app.get('/', (req: any, res: any) => {
  res.status(200).json({ 
    message: 'Christ en Nous - Email API v1.0',
    endpoints: {
      health: '/health',
      sendEmail: 'POST /api/send-email',
      sendWelcomeEmail: 'POST /api/send-welcome-email'
    }
  });
});

// --- Route d'envoi d'e-mail de vérification ---
app.post('/api/send-email', async (req: any, res: any) => {
  try {
    const { userId, email, prenom, nom } = req.body as SendEmailRequest;

    // Validation des champs requis
    if (!userId || !email || !prenom || !nom) {
      return res.status(400).json({ 
        error: 'Missing required fields in request body',
        required: ['userId', 'email', 'prenom', 'nom']
      });
    }

    console.log(`[API] Requête reçue pour envoyer un e-mail à ${email}`);
    
    // Envoi de l'email via le service
    const success = await emailService.sendCustomVerificationEmail({ 
      userId, 
      email, 
      prenom, 
      nom 
    });

    if (success) {
      return res.status(200).json({ 
        message: 'Email sent successfully!',
        recipient: email
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to send email' 
      });
    }
    
  } catch (error) {
    console.error(`[API] Erreur lors du traitement de la requête:`, error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// 🎯 NOUVELLE ROUTE : Email de bienvenue après vérification
app.post('/api/send-welcome-email', async (req: any, res: any) => {
  try {
    const { userId, email, prenom, nom } = req.body as SendWelcomeEmailRequest;

    // Validation des champs requis
    if (!userId || !email || !prenom) {
      return res.status(400).json({ 
        error: 'Missing required fields in request body',
        required: ['userId', 'email', 'prenom', 'nom']
      });
    }

    console.log(`[API] 🎉 Requête email de bienvenue reçue pour ${email}`);
    
    // Envoi de l'email de bienvenue via le service
    const success = await emailService.sendWelcomeEmail({ 
      userId, 
      email, 
      prenom, 
      nom: nom || '' // nom optionnel
    });

    if (success) {
      return res.status(200).json({ 
        message: 'Welcome email sent successfully!',
        recipient: email,
        type: 'welcome'
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to send welcome email' 
      });
    }
    
  } catch (error) {
    console.error(`[API] ❌ Erreur envoi email bienvenue:`, error);
    return res.status(500).json({ 
      error: 'Internal server error while sending welcome email' 
    });
  }
});

// --- Démarrage du serveur ---
const server = app.listen(PORT, () => {
  console.log(`🎉 Christ en Nous Email API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export default app;
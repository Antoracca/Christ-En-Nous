// services/email/emailService.ts
export async function sendCustomVerificationEmail(userData: {
  userId: string;
  email: string;
  prenom: string;
  nom: string;
}): Promise<boolean> {
  
  const EMAIL_API_URL = 'https://email-api-649301029359.europe-west1.run.app';
  
  console.log(`🚀 Appel de l'API pour envoyer un e-mail à ${userData.email}`);

  try {
    // ✅ CORRECTION : Ajouter l'endpoint /api/send-email
    const response = await fetch(`${EMAIL_API_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email envoyé avec succès:', result);
      return true;
    } else {
      const errorData = await response.json();
      console.error('❌ Erreur lors de l\'appel de l\'API:', response.status);
      console.error('🔍 Détails:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur technique lors de l\'appel de l\'API:', error);
    return false;
  }
}
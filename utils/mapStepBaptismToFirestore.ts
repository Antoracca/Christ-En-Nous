export interface BaptismAnswers {
  baptise: 'oui' | 'non' | '';
  immersion: 'oui' | 'non' | '';
  desire: 'oui' | 'non' | '';
}

export interface BaptismMapped {
  isBaptized: boolean;
  baptizedByImmersion: boolean | null;
  wantsToBeBaptized: boolean | null;
  baptismStatus: string;
}

/**
 * Convertit les réponses utilisateur en structure prête pour Firestore
 * en tenant compte du genre (inclusif) et de l’état spirituel.
 */
export function mapStepBaptismToFirestore(answers: BaptismAnswers): BaptismMapped {
  const isBaptized = answers.baptise === 'oui';

  let baptizedByImmersion: boolean | null = null;
  let wantsToBeBaptized: boolean | null = null;
  let baptismStatus = '';

  if (!isBaptized) {
    // Non baptisé(e)
    baptizedByImmersion = null;
    wantsToBeBaptized = answers.desire === 'oui';

    baptismStatus = wantsToBeBaptized
      ? '✝️ Non baptisé(e) – souhaite l’être'
      : '❌ Non baptisé(e) – ne souhaite pas (encore) l’être';
  } else {
    // Déjà baptisé(e)
    baptizedByImmersion = answers.immersion === 'oui';

    if (baptizedByImmersion) {
      wantsToBeBaptized = false;
      baptismStatus = '✅ Déjà baptisé(e) par immersion – aucun rebaptême nécessaire';
    } else {
      wantsToBeBaptized = answers.desire === 'oui';

      baptismStatus = wantsToBeBaptized
        ? '♻️ Baptisé(e) sans immersion – souhaite recevoir un rebaptême par immersion'
        : '✅ Baptisé(e) sans immersion – ne souhaite pas être rebaptisé(e)';
    }
  }

  return {
    isBaptized,
    baptizedByImmersion,
    wantsToBeBaptized,
    baptismStatus,
  };
}

// fix-all-errors-complete.js - Correction COMPLÈTE de toutes les erreurs
const fs = require('fs');
const path = require('path');

console.log('🔧 Correction COMPLÈTE de toutes les erreurs de migration...\n');

// Liste de TOUS les fichiers à corriger
const filesToFix = [
  // Auth screens
  'app/(auth)/change-email.tsx',
  'app/(auth)/change-password.tsx',
  'app/(auth)/forgot-password.tsx',
  'app/(auth)/login.tsx',
  'app/(auth)/register.tsx',
  'app/(auth)/post-email-change.tsx',

  // Modals
  'app/(modals)/security.tsx',

  // Tabs
  'app/(tabs)/bible/index.tsx',
  'app/(tabs)/bible/reader.tsx',
  'app/(tabs)/bible/version-selector.tsx',
  'app/(tabs)/profile.tsx',

  // Old screens (aussi à corriger)
  'app/screens/auth/ChangeEmailScreen.tsx',
  'app/screens/auth/ChangePasswordScreen.tsx',
  'app/screens/auth/PostEmailChangeScreen.tsx',
  'app/screens/auth/RegisterScreen.tsx',
  'app/screens/auth/SocialNetworks.tsx',
  'app/screens/home/HomeMenuModal.android.tsx'
];

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Fichier non trouvé: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  // 1. SUPPRIMER les imports @/navigation/types
  content = content.replace(/import\s+.*\s+from\s+['"]@\/navigation\/types['"];?\n/g, '');
  content = content.replace(/import\s+type\s+\{[^}]+\}\s+from\s+['"]@\/navigation\/types['"];?\n/g, '');

  // 2. SUPPRIMER les imports NativeStackNavigationProp
  content = content.replace(/import\s+type\s+\{\s*NativeStackNavigationProp\s*\}\s+from\s+['"]@react-navigation\/native-stack['"];?\n/g, '');

  // 3. CORRIGER les imports firebaseConfig
  content = content.replace(/from\s+['"]services\/firebase\/firebaseConfig['"]/g, "from '../../../services/firebase/firebaseConfig'");
  content = content.replace(/from\s+['"]\.\.\/\.\.\/\.\.\/services\/firebase\/firebaseConfig['"]/g, "from '../../../services/firebase/firebaseConfig'");

  // 4. CORRIGER les imports register steps (depuis app/(auth)/register.tsx)
  if (filePath.includes('app/(auth)/register.tsx')) {
    content = content.replace(/from\s+['"]\.\.\/\.\.\/components\/register\/steps\//g, "from '../components/register/steps/");
  }

  // 5. CORRIGER les imports Bible components (depuis app/(tabs)/bible/reader.tsx)
  if (filePath.includes('app/(tabs)/bible/reader.tsx')) {
    content = content.replace(/from\s+['"]\.\/(BibleReader|BibleNavigation|BibleSearch|BibleProgressModal|AIModalScreen)['"]/g,
      (match, componentName) => `from '../../screens/bible/${componentName}'`);
  }

  // 6. AJOUTER l'import useRouter si manquant mais utilisé
  const usesRouter = content.includes('useRouter()') || content.includes('router.push') || content.includes('router.replace') || content.includes('router.back');
  const hasRouterImport = content.includes("from 'expo-router'");

  if (usesRouter && !hasRouterImport) {
    // Trouver la dernière ligne d'import
    const lines = content.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, "import { useRouter } from 'expo-router';");
      content = lines.join('\n');
    }
  }

  // 7. AJOUTER l'import useLocalSearchParams si params est utilisé
  const usesParams = content.includes('params.') || content.includes('useLocalSearchParams()');
  const hasParamsImport = content.includes('useLocalSearchParams');

  if (usesParams && !hasParamsImport && hasRouterImport) {
    // Ajouter à l'import expo-router existant
    content = content.replace(
      /import\s+\{\s*useRouter\s*\}\s+from\s+['"]expo-router['"]/,
      "import { useRouter, useLocalSearchParams } from 'expo-router'"
    );
  } else if (usesParams && !hasParamsImport && !hasRouterImport) {
    const lines = content.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, "import { useRouter, useLocalSearchParams } from 'expo-router';");
      content = lines.join('\n');
    }
  }

  // 8. REMPLACER useNavigation par useRouter
  content = content.replace(/const\s+navigation\s*=\s*useNavigation<[^>]+>\(\)/g, 'const router = useRouter()');
  content = content.replace(/const\s+navigation\s*=\s*useNavigation\(\)/g, 'const router = useRouter()');

  // 9. AJOUTER const params = useLocalSearchParams() si params utilisé mais non défini
  if (usesParams && !content.includes('const params =') && content.includes('useLocalSearchParams')) {
    // Chercher la fonction component principale
    const funcMatch = content.match(/export default function \w+\([^)]*\)\s*\{/);
    if (funcMatch) {
      const funcStart = content.indexOf(funcMatch[0]);
      const funcBodyStart = funcStart + funcMatch[0].length;

      // Vérifier si const params n'existe pas déjà dans les 200 premiers caractères
      const snippet = content.slice(funcBodyStart, funcBodyStart + 300);
      if (!snippet.includes('const params')) {
        // Insérer const params après les autres const
        const lines = content.split('\n');
        let insertLine = -1;

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('export default function')) {
            // Chercher la première ligne const après cette fonction
            for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
              if (lines[j].trim().startsWith('const ') && lines[j].includes('use')) {
                insertLine = j + 1;
                break;
              }
            }
            break;
          }
        }

        if (insertLine !== -1) {
          lines.splice(insertLine, 0, '  const params = useLocalSearchParams();');
          content = lines.join('\n');
        }
      }
    }
  }

  // 10. REMPLACER navigation. par router.
  content = content.replace(/([^a-zA-Z_])navigation\./g, '$1router.');

  // 11. SUPPRIMER les lignes useNavigation non utilisées
  content = content.replace(/import\s+\{\s*useNavigation\s*\}\s+from\s+['"]@react-navigation\/native['"];?\n/g, '');

  // 12. SUPPRIMER useRoute si non utilisé
  if (!content.includes('useRoute()') && !content.includes('const route =')) {
    content = content.replace(/import\s+\{\s*useRoute[^}]*\}\s+from\s+['"]@react-navigation\/native['"];?\n/g, '');
  }

  // Écrire si modifié
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath}`);
    return true;
  }

  return false;
}

// Exécuter
let fixed = 0;
filesToFix.forEach(file => {
  if (fixFile(file)) {
    fixed++;
  }
});

console.log(`\n✨ ${fixed} fichiers corrigés!`);
console.log('\n🔍 Vérification des erreurs restantes...');

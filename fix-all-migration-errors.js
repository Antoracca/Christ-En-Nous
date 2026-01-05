// fix-all-migration-errors.js - Corriger TOUTES les erreurs de migration Expo Router
const fs = require('fs');
const path = require('path');

const fixes = [
  // 1. CORRIGER LES IMPORTS FIREBASE CONFIG
  {
    files: ['app/(auth)/register.tsx'],
    replacements: [
      {
        from: /from ['"]\.\.\/\.\.\/\.\.\/services\/firebase\/firebaseConfig['"]/g,
        to: "from '../../../services/firebase/firebaseConfig'"
      }
    ]
  },

  // 2. CORRIGER LES IMPORTS REGISTER STEPS
  {
    files: ['app/(auth)/register.tsx'],
    replacements: [
      {
        from: /from ['"]\.\.\/\.\.\/components\/register\/steps\//g,
        to: "from '../components/register/steps/"
      }
    ]
  },

  // 3. CORRIGER LES IMPORTS BIBLE COMPONENTS DANS READER.TSX
  {
    files: ['app/(tabs)/bible/reader.tsx'],
    replacements: [
      {
        from: /from ['"]\.\/(BibleReader|BibleNavigation|BibleSearch|BibleProgressModal|AIModalScreen)['"]/g,
        to: (match, componentName) => `from '../../screens/bible/${componentName}'`
      }
    ]
  },

  // 4. AJOUTER IMPORTS useRouter ET useLocalSearchParams
  {
    files: [
      'app/(auth)/change-email.tsx',
      'app/(auth)/change-password.tsx',
      'app/(auth)/forgot-password.tsx',
      'app/(auth)/login.tsx',
      'app/(auth)/register.tsx',
      'app/(auth)/post-email-change.tsx',
      'app/(modals)/security.tsx',
      'app/(tabs)/bible/reader.tsx',
      'app/(tabs)/bible/version-selector.tsx',
      'app/(tabs)/profile.tsx'
    ],
    process: (content, filePath) => {
      let modified = content;
      const fileName = path.basename(filePath);

      // Si le fichier contient "useRouter" ou "router" non défini mais pas d'import
      if ((modified.includes('useRouter') || modified.includes('router.') || modified.includes('navigation.'))
          && !modified.includes("from 'expo-router'")) {

        // Trouver la dernière ligne d'import
        const importLines = modified.match(/^import .+$/gm) || [];
        if (importLines.length > 0) {
          const lastImport = importLines[importLines.length - 1];
          const insertAfter = modified.indexOf(lastImport) + lastImport.length;

          // Déterminer quels hooks sont nécessaires
          const needsRouter = modified.includes('useRouter') || modified.includes('router.');
          const needsParams = modified.includes('useLocalSearchParams') || modified.includes('params.');

          let newImport = '';
          if (needsRouter && needsParams) {
            newImport = "\nimport { useRouter, useLocalSearchParams } from 'expo-router';";
          } else if (needsRouter) {
            newImport = "\nimport { useRouter } from 'expo-router';";
          } else if (needsParams) {
            newImport = "\nimport { useLocalSearchParams } from 'expo-router';";
          }

          if (newImport) {
            modified = modified.slice(0, insertAfter) + newImport + modified.slice(insertAfter);
          }
        }
      }

      // Remplacer useNavigation() par useRouter()
      modified = modified.replace(/const\s+navigation\s*=\s*useNavigation\(\)/g, 'const router = useRouter()');

      // Remplacer navigation. par router. (sauf dans les commentaires)
      modified = modified.replace(/([^\/\s])navigation\./g, '$1router.');

      // Remplacer params non défini par useLocalSearchParams
      if (modified.includes('params.') && !modified.includes('const params =') && !modified.includes('= params')) {
        const importLines = modified.match(/^import .+$/gm) || [];
        if (importLines.length > 0) {
          const lastImport = importLines[importLines.length - 1];
          const lastImportIndex = modified.lastIndexOf(lastImport);
          const insertPosition = lastImportIndex + lastImport.length;

          // Ajouter la déclaration params après les imports
          if (!modified.includes('useLocalSearchParams()')) {
            const paramsDeclaration = '\n\nfunction ComponentName() {\n  const router = useRouter();\n  const params = useLocalSearchParams();\n';
            // Chercher la première fonction component
            const functionMatch = modified.match(/export default function \w+\(\)/);
            if (functionMatch) {
              const funcStart = modified.indexOf(functionMatch[0]);
              const funcBodyStart = modified.indexOf('{', funcStart) + 1;

              // Insérer la déclaration params
              if (!modified.slice(funcStart, funcBodyStart + 100).includes('const params')) {
                modified = modified.slice(0, funcBodyStart) + '\n  const params = useLocalSearchParams();' + modified.slice(funcBodyStart);
              }
            }
          }
        }
      }

      return modified;
    }
  },

  // 5. SUPPRIMER LES IMPORTS @/navigation/types
  {
    files: [
      'app/(auth)/change-email.tsx',
      'app/(auth)/change-password.tsx',
      'app/(auth)/post-email-change.tsx',
      'app/(auth)/register.tsx',
      'app/screens/auth/ChangeEmailScreen.tsx',
      'app/screens/auth/ChangePasswordScreen.tsx',
      'app/screens/auth/PostEmailChangeScreen.tsx',
      'app/screens/auth/RegisterScreen.tsx',
      'app/screens/auth/SocialNetworks.tsx',
    ],
    replacements: [
      {
        from: /import .+ from ['"]@\/navigation\/types['"];?\n/g,
        to: ''
      }
    ]
  }
];

// Fonction pour appliquer les corrections
function applyFixes() {
  console.log('🔧 Début de la correction des erreurs de migration...\n');

  let filesModified = 0;
  let totalReplacements = 0;

  fixes.forEach((fix, index) => {
    fix.files.forEach(filePath => {
      const fullPath = path.join(process.cwd(), filePath);

      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Fichier non trouvé: ${filePath}`);
        return;
      }

      let content = fs.readFileSync(fullPath, 'utf8');
      const originalContent = content;

      // Appliquer les remplacements si définis
      if (fix.replacements) {
        fix.replacements.forEach(({ from, to }) => {
          const beforeLength = content.length;
          content = content.replace(from, to);
          const afterLength = content.length;

          if (beforeLength !== afterLength) {
            totalReplacements++;
          }
        });
      }

      // Appliquer le traitement personnalisé si défini
      if (fix.process) {
        content = fix.process(content, fullPath);
      }

      // Écrire le fichier si modifié
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        filesModified++;
        console.log(`✅ Corrigé: ${filePath}`);
      }
    });
  });

  console.log(`\n✨ Terminé! ${filesModified} fichiers modifiés avec ${totalReplacements} remplacements.`);
}

applyFixes();

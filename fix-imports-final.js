// fix-imports-final.js - Correction FINALE de tous les imports et hooks
const fs = require('fs');
const path = require('path');

console.log('🔧 Correction FINALE de tous les imports...\n');

const files = [
  'app/(auth)/change-email.tsx',
  'app/(auth)/change-password.tsx',
  'app/(auth)/forgot-password.tsx',
  'app/(auth)/login.tsx',
  'app/(auth)/register.tsx',
  'app/(auth)/post-email-change.tsx',
  'app/(modals)/security.tsx',
  'app/(tabs)/bible/index.tsx',
  'app/(tabs)/bible/reader.tsx',
  'app/(tabs)/bible/version-selector.tsx',
  'app/(tabs)/profile.tsx',
];

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  // Calculer le bon chemin relatif vers services/firebase/firebaseConfig
  const depth = filePath.split('/').length - 1; // app/(auth)/file.tsx = profondeur 2
  const relativePath = '../'.repeat(depth) + 'services/firebase/firebaseConfig';

  // 1. Corriger l'import firebaseConfig avec le bon chemin
  content = content.replace(
    /from\s+['"][^'"]*services\/firebase\/firebaseConfig['"]/g,
    `from '${relativePath}'`
  );

  // 2. S'assurer que useRouter est importé s'il est utilisé
  const usesRouter = /\brouter\.(push|replace|back)\b/.test(content);
  const hasRouterImport = /import\s+{[^}]*useRouter[^}]*}\s+from\s+['"]expo-router['"]/.test(content);

  if (usesRouter && !hasRouterImport) {
    // Trouver la dernière ligne d'import React Native
    const lines = content.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') && !lines[i].includes('from \'react\'')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex !== -1) {
      // Vérifier si expo-router est déjà importé
      const expoRouterLine = lines.findIndex(l => l.includes("from 'expo-router'"));

      if (expoRouterLine === -1) {
        // Ajouter l'import
        lines.splice(lastImportIndex + 1, 0, "import { useRouter } from 'expo-router';");
      } else {
        // Modifier l'import existant pour inclure useRouter
        lines[expoRouterLine] = lines[expoRouterLine].replace(
          /import\s+{([^}]*)}\s+from\s+['"]expo-router['"]/,
          (match, imports) => {
            if (!imports.includes('useRouter')) {
              return `import { ${imports.trim()}, useRouter } from 'expo-router'`;
            }
            return match;
          }
        );
      }

      content = lines.join('\n');
    }
  }

  // 3. S'assurer que useLocalSearchParams est importé si params est utilisé
  const usesParams = /\bparams\.\w+/.test(content);
  const hasParamsImport = /useLocalSearchParams/.test(content);

  if (usesParams && !hasParamsImport) {
    const lines = content.split('\n');
    const expoRouterLine = lines.findIndex(l => l.includes("from 'expo-router'"));

    if (expoRouterLine !== -1) {
      // Ajouter useLocalSearchParams à l'import expo-router
      lines[expoRouterLine] = lines[expoRouterLine].replace(
        /import\s+{([^}]*)}\s+from\s+['"]expo-router['"]/,
        (match, imports) => {
          if (!imports.includes('useLocalSearchParams')) {
            return `import { ${imports.trim()}, useLocalSearchParams } from 'expo-router'`;
          }
          return match;
        }
      );
      content = lines.join('\n');
    }

    // Ajouter const params = useLocalSearchParams() dans la fonction
    const funcMatch = content.match(/export default function \w+\([^)]*\)\s*{/);
    if (funcMatch && !content.includes('const params = useLocalSearchParams()')) {
      const funcStart = content.indexOf(funcMatch[0]);
      const funcBodyStart = funcStart + funcMatch[0].length;

      // Insérer après la première accolade de fonction
      const lines = content.split('\n');
      let insertIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('export default function')) {
          // Chercher les const hooks (useState, useRouter, etc.)
          for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
            if (lines[j].trim().startsWith('const ') && lines[j].includes('use')) {
              insertIndex = j;
            } else if (lines[j].trim().startsWith('const ') && !lines[j].includes('use')) {
              break;
            }
          }
          break;
        }
      }

      if (insertIndex !== -1) {
        lines.splice(insertIndex + 1, 0, '  const params = useLocalSearchParams();');
        content = lines.join('\n');
      }
    }
  }

  // 4. Déclarer router si utilisé mais non déclaré
  if (usesRouter && !/const\s+router\s*=\s*useRouter\(\)/.test(content)) {
    const funcMatch = content.match(/export default function \w+\([^)]*\)\s*{/);
    if (funcMatch) {
      const lines = content.split('\n');
      let insertIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('export default function')) {
          // Insérer après la ligne de fonction
          insertIndex = i + 1;
          break;
        }
      }

      if (insertIndex !== -1 && !lines[insertIndex].includes('const router')) {
        lines.splice(insertIndex, 0, '  const router = useRouter();');
        content = lines.join('\n');
      }
    }
  }

  // 5. Supprimer les imports inutiles
  content = content.replace(/import\s+{[^}]*useNavigation[^}]*}\s+from\s+['"]@react-navigation\/native['"];?\n/g, '');
  content = content.replace(/import\s+type\s+{[^}]*NativeStackNavigationProp[^}]*}\s+from\s+['"]@react-navigation\/native-stack['"];?\n/g, '');
  content = content.replace(/import\s+.*from\s+['"]@\/navigation\/types['"];?\n/g, '');

  // 6. Remplacer useNavigation par useRouter dans les déclarations encore présentes
  content = content.replace(/const\s+navigation\s*=\s*useNavigation[^;]+;/g, '');

  // 7. Gérer router.setOptions (n'existe pas dans Expo Router, utiliser useEffect + Stack.Screen)
  if (content.includes('router.setOptions')) {
    content = content.replace(/router\.setOptions\(/g, '// TODO: Use Stack.Screen options instead of router.setOptions(');
  }

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath}`);
    return true;
  }

  return false;
}

let fixed = 0;
files.forEach(file => {
  if (fixFile(file)) {
    fixed++;
  }
});

console.log(`\n✨ ${fixed} fichiers corrigés!`);

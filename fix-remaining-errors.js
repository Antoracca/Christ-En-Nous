// fix-remaining-errors.js - Corriger les dernières erreurs restantes
const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des dernières erreurs...\n');

const fixes = [
  // 1. Corriger app/(auth)/change-email.tsx - référence à 'navigation' non définie
  {
    file: 'app/(auth)/change-email.tsx',
    replacements: [
      { from: /\], \[isAuthenticated, navigation\]\);/, to: '], [isAuthenticated, router]);' },
      { from: /([^/])\bnavigation\./g, to: '$1router.' }
    ]
  },

  // 2. Corriger app/(auth)/change-password.tsx - import @/navigation/types
  {
    file: 'app/(auth)/change-password.tsx',
    replacements: [
      { from: /import\s+type\s+{[^}]*}\s+from\s+['"]@\/navigation\/types['"];?\n/g, to: '' }
    ]
  },

  // 3. Corriger app/(auth)/login.tsx - useRoute, navigation
  {
    file: 'app/(auth)/login.tsx',
    replacements: [
      { from: /import\s+{[^}]*useRoute[^}]*}\s+from[^;]+;?\n/g, to: '' },
      { from: /const\s+route\s*=\s*useRoute\(\);?\n?/g, to: '' },
      { from: /const\s+params\s*=\s*route\.params[^;]+;?\n?/g, to: '' },
      { from: /([^/])\bnavigation\./g, to: '$1router.' }
    ]
  },

  // 4. Corriger app/(auth)/post-email-change.tsx - params, router.reset
  {
    file: 'app/(auth)/post-email-change.tsx',
    replacements: [
      { from: /import\s+.*from\s+['"]@\/navigation\/types['"];?\n/g, to: '' },
      { from: /router\.reset\(/g, to: 'router.replace(' }
    ]
  },

  // 5. Corriger app/(auth)/register.tsx - import @/navigation/types
  {
    file: 'app/(auth)/register.tsx',
    replacements: [
      { from: /import\s+.*from\s+['"]@\/navigation\/types['"];?\n/g, to: '' }
    ]
  },

  // 6. Corriger tous les app/screens/auth/* - Ce sont les VIEUX fichiers non utilisés
  {
    file: 'app/screens/auth/ChangeEmailScreen.tsx',
    replacements: [
      { from: /import\s+.*from\s+['"]@\/navigation\/types['"];?\n/g, to: '' },
      { from: "import { useRouter } from 'expo-router';", to: "// OLD FILE - NOT USED WITH EXPO ROUTER\n// import { useRouter } from 'expo-router';" }
    ]
  },
  {
    file: 'app/screens/auth/ChangePasswordScreen.tsx',
    replacements: [
      { from: /import\s+.*from\s+['"]@\/navigation\/types['"];?\n/g, to: '' },
      { from: "import { useRouter } from 'expo-router';", to: "// OLD FILE - NOT USED WITH EXPO ROUTER\n// import { useRouter } from 'expo-router';" }
    ]
  },
  {
    file: 'app/screens/auth/PostEmailChangeScreen.tsx',
    replacements: [
      { from: /import\s+.*from\s+['"]@\/navigation\/types['"];?\n/g, to: '' },
      { from: "import { useRouter } from 'expo-router';", to: "// OLD FILE - NOT USED WITH EXPO ROUTER\n// import { useRouter } from 'expo-router';" }
    ]
  },
  {
    file: 'app/screens/auth/RegisterScreen.tsx',
    replacements: [
      { from: /import\s+.*from\s+['"]@\/navigation\/types['"];?\n/g, to: '' },
      { from: "import { useRouter } from 'expo-router';", to: "// OLD FILE - NOT USED WITH EXPO ROUTER\n// import { useRouter } from 'expo-router';" }
    ]
  },
  {
    file: 'app/screens/auth/SocialNetworks.tsx',
    replacements: [
      { from: /import\s+.*from\s+['"]@\/navigation\/types['"];?\n/g, to: '' },
      { from: "import { useRouter } from 'expo-router';", to: "// OLD FILE - NOT USED WITH EXPO ROUTER\n// import { useRouter } from 'expo-router';" }
    ]
  },
  {
    file: 'app/screens/home/HomeMenuModal.android.tsx',
    replacements: [
      { from: /import\s+{\s*RootStackParamList\s*}\s+from[^;]+;?\n/g, to: '' },
      { from: "import { useRouter } from 'expo-router';", to: "// OLD FILE - NOT USED WITH EXPO ROUTER\n// import { useRouter } from 'expo-router';" }
    ]
  }
];

fixes.forEach(({ file, replacements }) => {
  const fullPath = path.join(process.cwd(), file);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${file} - non trouvé`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  replacements.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${file}`);
  }
});

console.log('\n✨ Terminé!');

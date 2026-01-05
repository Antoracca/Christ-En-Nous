// migrate-navigation.js - Script de migration React Navigation → Expo Router
const fs = require('fs');
const path = require('path');

const replacements = [
  // Imports
  {
    from: /import\s*{\s*useNavigation\s*}\s*from\s*['"]@react-navigation\/native['"]/g,
    to: "import { useRouter } from 'expo-router'",
  },
  {
    from: /import\s*{\s*useRoute\s*}\s*from\s*['"]@react-navigation\/native['"]/g,
    to: "import { useLocalSearchParams } from 'expo-router'",
  },
  {
    from: /import\s*{\s*useNavigation,\s*useRoute\s*}\s*from\s*['"]@react-navigation\/native['"]/g,
    to: "import { useRouter, useLocalSearchParams } from 'expo-router'",
  },
  {
    from: /import\s*{\s*useRoute,\s*useNavigation\s*}\s*from\s*['"]@react-navigation\/native['"]/g,
    to: "import { useRouter, useLocalSearchParams } from 'expo-router'",
  },
  // Types (supprimer les imports de types)
  {
    from: /import\s+type\s*{\s*NativeStackNavigationProp\s*}\s*from\s*['"]@react-navigation\/native-stack['"]\s*;?\n/g,
    to: '',
  },
  {
    from: /import\s+type\s*{\s*RouteProp\s*}\s*from\s*['"]@react-navigation\/native['"]\s*;?\n/g,
    to: '',
  },
  {
    from: /import\s+type\s*{\s*NavigationProp\s*}\s*from\s*['"]@react-navigation\/native['"]\s*;?\n/g,
    to: '',
  },
  // Hook calls
  {
    from: /const\s+navigation\s*=\s*useNavigation\(\)/g,
    to: "const router = useRouter()",
  },
  {
    from: /const\s+route\s*=\s*useRoute\(\)/g,
    to: "const params = useLocalSearchParams()",
  },
  // Navigation calls
  {
    from: /navigation\.navigate\s*\(\s*['"]Login['"]\s*\)/g,
    to: "router.push('/(auth)/login')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]Register['"]\s*\)/g,
    to: "router.push('/(auth)/register')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]ForgotPassword['"]\s*\)/g,
    to: "router.push('/(auth)/forgot-password')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]RegisterSuccess['"]/g,
    to: "router.push('/(auth)/register-success')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]ResendEmail['"]\s*\)/g,
    to: "router.push('/(auth)/resend-email')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]ChangeEmail['"]\s*\)/g,
    to: "router.push('/(auth)/change-email')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]ChangePassword['"]\s*\)/g,
    to: "router.push('/(auth)/change-password')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]PostEmailChange['"]/g,
    to: "router.push('/(auth)/post-email-change')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]ModifierProfil['"]\s*\)/g,
    to: "router.push('/(modals)/modifier-profil')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]Security['"]\s*\)/g,
    to: "router.push('/(modals)/security')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]BibleReader['"]/g,
    to: "router.push('/(tabs)/bible/reader')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]BibleRecherche['"]\s*\)/g,
    to: "router.push('/(tabs)/bible/search')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]BibleVersionSelector['"]/g,
    to: "router.push('/(tabs)/bible/version-selector')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]BibleReaderSettings['"]\s*\)/g,
    to: "router.push('/(tabs)/bible/reader-settings')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]BibleMeditation['"]/g,
    to: "router.push('/(tabs)/bible/meditation')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]BibleMeditationSettings['"]\s*\)/g,
    to: "router.push('/(tabs)/bible/meditation-settings')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]BibleLearning['"]\s*\)/g,
    to: "router.push('/(tabs)/bible/learning')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]BiblePlan['"]\s*\)/g,
    to: "router.push('/(tabs)/bible/plan')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]BibleSettings['"]\s*\)/g,
    to: "router.push('/(tabs)/bible/settings')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]HomeTab['"]\s*\)/g,
    to: "router.push('/(tabs)')",
  },
  {
    from: /navigation\.navigate\s*\(\s*['"]ProfileTab['"]\s*\)/g,
    to: "router.push('/(tabs)/profile')",
  },
  // goBack
  {
    from: /navigation\.goBack\(\)/g,
    to: "router.back()",
  },
  // route.params access
  {
    from: /route\.params/g,
    to: "params",
  },
];

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const { from, to } of replacements) {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Migrated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
    return false;
  }
}

function migrateDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let count = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      count += migrateDirectory(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      if (migrateFile(fullPath)) {
        count++;
      }
    }
  }

  return count;
}

// Migrate all new routes
console.log('\n🚀 Starting migration React Navigation → Expo Router\n');

const directories = [
  'app/(auth)',
  'app/(tabs)',
  'app/(modals)',
];

let totalMigrated = 0;

for (const dir of directories) {
  console.log(`\n📁 Migrating directory: ${dir}`);
  const count = migrateDirectory(dir);
  totalMigrated += count;
  console.log(`   → ${count} files migrated`);
}

console.log(`\n✨ Migration complete! ${totalMigrated} files migrated.\n`);

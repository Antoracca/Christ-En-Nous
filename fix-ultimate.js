// fix-ultimate.js - CORRECTION ULTIME de toutes les erreurs
const fs = require('fs');
const path = require('path');

console.log('🚀 CORRECTION ULTIME - Fixing ALL remaining errors...\n');

function fixFile(filePath, operations) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${filePath} not found`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  operations.forEach(op => {
    content = content.replace(op.from, op.to);
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath}`);
    return true;
  }

  return false;
}

// Fix app/(auth)/change-email.tsx - navigation non défini
fixFile('app/(auth)/change-email.tsx', [
  { from: /, navigation\]\);/, to: ', router]);' },
  { from: /\bnavigation\./g, to: 'router.' }
]);

// Fix app/(auth)/change-password.tsx - import @/navigation/types
fixFile('app/(auth)/change-password.tsx', [
  { from: /import\s+type\s+{\s*RootStackParamList\s*}\s+from\s+['"]@\/navigation\/types['"];?\n/g, to: '' }
]);

// Fix app/(auth)/login.tsx - useRoute et params
fixFile('app/(auth)/login.tsx', [
  // Supprimer import useRoute
  { from: /import\s+{\s*useNavigation,\s*useRoute\s*}\s+from\s+['"]@react-navigation\/native['"];?\n/g, to: '' },
  { from: /import\s+{\s*useRoute\s*}\s+from\s+['"]@react-navigation\/native['"];?\n/g, to: '' },
  // Supprimer déclaration route et params
  { from: /const\s+route\s*=\s*useRoute\(\s*\);?\s*\n?/g, to: '' },
  { from: /const\s+params:\s*any\s*=\s*route\.params[^;]*;?\s*\n?/g, to: '' },
  // Remplacer navigation par router
  { from: /\bnavigation\./g, to: 'router.' },
  // Fix params.email - utiliser string au lieu de string | string[]
  { from: /const\s+emailParam\s*=\s*params\?\.email\s*;/, to: 'const emailParam = typeof params?.email === "string" ? params.email : params?.email?.[0] || \'\';' }
]);

// Fix app/(auth)/post-email-change.tsx - params et router.reset
fixFile('app/(auth)/post-email-change.tsx', [
  // Supprimer import @/navigation/types
  { from: /import\s+type\s+{\s*RootStackParamList\s*}\s+from\s+['"]@\/navigation\/types['"];?\n/g, to: '' },
  // Fix router.replace avec index
  { from: /router\.replace\(\s*{\s*pathname:\s*['"]\/(tabs)\/['"],\s*params:\s*{\s*index:\s*0\s*}\s*}\s*\);/, to: "router.replace('/(tabs)');" },
  { from: /router\.replace\(\s*{\s*pathname:\s*['"]\/(auth)\/login['"],\s*params:\s*{\s*index:\s*0\s*}\s*}\s*\);/, to: "router.replace('/(auth)/login');" }
]);

// Fix app/(auth)/register.tsx - import @/navigation/types
fixFile('app/(auth)/register.tsx', [
  { from: /import\s+type\s+{\s*RootStackParamList\s*}\s+from\s+['"]@\/navigation\/types['"];?\n/g, to: '' }
]);

// Fix app/(tabs)/_layout.tsx - icon name type error (home-variant vs home)
fixFile('app/(tabs)/_layout.tsx', [
  { from: /iconName\s*=\s*"home-variant";/, to: 'iconName = "home" as any;' }
]);

console.log('\n✨ Terminé! Vérification des erreurs...\n');

// fix-router-calls.js - Corriger tous les appels router.navigate/replace avec la syntaxe Expo Router
const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des appels de navigation...\n');

const routeMappings = {
  'Login': '/(auth)/login',
  'Register': '/(auth)/register',
  'ForgotPassword': '/(auth)/forgot-password',
  'RegisterSuccess': '/(auth)/register-success',
  'PostEmailChange': '/(auth)/post-email-change',
  'ChangeEmail': '/(auth)/change-email',
  'ChangePassword': '/(auth)/change-password',
  'ResendEmail': '/(auth)/resend-email',

  'Main': '/(tabs)',
  'HomeTab': '/(tabs)',
  'BibleTab': '/(tabs)/bible',
  'ProfileTab': '/(tabs)/profile',
  'CoursesTab': '/(tabs)/courses',
  'PrayerTab': '/(tabs)/prayer',

  'BibleReader': '/(tabs)/bible/reader',
  'BibleSearch': '/(tabs)/bible/search',
  'BibleSettings': '/(tabs)/bible/settings',
  'VersionSelector': '/(tabs)/bible/version-selector',

  'ModifierProfil': '/(modals)/modifier-profil',
  'Security': '/(modals)/security',
};

const filesToFix = [
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

  // 1. Corriger router.navigate('ScreenName') → router.push('/(group)/screen')
  Object.keys(routeMappings).forEach(oldRoute => {
    const newRoute = routeMappings[oldRoute];

    // router.navigate('Screen')
    const pattern1 = new RegExp(`router\\.navigate\\(['"]${oldRoute}['"]\\s*\\)`, 'g');
    content = content.replace(pattern1, `router.push('${newRoute}')`);

    // router.navigate('Screen', {})
    const pattern2 = new RegExp(`router\\.navigate\\(['"]${oldRoute}['"],\\s*\\{\\s*\\}\\)`, 'g');
    content = content.replace(pattern2, `router.push('${newRoute}')`);

    // router.replace('Screen')
    const pattern3 = new RegExp(`router\\.replace\\(['"]${oldRoute}['"]\\s*\\)`, 'g');
    content = content.replace(pattern3, `router.replace('${newRoute}')`);

    // router.replace('Screen', {})
    const pattern4 = new RegExp(`router\\.replace\\(['"]${oldRoute}['"],\\s*\\{\\s*\\}\\)`, 'g');
    content = content.replace(pattern4, `router.replace('${newRoute}')`);
  });

  // 2. Corriger router.navigate('Screen', { param: value }) → router.push({ pathname: '/(group)/screen', params: { param: value } })
  Object.keys(routeMappings).forEach(oldRoute => {
    const newRoute = routeMappings[oldRoute];

    // Motif: router.navigate('Screen', { params })
    const navigatePattern = new RegExp(
      `router\\.navigate\\(['"]${oldRoute}['"],\\s*\\{([^}]+)\\}\\)`,
      'g'
    );
    content = content.replace(navigatePattern, (match, params) => {
      return `router.push({ pathname: '${newRoute}', params: {${params}} })`;
    });

    // Motif: router.replace('Screen', { params })
    const replacePattern = new RegExp(
      `router\\.replace\\(['"]${oldRoute}['"],\\s*\\{([^}]+)\\}\\)`,
      'g'
    );
    content = content.replace(replacePattern, (match, params) => {
      return `router.replace({ pathname: '${newRoute}', params: {${params}} })`;
    });
  });

  // 3. Corriger router.navigate('Main', { screen: 'TabName' }) → router.push('/(tabs)/tabname')
  content = content.replace(
    /router\.navigate\(['"]Main['"],\s*\{\s*screen:\s*['"](\w+)Tab['"]\s*\}\)/g,
    (match, tabName) => {
      const tabLower = tabName.toLowerCase();
      return `router.push('/(tabs)/${tabLower}')`;
    }
  );

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath}`);
    return true;
  }

  return false;
}

let fixed = 0;
filesToFix.forEach(file => {
  if (fixFile(file)) {
    fixed++;
  }
});

console.log(`\n✨ ${fixed} fichiers corrigés!`);

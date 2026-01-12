const fs = require('fs');
const path = require('path');

// Correspondance ancien → nouveau
const fileMapping = {
  'BibleReaderScreen.tsx': 'reader.tsx',
  'BibleReaderSettingsScreen.tsx': 'reader-settings.tsx',
  'BibleSettingsScreen.tsx': 'settings.tsx',
  'BibleSearchScreen.tsx': 'search.tsx',
  'BibleMeditationScreen.tsx': 'meditation.tsx',
  'BibleMeditationSettingsScreen.tsx': 'meditation-settings.tsx',
  'BiblePlanScreen.tsx': 'plan.tsx',
  'BibleLearningScreen.tsx': 'learning.tsx',
  'BibleVersionSelectorScreen.tsx': 'version-selector.tsx',
  'BibleHomeScreen.tsx': 'index.tsx',
};

const oldDir = path.join(__dirname, 'app', 'screens', 'bible');
const newDir = path.join(__dirname, 'app', '(tabs)', 'bible');

console.log('🔄 Migration des fichiers Bible...\n');

Object.entries(fileMapping).forEach(([oldFile, newFile]) => {
  const oldPath = path.join(oldDir, oldFile);
  const newPath = path.join(newDir, newFile);

  if (!fs.existsSync(oldPath)) {
    console.log(`⚠️  ${oldFile} n'existe pas, skip`);
    return;
  }

  let content = fs.readFileSync(oldPath, 'utf8');

  // Adapter les imports de navigation
  content = content.replace(
    /from '@react-navigation\/native'/g,
    "from 'expo-router'"
  );

  content = content.replace(
    /useNavigation\(\)/g,
    "useRouter()"
  );

  content = content.replace(
    /useRoute\(\)/g,
    "useLocalSearchParams()"
  );

  content = content.replace(
    /const navigation = useRouter\(\);/g,
    "const router = useRouter();"
  );

  content = content.replace(
    /const route = useLocalSearchParams\(\);/g,
    "const params = useLocalSearchParams();"
  );

  content = content.replace(
    /route\.params/g,
    "params"
  );

  // Adapter les imports relatifs des composants
  content = content.replace(
    /from '\.\//g,
    "from '@/screens/bible/"
  );

  // Adapter les navigations
  content = content.replace(
    /navigation\.navigate\('([^']+)' as never\)/g,
    (match, screenName) => {
      // Convertir le nom d'écran en chemin Expo Router
      const routeMap = {
        'BibleReader': '/bible/reader',
        'BibleReaderSettings': '/bible/reader-settings',
        'BibleSettings': '/bible/settings',
        'BibleSearch': '/bible/search',
        'BibleRecherche': '/bible/search',
        'BibleMeditation': '/bible/meditation',
        'BibleMeditationSettings': '/bible/meditation-settings',
        'BiblePlan': '/bible/plan',
        'BibleLearning': '/bible/learning',
        'BibleVersionSelector': '/bible/version-selector',
      };
      const route = routeMap[screenName] || `/bible/${screenName.toLowerCase()}`;
      return `router.push('${route}')`;
    }
  );

  // Remplacer navigation par router dans le code
  content = content.replace(/\bnavigation\b/g, 'router');

  // Écrire le nouveau fichier
  fs.writeFileSync(newPath, content, 'utf8');
  console.log(`✅ ${oldFile} → ${newFile}`);
});

console.log('\n✨ Migration terminée !');

// fix-homemenu.js - Corriger HomeMenuContext pour Expo Router
const fs = require('fs');

const filePath = 'app/context/HomeMenuContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Supprimer les lignes avec RootStackParamList et navigate (anciennes)
content = content.replace(/import type \{ RootStackParamList \} from '.*';\n/g, '');
content = content.replace(/import \{ navigate \} from '.*navigationRef.*';\n/g, '');

// Ajouter useRouter dans le provider
if (!content.includes('const router = useRouter();')) {
  content = content.replace(
    /(const { logout } = useAuth\(\);)/,
    '$1\n  const router = useRouter();'
  );
}

// Corriger la fonction navigateWithClose
content = content.replace(
  /const navigateWithClose = useCallback\(\s*<Name extends keyof RootStackParamList>\(screen: Name, params\?: RootStackParamList\[Name\]\) => \{\s*closeMenu\(\);\s*setTimeout\(\(\) => \{\s*navigate\(screen as any, params as any\);\s*\}, 160\);\s*\},\s*\[closeMenu\],\s*\);/gs,
  `const navigateWithClose = useCallback(
    (path: string) => {
      closeMenu();
      setTimeout(() => {
        router.push(path as any);
      }, 160);
    },
    [closeMenu, router],
  );`
);

// Corriger les appels navigateWithClose
content = content.replace(
  /navigateWithClose\('Main', \{ screen: 'ProfileTab' \}\)/g,
  "navigateWithClose('/(tabs)/profile')"
);
content = content.replace(
  /navigateWithClose\('Security'\)/g,
  "navigateWithClose('/(modals)/security')"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ HomeMenuContext corrigé avec succès !');

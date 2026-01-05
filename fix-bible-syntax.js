// fix-bible-syntax.js - Corriger toutes les erreurs de syntaxe Bible
const fs = require('fs');

const filePath = 'app/(tabs)/bible/index.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Corriger toutes les occurrences de ) as never)} → ) as never}
content = content.replace(/\) as never\)}/g, ') as never}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Toutes les erreurs de syntaxe corrigées !');

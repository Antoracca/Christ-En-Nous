const fs = require('fs');
const path = require('path');

// Fonction pour corriger l'encodage d'un fichier
function fixEncoding(filePath) {
  try {
    console.log(`Correction de ${filePath}...`);
    
    // Lire le fichier avec l'encodage UTF-8
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Corrections des émojis et caractères spéciaux
    const fixes = [
      // Émojis couramment mal encodés
      [/🔄/g, '🔄'],
      [/📊/g, '📊'],
      [/🚀/g, '🚀'],
      [/📖/g, '📖'],
      [/🔥/g, '🔥'],
      [/👁️/g, '👁️'],
      [/🚫/g, '🚫'],
      [/🧹/g, '🧹'],
      [/🧠/g, '🧠'],
      [/🔍/g, '🔍'],
      [/⏱️/g, '⏱️'],
      [/✅/g, '✅'],
      [/❌/g, '❌'],
      [/⏹️/g, '⏹️'],
      [/⚡/g, '⚡'],
      [/⏸️/g, '⏸️'],
      [/⏰/g, '⏰'],
      
      // Caractères accentués français
      [/À/g, 'À'],
      [/á/g, 'á'],
      [/â/g, 'â'],
      [/ã/g, 'ã'],
      [/ä/g, 'ä'],
      [/å/g, 'å'],
      [/æ/g, 'æ'],
      [/ç/g, 'ç'],
      [/è/g, 'è'],
      [/é/g, 'é'],
      [/ê/g, 'ê'],
      [/ë/g, 'ë'],
      [/ì/g, 'ì'],
      [/í/g, 'í'],
      [/î/g, 'î'],
      [/ï/g, 'ï'],
      [/ð/g, 'ð'],
      [/ñ/g, 'ñ'],
      [/ò/g, 'ò'],
      [/ó/g, 'ó'],
      [/ô/g, 'ô'],
      [/õ/g, 'õ'],
      [/ö/g, 'ö'],
      [/÷/g, '÷'],
      [/ø/g, 'ø'],
      [/ù/g, 'ù'],
      [/ú/g, 'ú'],
      [/û/g, 'û'],
      [/ü/g, 'ü'],
      [/ý/g, 'ý'],
      [/þ/g, 'þ'],
      [/ÿ/g, 'ÿ'],
      
      // Caractères accentués majuscules
      [/À/g, 'À'],
      [/Ï/g, 'Ï'], 
      [/Â/g, 'Â'],
      [/Ï/g, 'Ï'],
      [/Ä/g, 'Ä'],
      [/Å/g, 'Å'],
      [/Æ/g, 'Æ'],
      [/Ç/g, 'Ç'],
      [/È/g, 'È'],
      [/É/g, 'É'],
      [/Ê/g, 'Ê'],
      [/Ë/g, 'Ë'],
      [/Ì/g, 'Ì'],
      [/Ï/g, 'Ï'],
      [/Î/g, 'Î'],
      [/Ï/g, 'Ï'],
      [/Ï/g, 'Ð'],
      [/Ï'/g, 'Ñ'],
      [/Ï'/g, 'Ò'],
      [/Ï"/g, 'Ó'],
      [/Ï"/g, 'Ô'],
      [/Ï•/g, 'Õ'],
      [/Ï–/g, 'Ö'],
      [/Ï—/g, '×'],
      [/Ï˜/g, 'Ø'],
      [/Ï™/g, 'Ù'],
      [/Ïš/g, 'Ú'],
      [/Ï›/g, 'Û'],
      [/Ïœ/g, 'Ü'],
      [/Ï/g, 'Ý'],
      [/Ïž/g, 'Þ'],
      [/ÏŸ/g, 'ß'],
      
      // Autres symboles
      [/•/g, '•'],
      [/→/g, '→'],
      [/≥/g, '≥'],
      
      // Mots français spécifiques
      [/ÉCHOUÉE/g, 'ÉCHOUÉE'],
      [/DÉSACTIVÉ/g, 'DÉSACTIVÉ'],
      [/TERMINÉ/g, 'TERMINÉ'],
      [/RÉEL/g, 'RÉEL'],
      [/PROBLÈME/g, 'PROBLÈME'],
      [/DÉTECTÉ/g, 'DÉTECTÉ'],
      [/RÉSULTATS/g, 'RÉSULTATS'],
      [/MÉTHODE/g, 'MÉTHODE'],
      [/MÉTHODES/g, 'MÉTHODES'],
      [/DONNÉES/g, 'DONNÉES'],
      [/PRÉCISE/g, 'PRÉCISE'],
      [/PRIORITÉ/g, 'PRIORITÉ'],
    ];
    
    let fixed = false;
    
    // Appliquer toutes les corrections
    fixes.forEach(([pattern, replacement]) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        fixed = true;
      }
    });
    
    if (fixed) {
      // Réécrire le fichier avec l'encodage UTF-8
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath} corrigé`);
      return true;
    } else {
      console.log(`ℹ️ ${filePath} - Aucune correction nécessaire`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Erreur lors de la correction de ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir récursivement les fichiers
function fixEncodingInDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let totalFixed = 0;
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Ignorer les dossiers node_modules, .git, etc.
        if (!['node_modules', '.git', '.expo', 'dist', 'build'].includes(item)) {
          walkDir(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (extensions.includes(ext)) {
          if (fixEncoding(fullPath)) {
            totalFixed++;
          }
        }
      }
    }
  }
  
  walkDir(dirPath);
  return totalFixed;
}

// Exécution du script
console.log('🔧 Correction de l\'encodage UTF-8...\n');

const currentDir = process.cwd();
const totalFixed = fixEncodingInDirectory(currentDir);

console.log(`\n✨ Correction terminée ! ${totalFixed} fichiers corrigés.`);
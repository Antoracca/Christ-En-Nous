// app/screens/bible/BibleSmartSearchScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';
import type { BibleSearchResult } from '@/services/bible';
import { BibleReferenceUtils } from '@/services/bible/utils/helpers';

/** ─────────────────────────────────────────────────────────────────────────────
 *  SMART SEARCH – ALL-IN-ONE
 *  - Multi-requêtes (séparées par ; , | ou retour à la ligne) – limite 5
 *  - Détection : Référence (Jean 3:16), Chapitre (Psaume 23), Plage (Jean 3:16-4:2)
 *  - Phrase exacte: guillemets "..." ou apostrophes '...'
 *  - Mot / Thème (accent-insensible), + approximations soft (fuzzy light)
 *  - Portée optionnelle (scope) : de StartRef → EndRef (filtrage post-search)
 *  - Résultats groupés par requête + surlignage robuste
 *  - Navigation directe si la requête est une référence (ou plage)
 *  - Sans dépendances externes
 *  ---------------------------------------------------------------------------
 *  Notes:
 *  - On exploite searchVerses(query, limit) pour rester plug-and-play.
 *  - "Fuzzy" ici = stratégie d’expansion légère (variantes normalisées/sous-termes).
 *  - Si BibleReferenceUtils.parseReference existe, on l’utilise en priorité.
 *  - L’ordre canonique est dérivé de bibleBooks (supposé ordonné).
 *  ────────────────────────────────────────────────────────────────────────────
 */

type VerseRef = { book: string; chapter: number; verse?: number };
type RangeRef = { start: VerseRef; end: VerseRef };

type SmartToken =
  | { kind: 'reference'; raw: string; ref: VerseRef }
  | { kind: 'range'; raw: string; range: RangeRef }
  | { kind: 'phrase'; raw: string; value: string }
  | { kind: 'word'; raw: string; value: string }
  | { kind: 'approx'; raw: string; value: string };

type Section = {
  token: SmartToken;
  results: BibleSearchResult[];
};

const SEPARATORS_REGEX = /[;\n\|,]+/g;
const MAX_TOKENS = 5;

const BIBLE_BOOK_ALIASES: Record<string, string> = {
  // FR + EN + abréviations communes → OSIS (valeurs indicatives)
  'genèse': 'GEN', 'genese': 'GEN', 'gen': 'GEN', 'gen.': 'GEN', 'genesis': 'GEN',
  'exode': 'EXO', 'exo': 'EXO', 'exod': 'EXO', 'exodus': 'EXO',
  'lévitique': 'LEV', 'levitique': 'LEV', 'lev': 'LEV', 'lev.': 'LEV', 'leviticus': 'LEV',
  'nombres': 'NUM', 'nom': 'NUM', 'num.': 'NUM', 'numbers': 'NUM',
  'deutéronome': 'DEU', 'deuteronome': 'DEU', 'deu': 'DEU', 'deut': 'DEU', 'deut.': 'DEU', 'deuteronomy': 'DEU',
  'josué': 'JOS', 'josue': 'JOS', 'jos': 'JOS', 'joshua': 'JOS',
  'juges': 'JDG', 'judges': 'JDG', 'jdg': 'JDG',
  'ruth': 'RUT', 'rut': 'RUT', 'rut.': 'RUT',
  '1 samuel': '1SA', '1 sam': '1SA', '1sa': '1SA', '1sam': '1SA', '1 sam.': '1SA',
  '2 samuel': '2SA', '2 sam': '2SA', '2sa': '2SA', '2sam': '2SA', '2 sam.': '2SA',
  '1 rois': '1KI', '1 kings': '1KI', '1ki': '1KI',
  '2 rois': '2KI', '2 kings': '2KI', '2ki': '2KI',
  '1 chroniques': '1CH', '1 chronicles': '1CH', '1ch': '1CH',
  '2 chroniques': '2CH', '2 chronicles': '2CH', '2ch': '2CH',
  'esdras': 'EZR', 'ezra': 'EZR', 'ezr': 'EZR',
  'néhémie': 'NEH', 'nehemie': 'NEH', 'nehemiah': 'NEH', 'neh': 'NEH',
  'esther': 'EST', 'est': 'EST',
  'job': 'JOB',
  'psaume': 'PSA', 'psaumes': 'PSA', 'ps': 'PSA', 'ps.': 'PSA', 'psalm': 'PSA', 'psalms': 'PSA',
  'proverbes': 'PRO', 'prov': 'PRO', 'proverbs': 'PRO',
  'ecclésiaste': 'ECC', 'ecclesiaste': 'ECC', 'ecc': 'ECC', 'ecclesiastes': 'ECC',
  'cantique des cantiques': 'SNG', 'cantique': 'SNG', 'song of songs': 'SNG', 'song': 'SNG', 'sos': 'SNG',
  'esaïe': 'ISA', 'esaie': 'ISA', 'esa': 'ISA', 'isaiah': 'ISA', 'isa': 'ISA',
  'jérémie': 'JER', 'jeremie': 'JER', 'jeremiah': 'JER', 'jer': 'JER',
  'lamentations': 'LAM', 'lam': 'LAM',
  'ézéchiel': 'EZK', 'ezechiel': 'EZK', 'ezekiel': 'EZK', 'ezk': 'EZK', 'ezek': 'EZK',
  'daniel': 'DAN', 'dan': 'DAN',
  'osée': 'HOS', 'osee': 'HOS', 'hosea': 'HOS', 'hos': 'HOS',
  'joël': 'JOL', 'joel': 'JOL', 'jol': 'JOL',
  'amos': 'AMO', 'amo': 'AMO',
  'abdias': 'OBA', 'obadiah': 'OBA', 'oba': 'OBA',
  'jonas': 'JON', 'jonah': 'JON', 'jon': 'JON',
  'michée': 'MIC', 'michee': 'MIC', 'micah': 'MIC', 'mic': 'MIC',
  'nahum': 'NAM', 'nam': 'NAM',
  'habacuc': 'HAB', 'habakkuk': 'HAB', 'hab': 'HAB',
  'sophonie': 'ZEP', 'zephaniah': 'ZEP', 'zep': 'ZEP',
  'aggée': 'HAG', 'aggee': 'HAG', 'haggai': 'HAG', 'hag': 'HAG',
  'zacharie': 'ZEC', 'zechariah': 'ZEC', 'zec': 'ZEC',
  'malachie': 'MAL', 'malachi': 'MAL', 'mal': 'MAL',
  'matthieu': 'MAT', 'matthew': 'MAT', 'mat': 'MAT', 'mt': 'MAT',
  'marc': 'MRK', 'mark': 'MRK', 'mrk': 'MRK', 'mc': 'MRK',
  'luc': 'LUK', 'luke': 'LUK', 'luk': 'LUK', 'lc': 'LUK',
  'jean': 'JHN', 'john': 'JHN', 'jn': 'JHN', 'jhn': 'JHN',
  'actes': 'ACT', 'acts': 'ACT', 'act': 'ACT',
  'romains': 'ROM', 'romans': 'ROM', 'rom': 'ROM',
  '1 corinthiens': '1CO', '1 cor': '1CO', '1co': '1CO',
  '2 corinthiens': '2CO', '2 cor': '2CO', '2co': '2CO',
  'galates': 'GAL', 'galatians': 'GAL', 'gal': 'GAL',
  'éphésiens': 'EPH', 'ephesiens': 'EPH', 'ephesians': 'EPH', 'eph': 'EPH',
  'philippiens': 'PHP', 'philippians': 'PHP', 'php': 'PHP', 'phil': 'PHP',
  'colossiens': 'COL', 'colossians': 'COL', 'col': 'COL',
  '1 thessaloniciens': '1TH', '1 thes': '1TH', '1th': '1TH',
  '2 thessaloniciens': '2TH', '2 thes': '2TH', '2th': '2TH',
  '1 timothée': '1TI', '1 timothee': '1TI', '1 tim': '1TI', '1ti': '1TI',
  '2 timothée': '2TI', '2 timothee': '2TI', '2 tim': '2TI', '2ti': '2TI',
  'tite': 'TIT', 'titus': 'TIT',
  'philémon': 'PHM', 'philemon': 'PHM', 'phm': 'PHM',
  'hébreux': 'HEB', 'hebrews': 'HEB', 'heb': 'HEB',
  'jacques': 'JAS', 'james': 'JAS', 'jas': 'JAS',
  '1 pierre': '1PE', '1 peter': '1PE', '1pe': '1PE',
  '2 pierre': '2PE', '2 peter': '2PE', '2pe': '2PE',
  '1 jean': '1JN', '1 john': '1JN', '1jn': '1JN',
  '2 jean': '2JN', '2 john': '2JN', '2jn': '2JN',
  '3 jean': '3JN', '3 john': '3JN', '3jn': '3JN',
  'jude': 'JUD',
  'apocalypse': 'REV', 'révélation': 'REV', 'revelation': 'REV', 'rev': 'REV',
};

const accentless = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function parseReferenceSmart(raw: string): SmartToken | null {
  const input = raw.trim();
  if (!input) return null;

  // 1) Si utilitaire interne dispo
  try {
    const parsed = BibleReferenceUtils?.parseReference?.(input);
    if (parsed?.book && parsed?.chapter) {
      if (parsed?.endVerse) {
        return { kind: 'range', raw, range: { start: parsed, end: { book: parsed.book, chapter: parsed.chapter, verse: parsed.endVerse } } };
      }
      return { kind: 'reference', raw, ref: parsed };
    }
  } catch { /* ignore */ }

  // 2) Parser basique local (FR/EN + abréviations)
  //   - Plage : "Jean 3:16-4:2" | "Jean 3:16 - Jean 4:2" | "de Jean 3:16 à 4:2"
  //   - Référence simple : "Jean 3:16", "Psaume 23"
  const cleaned = input.replace(/\s+/g, ' ').trim();

  // Plage explicite "X à Y" / "X - Y"
  const rangeMatch = cleaned.match(/(.+?)[\s-–—àto]{1,3}(.+)/i);
  if (rangeMatch) {
    const left = rangeMatch[1].trim();
    const right = rangeMatch[2].trim();
    const l = parseSingleRef(left);
    const r = parseSingleRef(right, l?.book);
    if (l && r) return { kind: 'range', raw, range: { start: l, end: r } };
  }

  // Simple
  const single = parseSingleRef(cleaned);
  if (single) return { kind: 'reference', raw, ref: single };

  return null;
}

function parseSingleRef(input: string, defaultBook?: string): VerseRef | null {
  // Ex: "Jean 3:16", "Psaume 23", "3:16" (si defaultBook), "3" (chapitre seul si defaultBook)
  const s = input.trim();

  // Tente "Book Chap:Verse?"
  const m = s.match(/^([^\d:]+)?\s*(\d{1,3})(?::(\d{1,3}))?$/i);
  if (m) {
    const rawBook = (m[1] ?? '').trim();
    const chap = Number(m[2]);
    const verse = m[3] ? Number(m[3]) : undefined;

    const bookOsis = rawBook
      ? resolveBookToOSIS(rawBook)
      : defaultBook ?? null;
    if (!bookOsis) return null;

    return { book: bookOsis, chapter: chap, verse };
  }

  // Tente "Book" seul (rarement utile)
  const bookOnly = resolveBookToOSIS(s);
  if (bookOnly) return { book: bookOnly, chapter: 1, verse: 1 };

  return null;
}

function resolveBookToOSIS(rawBook: string): string | null {
  const k = accentless(rawBook.replace(/\./g, '').trim());
  if (BIBLE_BOOK_ALIASES[k]) return BIBLE_BOOK_ALIASES[k];
  // Gestion "1 Jean" -> normaliser le numéro devant
  const numMatch = k.match(/^([123])\s*(.+)$/);
  if (numMatch) {
    const num = numMatch[1];
    const rest = numMatch[2].trim();
    const base = BIBLE_BOOK_ALIASES[rest];
    if (base) return (num + base) as string; // ex: '1' + 'JN' -> '1JN'
  }
  return null;
}

function splitTokens(raw: string): string[] {
  return raw
    .split(SEPARATORS_REGEX)
    .map(s => s.trim())
    .filter(Boolean);
}

function classifyToken(raw: string): SmartToken | null {
  const s = raw.trim();
  if (!s) return null;

  // Phrase exacte si entourée de guillemets
  const phraseMatch = s.match(/^["“”'‘’](.+?)["“”'‘’]$/);
  if (phraseMatch) {
    return { kind: 'phrase', raw, value: phraseMatch[1].trim() };
  }

  // Référence ou plage
  const ref = parseReferenceSmart(s);
  if (ref) return ref;

  // Approx si contient ~ ou ≈ ou "?" final ou mot > 20 chars (heuristique)
  if (/[~≈]|\?$/.test(s) || s.length > 20) {
    return { kind: 'approx', raw, value: s.replace(/[~≈]|\?$/g, '').trim() };
  }

  // Mot/texte
  return { kind: 'word', raw, value: s };
}

// Accent-insensitive, word-boundary highlight
function renderHighlighted(text: string, query: string): React.ReactNode[] {
  const norm = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const q = norm(query).trim();
  if (!q) return [text];

  // Séparer multi-mots pour surlignage (max 4 pour rester performant)
  const parts = q.split(/\s+/).filter(Boolean).slice(0, 4);
  if (parts.length === 0) return [text];

  const pattern = parts.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(`\\b(${pattern})\\b`, 'gi');

  const src = text;
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(norm(src))) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    out.push(src.slice(last, start));
    out.push(
      <Text key={`${start}-${end}`} style={{ backgroundColor: 'yellow', color: 'black', fontWeight: 'bold' }}>
        {src.slice(start, end)}
      </Text>
    );
    last = end;
  }
  out.push(src.slice(last));
  return out;
}

// Crée un ordinal pour filtrer par portée Start→End
function makeOrdinal(ref: VerseRef, bibleBooks: { id: string; chapters: number }[]) {
  const bIndex = bibleBooks.findIndex(b => b.id === ref.book);
  const bookOrd = bIndex < 0 ? 0 : bIndex + 1;
  const chapter = ref.chapter || 0;
  const verse = ref.verse ?? 0;
  // Espace ordinal large pour éviter collisions
  return bookOrd * 1e6 + chapter * 1e3 + verse;
}

function withinScope(res: BibleSearchResult, scope: { start?: VerseRef; end?: VerseRef }, bibleBooks: any[]) {
  if (!scope.start && !scope.end) return true;
  try {
    const vRef: VerseRef = { book: res.verse.book, chapter: res.verse.chapter, verse: res.verse.verse };
    const vOrd = makeOrdinal(vRef, bibleBooks);
    const startOrd = scope.start ? makeOrdinal(scope.start, bibleBooks) : -Infinity;
    const endOrd = scope.end ? makeOrdinal(scope.end, bibleBooks) : Infinity;
    return vOrd >= startOrd && vOrd <= endOrd;
  } catch {
    return true;
  }
}

export default function BibleSmartSearchScreen() {
  const theme = useAppTheme();
  const { searchVerses, clearSearch, navigateToChapter, bibleBooks } = useBible();

  const [rawQuery, setRawQuery] = useState('');
  const [scopeStartRaw, setScopeStartRaw] = useState('');
  const [scopeEndRaw, setScopeEndRaw] = useState('');
  const [tokens, setTokens] = useState<SmartToken[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'all' | 'exact' | 'phrase' | 'fuzzy'>('all');

  // Parse scope refs
  const scope = useMemo(() => {
    const s = parseReferenceSmart(scopeStartRaw || '');
    const e = parseReferenceSmart(scopeEndRaw || '');
    return {
      start: s && (s.kind === 'reference' ? s.ref : s.kind === 'range' ? s.range.start : undefined),
      end: e && (e.kind === 'reference' ? e.ref : e.kind === 'range' ? e.range.end : undefined),
    } as { start?: VerseRef; end?: VerseRef };
  }, [scopeStartRaw, scopeEndRaw]);

  // Parse tokens (up to 5)
  useEffect(() => {
    const parts = splitTokens(rawQuery).slice(0, MAX_TOKENS);
    const classified = parts.map(classifyToken).filter(Boolean) as SmartToken[];
    setTokens(classified);
  }, [rawQuery]);

  const navigateFromRef = useCallback(async (ref: VerseRef) => {
    try {
      await navigateToChapter({ ...ref });
    } catch {
      Alert.alert('Navigation', 'Impossible de naviguer vers la référence demandée.');
    }
  }, [navigateToChapter]);

  const executeToken = useCallback(async (t: SmartToken): Promise<BibleSearchResult[]> => {
    // 1) Navigation directe si référence seule (UX: on ne bloque pas, on renvoie aussi des résultats de contexte)
    if (t.kind === 'reference') {
      navigateFromRef(t.ref);
      // Petit bonus: lancer aussi une recherche locale du chapitre pour contexte
      const q = `${t.ref.book} ${t.ref.chapter}`;
      const res = await searchVerses(q, 50);
      return res ?? [];
    }

    if (t.kind === 'range') {
      // Navigue au début, puis renvoie les résultats du bloc (filtrage post-search)
      navigateFromRef(t.range.start);
      // Recherche large sur le livre de départ, on filtrera ensuite
      const q = `${t.range.start.book} ${t.range.start.chapter}`;
      const res = await searchVerses(q, 200);
      return res ?? [];
    }

    // 2) Phrase
    if (t.kind === 'phrase') {
      // Stratégie: tenter avec guillemets puis sans, puis accentless
      const tries = [
        `"${t.value}"`,
        `${t.value}`,
        accentless(t.value),
      ];
      const batches = await Promise.all(tries.map(val => searchVerses(val, 50)));
      return dedupeResults(batches.flat().filter(Boolean) as unknown as BibleSearchResult[]);
    }

    // 3) Word / Approx → expansions
    const base = t.value.trim();
    const words = base.split(/\s+/).filter(Boolean).slice(0, 5);
    const expansions: string[] = [];

    // Mode exact ou all: mot complet
    if (mode === 'exact' || mode === 'all') expansions.push(base);
    // Mode phrase: jointure
    if (mode === 'phrase' || mode === 'all') expansions.push(`"${base}"`);
    // Mode fuzzy: variantes accentless + sous-termes
    if (mode === 'fuzzy' || mode === 'all') {
      expansions.push(accentless(base));
      if (words.length >= 2) {
        // combinaisons 2-gram
        for (let i = 0; i < words.length - 1; i++) {
          expansions.push(`${words[i]} ${words[i + 1]}`);
        }
        // sous-mots
        words.forEach(w => expansions.push(w));
      }
    }

    const unique = Array.from(new Set(expansions)).slice(0, 8);
    const batches = await Promise.all(unique.map(val => searchVerses(val, 50)));
    return dedupeResults(batches.flat().filter(Boolean) as unknown as BibleSearchResult[]);
  }, [mode, navigateFromRef, searchVerses]);

  const runSearch = useCallback(async () => {
    setError(null);
    setRunning(true);
    setSections([]);
    clearSearch();

    try {
      if (tokens.length === 0) {
        // Si rien: tenter de reconnaître une ref directe
        const ref = parseReferenceSmart(rawQuery);
        if (ref?.kind === 'reference') {
          await navigateFromRef(ref.ref);
          setRunning(false);
          return;
        }
        if (!rawQuery.trim()) {
          setRunning(false);
          return;
        }
      }

      const selected = tokens.slice(0, MAX_TOKENS);
      const batches = await Promise.all(selected.map(executeToken));

      const grouped: Section[] = selected.map((t, idx) => {
        const res = (batches[idx] || []).filter(r => withinScope(r, scope, bibleBooks ?? []));
        return { token: t, results: limitAndSort(res) };
      });

      setSections(grouped);
    } catch (e: any) {
      setError(e?.message || 'Erreur pendant la recherche');
    } finally {
      setRunning(false);
    }
  }, [tokens, rawQuery, executeToken, scope, bibleBooks, clearSearch, navigateFromRef]);

  const headerHint = useMemo(() => {
    if (!rawQuery.trim()) return 'Tapez une requête ou plusieurs (séparées par “;” ou retour à la ligne).';
    const count = tokens.length;
    return count > 1 ? `${count} requêtes détectées (max 5).` : '1 requête détectée.';
  }, [rawQuery, tokens.length]);

  const onPressQuick = (q: string) => {
    if (!rawQuery.trim()) setRawQuery(q);
    else setRawQuery(prev => `${prev.trim()}; ${q}`);
  };

  const quicks = useMemo(
    () => ['Jean 3:16', 'Psaume 23', '"car Dieu a tant aimé"', 'amour', 'foi', 'David', 'espérance', 'Genèse 1:1-2:3'],
    []
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <FlatList
          data={sections}
          keyExtractor={(_, i) => `sec-${i}`}
          ListHeaderComponent={
            <View>
              <LinearGradient
                colors={[theme.colors.primary + '22', theme.colors.primary + '08']}
                style={styles.hero}
              >
                <Text style={[styles.title, { color: theme.custom.colors.text }]}>Recherche Bible intelligente</Text>
                <Text style={[styles.subtitle, { color: theme.custom.colors.placeholder }]}>{headerHint}</Text>

                {/* Input multi-requêtes */}
                <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
                  <Feather name="search" size={20} color={theme.custom.colors.placeholder} />
                  <TextInput
                    value={rawQuery}
                    onChangeText={setRawQuery}
                    placeholder='Ex: Jean 3:16; "Dieu a tant aimé"; amour'
                    placeholderTextColor={theme.custom.colors.placeholder}
                    style={[styles.input, { color: theme.custom.colors.text }]}
                    multiline
                  />
                  {rawQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setRawQuery('')} style={styles.clearBtn}>
                      <Feather name="x" size={18} color={theme.custom.colors.placeholder} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Chips requêtes détectées */}
                {tokens.length > 0 && (
                  <View style={styles.tokenRow}>
                    {tokens.map((t, i) => (
                      <View key={i} style={[styles.chip, { borderColor: theme.colors.primary + '44', backgroundColor: theme.colors.primary + '12' }]}>
                        <Text style={[styles.chipText, { color: theme.colors.primary }]}>
                          {t.kind.toUpperCase()} · {t.raw}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Scope Start/End */}
                <View style={styles.scopeRow}>
                  <ScopeField
                    label="Portée — Début"
                    value={scopeStartRaw}
                    onChange={setScopeStartRaw}
                    placeholder="Ex: Genèse 1:1"
                    themeColors={theme}
                  />
                  <View style={{ width: 10 }} />
                  <ScopeField
                    label="Portée — Fin"
                    value={scopeEndRaw}
                    onChange={setScopeEndRaw}
                    placeholder="Ex: Apocalypse 22:21"
                    themeColors={theme}
                  />
                </View>

                {/* Modes */}
                <View style={styles.modesRow}>
                  {(['all', 'exact', 'phrase', 'fuzzy'] as const).map(m => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setMode(m)}
                      style={[
                        styles.modeBtn,
                        {
                          backgroundColor: mode === m ? theme.colors.primary : theme.colors.surface,
                          borderColor: theme.colors.primary + '55',
                        },
                      ]}
                    >
                      <Text style={[styles.modeText, { color: mode === m ? theme.colors.onPrimary : theme.custom.colors.text }]}>
                        {m === 'all' ? 'Tous' : m === 'exact' ? 'Exact' : m === 'phrase' ? 'Phrase' : 'Fuzzy'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Quick examples */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                  {quicks.map((q, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => onPressQuick(q)}
                      style={[styles.quick, { borderColor: theme.colors.primary + '55' }]}
                    >
                      <Text style={[styles.quickText, { color: theme.colors.primary }]}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* CTA */}
                <TouchableOpacity
                  onPress={runSearch}
                  disabled={running || tokens.length > MAX_TOKENS}
                  style={[
                    styles.searchBtn,
                    { backgroundColor: theme.colors.primary, opacity: running ? 0.6 : 1 },
                  ]}
                >
                  {running ? (
                    <ActivityIndicator color={theme.colors.onPrimary} />
                  ) : (
                    <Text style={[styles.searchBtnText, { color: theme.colors.onPrimary }]}>
                      Lancer la recherche groupée
                    </Text>
                  )}
                </TouchableOpacity>

                {error && (
                  <View style={[styles.errorBox, { backgroundColor: theme.colors.error + '14', borderColor: theme.colors.error + '55' }]}>
                    <Feather name="alert-triangle" size={16} color={theme.colors.error} />
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
                  </View>
                )}
              </LinearGradient>
            </View>
          }
          renderItem={({ item }) => (
            <ResultSection
              section={item}
              themeColors={theme}
              onPressVerse={(v) => navigateToChapter({
                book: v.verse.book, chapter: v.verse.chapter, verse: v.verse.verse
              })}
              renderHighlight={(text) => {
                const keyText =
                  item.token.kind === 'word' || item.token.kind === 'approx' || item.token.kind === 'phrase'
                    ? item.token.kind === 'phrase'
                      ? item.token.value
                      : item.token.value
                    : '';
                return keyText ? renderHighlighted(text, keyText) : [text];
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="book-open" size={48} color={theme.custom.colors.placeholder} />
              <Text style={[styles.emptyTitle, { color: theme.custom.colors.text }]}>Commencez votre recherche</Text>
              <Text style={[styles.emptySub, { color: theme.custom.colors.placeholder }]}>
                Tapez une référence (Jean 3:16), une plage (Jean 3:16-4:2), une phrase &quot;...&quot; ou des mots clés. Vous pouvez en mettre jusqu’à 5 à la fois.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** ─────────────────────────────
 *  Helpers UI
 *  ──────────────────────────── */
function ResultSection({
  section,
  themeColors,
  onPressVerse,
  renderHighlight,
}: {
  section: Section;
  themeColors: any;
  onPressVerse: (r: BibleSearchResult) => void;
  renderHighlight: (text: string) => React.ReactNode[];
}) {
  const header = (() => {
    const k = section.token.kind;
    if (k === 'reference') return `Référence · ${section.token.raw}`;
    if (k === 'range') return `Plage · ${section.token.raw}`;
    if (k === 'phrase') return `Phrase · ${section.token.raw}`;
    if (k === 'approx') return `Approx. · ${section.token.raw}`;
    return `Mot/Thème · ${section.token.raw}`;
  })();

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
      <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: themeColors.custom.colors.text, marginBottom: 8 }}>
        {header} — {section.results.length} résultat{section.results.length > 1 ? 's' : ''}
      </Text>
      {section.results.length === 0 ? (
        <View style={[styles.resultCard, { backgroundColor: themeColors.colors.surface }]}>
          <Text style={{ color: themeColors.custom.colors.placeholder, fontFamily: 'Nunito_400Regular' }}>
            Aucun résultat pour cette requête.
          </Text>
        </View>
      ) : (
        section.results.map((r, i) => (
          <TouchableOpacity
            key={`${r.verse.id}-${i}`}
            onPress={() => onPressVerse(r)}
            activeOpacity={0.7}
            style={[styles.resultCard, { backgroundColor: themeColors.colors.surface }]}
          >
            <Text style={{ color: themeColors.colors.primary, fontFamily: 'Nunito_700Bold', marginBottom: 4, fontSize: 14 }}>
              {r.verse.book} {r.verse.chapter}:{r.verse.verse}
            </Text>
            <Text style={{ color: themeColors.custom.colors.text, fontFamily: 'Nunito_400Regular', lineHeight: 20, fontSize: 14 }}>
              {renderHighlight(r.verse.text)}
            </Text>
            {r.matchType && (
              <Text style={{ color: themeColors.custom.colors.placeholder, fontStyle: 'italic', marginTop: 6, fontSize: 12 }}>
                Correspondance {r.matchType}
              </Text>
            )}
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

function ScopeField({
  label,
  value,
  onChange,
  placeholder,
  themeColors,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  themeColors: any;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 12, marginBottom: 6, color: themeColors.custom.colors.text }}>
        {label}
      </Text>
      <View style={[styles.scopeInput, { backgroundColor: themeColors.colors.surface }]}>
        <Feather name="flag" size={16} color={themeColors.custom.colors.placeholder} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={themeColors.custom.colors.placeholder}
          style={{ flex: 1, marginLeft: 8, color: themeColors.custom.colors.text, fontFamily: 'Nunito_400Regular' }}
          returnKeyType="done"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChange('')}>
            <Feather name="x" size={16} color={themeColors.custom.colors.placeholder} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/** ─────────────────────────────
 *  Utils résultats
 *  ──────────────────────────── */
function dedupeResults(arr: BibleSearchResult[]): BibleSearchResult[] {
  const seen = new Set<string>();
  const out: BibleSearchResult[] = [];
  for (const r of arr) {
    const k = r?.verse?.id ?? `${r?.verse?.book}-${r?.verse?.chapter}-${r?.verse?.verse}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push(r);
    }
  }
  return out;
}
function limitAndSort(arr: BibleSearchResult[], limit = 100): BibleSearchResult[] {
  // Tri léger: prioriser matchType 'exact' puis 'partial', sinon par ordre canonique approx.
  const score = (r: BibleSearchResult) =>
    r.matchType === 'exact' ? 0 : r.matchType === 'partial' ? 1 : 2;
  const sorted = [...arr].sort((a, b) => score(a) - score(b));
  return sorted.slice(0, limit);
}

/** ─────────────────────────────
 *  Styles
 *  ──────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: 16, paddingBottom: 12 },
  title: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold' },
  subtitle: { fontSize: 13, marginTop: 4, fontFamily: 'Nunito_400Regular' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 16, fontFamily: 'Nunito_400Regular', minHeight: 40 },
  clearBtn: { padding: 4, marginLeft: 6 },
  tokenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold' },
  scopeInput: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  scopeRow: { flexDirection: 'row', marginTop: 12 },
  modesRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  modeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  modeText: { fontFamily: 'Nunito_700Bold', fontSize: 12 },
  quick: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, marginRight: 8 },
  quickText: { fontFamily: 'Nunito_600SemiBold', fontSize: 12 },
  searchBtn: { marginTop: 14, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  searchBtnText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15 },
  errorBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: { fontFamily: 'Nunito_600SemiBold', fontSize: 12 },
  resultCard: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  empty: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 40 },
  emptyTitle: { fontFamily: 'Nunito_700Bold', fontSize: 18, marginTop: 10, textAlign: 'center' },
  emptySub: { fontFamily: 'Nunito_400Regular', fontSize: 14, marginTop: 6, textAlign: 'center', lineHeight: 20 },
});
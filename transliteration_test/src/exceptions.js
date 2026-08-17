/**
 * Exception dictionary for common book titles
 * These are manually curated for best accuracy
 */

export const exceptions = {
  'en:hi': {
    'atomic habits': 'एटॉमिक हैबिट्स',
    'harry potter': 'हैरी पॉटर',
    'the alchemist': 'द अलकेमिस्ट',
    'the hobbit': 'द हॉबिट',
    'lord of the rings': 'लॉर्ड ऑफ द रिंग्स',
    'the god of small things': 'द गॉड ऑफ स्मॉल थिंग्स',
    'a suitable boy': 'अ सूटेबल बॉय',
    'the white tiger': 'द व्हाइट टाइगर',
    "midnight's children": 'मिडनाइट्स चिल्ड्रन',
    'the palace of illusions': 'द पैलेस ऑफ इल्यूजन्स',
    'dune': 'ड्यून',
    'the silence of the lambs': 'द साइलेंस ऑफ द लैम्ब्स',
    'the da vinci code': 'द दा विंची कोड',
    'angels & demons': 'एंजल्स एंड डीमन्स',
  },
  'en:bn': {
    'atomic habits': 'এটমিক হ্যাবিটস',
    'harry potter': 'হ্যারি পটার',
    'the alchemist': 'দ্য অ্যালকেমিস্ট',
    'the hobbit': 'দ্য হবিট',
  },
  'en:ta': {
    'atomic habits': 'அடோமிக் ஹேபிட்ஸ்',
    'harry potter': 'ஹாரி பாட்டர்',
    'the alchemist': 'தி அல்கெமிஸ்ட்',
    'the hobbit': 'தி ஹாபிட்',
  },
  'en:te': {
    'atomic habits': 'అటామిక్ హాబిట్స్',
    'harry potter': 'హ్యారీ పాటర్',
  },
  'en:kn': {
    'atomic habits': 'ಅಟಾಮಿಕ್ ಹ್ಯಾಬಿಟ್ಸ್',
    'harry potter': 'ಹ್ಯಾರಿ ಪಾಟರ್',
  },
  'en:ml': {
    'atomic habits': 'അറ്റോമിക് ഹാബിറ്റ്സ്',
    'harry potter': 'ഹാരി പോട്ടർ',
  },
  'en:gu': {
    'atomic habits': 'એટોમિક હેબિટ્સ',
    'harry potter': 'હેરી પોટર',
  },
  'en:pa': {
    'atomic habits': 'ਐਟੋਮਿਕ ਹੈਬਿਟਸ',
    'harry potter': 'ਹੈਰੀ ਪੋਟਰ',
  },
  'en:or': {
    'atomic habits': 'ଏଟୋମିକ୍ ହ୍ୟାବିଟ୍ସ',
    'harry potter': 'ହ୍ୟାରୀ ପଟର',
  },
};

export function addException(source, target, original, transliterated) {
  const key = `${source}:${target}`;
  if (!exceptions[key]) {
    exceptions[key] = {};
  }
  exceptions[key][original.toLowerCase()] = transliterated;
  console.log(`✅ Added exception: ${original} → ${transliterated}`);
}

export function getException(source, target, text) {
  const key = `${source}:${target}`;
  if (exceptions[key] && exceptions[key][text.toLowerCase()]) {
    return exceptions[key][text.toLowerCase()];
  }
  return null;
}

export function getAllExceptions() {
  return exceptions;
}

export default exceptions;
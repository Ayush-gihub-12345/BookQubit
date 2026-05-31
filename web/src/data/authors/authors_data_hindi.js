// src/data/authors/authors_data_hindi.js
// Author image imports
import authors_image_data from "./authors_image_data";

const authorsDataHindi = [
  {
    id: 1,
    slug: "bhagat-singh",
    name: "भगत सिंह",
    birthYear: 1907,
    country: "भारत",
    bio: "भारतीय समाजवादी क्रांतिकारी जिनके ब्रिटिश शासन के खिलाफ नाटकीय प्रतिरोध ने उन्हें भारत के स्वतंत्रता संग्राम में एक पौराणिक व्यक्ति बना दिया।",
    bookCount: 3,
    mostFamousWork: "मैं नास्तिक क्यों हूं",
    genres: ["क्रांतिकारी", "राजनीतिक दर्शन"],
    image: authors_image_data.Bhagat_Singh,
    socials: {
      wikipedia: "https://hi.wikipedia.org/wiki/भगत_सिंह",
    },
    buttons: [
      { id: "know-more-1", label: "और जानें", action: "knowMore" },
      { id: "view-books-1", label: "पुस्तकें देखें", action: "viewBooks" },
    ],
  },

  {
    id: 2,
    slug: "yuval-noah-harari",
    name: "युवाल नोह हरारी",
    birthYear: 1976,
    country: "इज़राइल",
    bio: "इतिहासकार और दार्शनिक जो जटिल ऐतिहासिक विचारों को सुलभ वैश्विक कथाओं में बदलने के लिए जाने जाते हैं।",
    bookCount: 4,
    mostFamousWork: "सेपियन्स",
    genres: ["इतिहास", "दर्शन", "भविष्य अध्ययन"],
    image: authors_image_data.Yuval_Noah_Harari,
    socials: {
      wikipedia: "https://hi.wikipedia.org/wiki/युवाल_नोह_हरारी",
      website: "https://www.ynharari.com",
    },
    buttons: [
      { id: "know-more-2", label: "और जानें", action: "knowMore" },
      { id: "view-books-2", label: "पुस्तकें देखें", action: "viewBooks" },
    ],
  },

  {
    id: 3,
    slug: "george-orwell",
    name: "जॉर्ज ऑरवेल",
    birthYear: 1903,
    country: "यूनाइटेड किंगडम",
    bio: "अंग्रेजी उपन्यासकार और आलोचक, जो अधिनायकवाद और राजनीतिक हेरफेर की अपनी तीखी आलोचना के लिए प्रसिद्ध हैं।",
    bookCount: 5,
    mostFamousWork: "1984",
    genres: ["डिस्टोपियन", "राजनीतिक कथा"],
    image: authors_image_data.George_Orwell,
    socials: {
      wikipedia: "https://hi.wikipedia.org/wiki/जॉर्ज_ऑरवेल",
    },
    buttons: [
      { id: "know-more-3", label: "और जानें", action: "knowMore" },
      { id: "view-books-3", label: "पुस्तकें देखें", action: "viewBooks" },
    ],
  },

  {
    id: 4,
    slug: "br-ambedkar",
    name: "बी. आर. अम्बेडकर",
    birthYear: 1891,
    country: "भारत",
    bio: "न्यायविद, अर्थशास्त्री और समाज सुधारक जिन्होंने जातिगत भेदभाव के खिलाफ लड़ाई लड़ी और भारतीय संविधान का मसौदा तैयार किया।",
    bookCount: 7,
    mostFamousWork: "जाति का विनाश",
    genres: ["सामाजिक न्याय", "राजनीतिक विचार"],
    image: authors_image_data.B_R_Ambedkar,
    socials: {
      wikipedia: "https://hi.wikipedia.org/wiki/बी._आर._अम्बेडकर",
    },
    buttons: [
      { id: "know-more-4", label: "और जानें", action: "knowMore" },
      { id: "view-books-4", label: "पुस्तकें देखें", action: "viewBooks" },
    ],
  },

  {
    id: 5,
    slug: "osho",
    name: "ओशो",
    birthYear: 1931,
    country: "भारत",
    bio: "रहस्यवादी और आध्यात्मिक गुरु जो ध्यान, जागरूकता और व्यक्तित्व के लिए अपने क्रांतिकारी दृष्टिकोण के लिए जाने जाते हैं।",
    bookCount: 10,
    mostFamousWork: "कुछ भी नहीं की किताब",
    genres: ["आध्यात्मिकता", "दर्शन"],
    image: authors_image_data.Osho,
    socials: {
      wikipedia: "https://hi.wikipedia.org/wiki/ओशो",
    },
    buttons: [
      { id: "know-more-5", label: "और जानें", action: "knowMore" },
      { id: "view-books-5", label: "पुस्तकें देखें", action: "viewBooks" },
    ],
  },

  {
    id: 6,
    slug: "friedrich-nietzsche",
    name: "फ्रेडरिक नीत्शे",
    birthYear: 1844,
    country: "जर्मनी",
    bio: "जर्मन दार्शनिक जो नैतिकता, धर्म और संस्कृति की अपनी कट्टरपंथी आलोचनाओं के लिए जाने जाते हैं।",
    bookCount: 15,
    mostFamousWork: "इस प्रकार बोले जराथुस्त्र",
    genres: ["दर्शन", "अस्तित्ववाद", "मनोविज्ञान"],
    image: authors_image_data.Friedrich_Nietzsche,
    socials: {
      wikipedia: "https://hi.wikipedia.org/wiki/फ्रेडरिक_नीत्शे",
    },
    buttons: [
      { id: "know-more-6", label: "और जानें", action: "knowMore" },
      { id: "view-books-6", label: "पुस्तकें देखें", action: "viewBooks" },
    ],
  },

  {
    id: 7,
    slug: "immanuel-kant",
    name: "इमैनुएल कांट",
    birthYear: 1724,
    country: "जर्मनी",
    bio: "आधुनिक दर्शन के केंद्रीय व्यक्ति जिन्होंने पारलौकिक आदर्शवाद और नैतिक कर्तव्य के अपने सिद्धांत के माध्यम से ज्ञानमीमांसा और नैतिकता को नया रूप दिया।",
    bookCount: 12,
    mostFamousWork: "शुद्ध तर्क की आलोचना",
    genres: ["दर्शन", "ज्ञानमीमांसा", "नैतिकता"],
    image: authors_image_data.Immanuel_Kant,
    socials: {
      wikipedia: "https://hi.wikipedia.org/wiki/इमैनुएल_कांट",
    },
    buttons: [
      { id: "know-more-7", label: "और जानें", action: "knowMore" },
      { id: "view-books-7", label: "पुस्तकें देखें", action: "viewBooks" },
    ],
  },

  {
    id: 8,
    slug: "arthur-schopenhauer",
    name: "आर्थर शोपेनहावर",
    birthYear: 1788,
    country: "जर्मनी",
    bio: "जर्मन दार्शनिक जो अपने निराशावादी विश्वदृष्टिकोण के लिए जाने जाते हैं, मानव अस्तित्व की प्रेरक शक्ति के रूप में अंधी, अतार्किक इच्छा की भूमिका पर जोर देते हैं।",
    bookCount: 8,
    mostFamousWork: "दुनिया इच्छा और प्रतिनिधित्व के रूप में",
    genres: ["दर्शन", "तत्वमीमांसा", "निराशावाद"],
    image: authors_image_data.Arthur_Schopenhauer,
    socials: {
      wikipedia: "https://hi.wikipedia.org/wiki/आर्थर_शोपेनहावर",
    },
    buttons: [
      { id: "know-more-8", label: "और जानें", action: "knowMore" },
      { id: "view-books-8", label: "पुस्तकें देखें", action: "viewBooks" },
    ],
  },

  {
    id: 9,
    slug: "georg-wilhelm-friedrich-hegel",
    name: "जॉर्ज विल्हेम फ्रेडरिक हेगेल",
    birthYear: 1770,
    country: "जर्मनी",
    bio: "जर्मन दार्शनिक और जर्मन आदर्शवाद के केंद्रीय व्यक्ति, जो अपनी द्वंद्वात्मक पद्धति और इतिहास को तर्क और स्वतंत्रता के प्रगतिशील उन्मूलन के रूप में देखने के लिए जाने जाते हैं।",
    bookCount: 10,
    mostFamousWork: "आत्मा की घटना विज्ञान",
    genres: ["दर्शन", "जर्मन आदर्शवाद", "तत्वमीमांसा"],
    image: authors_image_data.Georg_Wilhelm_Friedrich_Hegel,
    socials: {
      wikipedia: "https://hi.wikipedia.org/wiki/जॉर्ज_विल्हेम_फ्रेडरिक_हेगेल",
    },
    buttons: [
      { id: "know-more-9", label: "और जानें", action: "knowMore" },
      { id: "view-books-9", label: "पुस्तकें देखें", action: "viewBooks" },
    ],
  },

  {
    id: 10,
    slug: "leo-tolstoy",
    name: "लियो टॉल्स्टॉय",
    birthYear: 1828,
    country: "रूस",
    bio: "रूसी लेखक जिन्हें अब तक के महानतम लेखकों में से एक माना जाता है, जो मानव मनोविज्ञान और समाज में गहरी अंतर्दृष्टि के लिए जाने जाते हैं।",
    bookCount: 20,
    mostFamousWork: "युद्ध और शांति",
    genres: ["कल्पना", "दर्शन", "यथार्थवाद"],
    image: authors_image_data.Leo_Tolstoy,
    socials: {
      wikipedia: "https://hi.wikipedia.org/wiki/लियो_टॉल्स्टॉय",
    },
    buttons: [
      { id: "know-more-10", label: "और जानें", action: "knowMore" },
      { id: "view-books-10", label: "पुस्तकें देखें", action: "viewBooks" },
    ],
  },
];

export default authorsDataHindi;
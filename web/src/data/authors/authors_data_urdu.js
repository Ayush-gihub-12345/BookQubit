// src/data/authors/authors_data_urdu.js
// Author image imports
import authors_image_data from "./authors_image_data";

const authorsDataUrdu = [
  {
    id: 1,
    slug: "bhagat-singh",
    name: "بھگت سنگھ",
    birthYear: 1907,
    country: "بھارت",
    bio: "ہندوستانی سوشلسٹ انقلابی جن کی برطانوی راج کے خلاف مزاحمتی کارروائیوں نے ہندوستان کی آزادی کی تحریک میں انہیں ایک لیجنڈری شخصیت بنا دیا۔",
    bookCount: 3,
    mostFamousWork: "میں ملحد کیوں ہوں",
    genres: ["انقلابی", "سیاسی فلسفہ"],
    image: authors_image_data.Bhagat_Singh,
    socials: {
      wikipedia: "https://ur.wikipedia.org/wiki/بھگت_سنگھ",
    },
    buttons: [
      { id: "know-more-1", label: "مزید جانیں", action: "knowMore" },
      { id: "view-books-1", label: "کتابیں دیکھیں", action: "viewBooks" },
    ],
  },

  {
    id: 2,
    slug: "yuval-noah-harari",
    name: "یوول نوح ہراری",
    birthYear: 1976,
    country: "اسرائیل",
    bio: "مورخ اور فلسفی جو پیچیدہ تاریخی خیالات کو قابل رسائی عالمی بیانیے میں تبدیل کرنے کے لیے جانا جاتا ہے۔",
    bookCount: 4,
    mostFamousWork: "سیپینز",
    genres: ["تاریخ", "فلسفہ", "مستقبل کے مطالعہ"],
    image: authors_image_data.Yuval_Noah_Harari,
    socials: {
      wikipedia: "https://en.wikipedia.org/wiki/Yuval_Noah_Harari",
      website: "https://www.ynharari.com",
    },
    buttons: [
      { id: "know-more-2", label: "مزید جانیں", action: "knowMore" },
      { id: "view-books-2", label: "کتابیں دیکھیں", action: "viewBooks" },
    ],
  },

  {
    id: 3,
    slug: "george-orwell",
    name: "جارج اورویل",
    birthYear: 1903,
    country: "برطانیہ",
    bio: "انگریز ناول نگار اور نقاد، جو مطلق العنانی اور سیاسی ہیرا پھیری کی اپنی تیز تنقید کے لیے مشہور ہیں۔",
    bookCount: 5,
    mostFamousWork: "1984",
    genres: ["ڈسٹوپین", "سیاسی افسانہ"],
    image: authors_image_data.George_Orwell,
    socials: {
      wikipedia: "https://ur.wikipedia.org/wiki/جارج_اورویل",
    },
    buttons: [
      { id: "know-more-3", label: "مزید جانیں", action: "knowMore" },
      { id: "view-books-3", label: "کتابیں دیکھیں", action: "viewBooks" },
    ],
  },

  {
    id: 4,
    slug: "br-ambedkar",
    name: "بی آر امبیڈکر",
    birthYear: 1891,
    country: "بھارت",
    bio: "ماہر قانون، ماہر معاشیات، اور سماجی مصلح جنہوں نے ذات پات کے امتیاز کے خلاف جنگ لڑی اور ہندوستانی آئین کا مسودہ تیار کیا۔",
    bookCount: 7,
    mostFamousWork: "نسل کشی کا خاتمہ",
    genres: ["سماجی انصاف", "سیاسی فکر"],
    image: authors_image_data.B_R_Ambedkar,
    socials: {
      wikipedia: "https://ur.wikipedia.org/wiki/بھیم_راو_امبیڈکر",
    },
    buttons: [
      { id: "know-more-4", label: "مزید جانیں", action: "knowMore" },
      { id: "view-books-4", label: "کتابیں دیکھیں", action: "viewBooks" },
    ],
  },

  {
    id: 5,
    slug: "osho",
    name: "اوشو",
    birthYear: 1931,
    country: "بھارت",
    bio: "صوفیانہ اور روحانی استاد جو مراقبہ، بیداری اور انفرادیت کے لیے اپنے انقلابی نقطہ نظر کے لیے جانا جاتا ہے۔",
    bookCount: 10,
    mostFamousWork: "کتابِ هیچ",
    genres: ["روحانیت", "فلسفہ"],
    image: authors_image_data.Osho,
    socials: {
      wikipedia: "https://ur.wikipedia.org/wiki/اوشو",
    },
    buttons: [
      { id: "know-more-5", label: "مزید جانیں", action: "knowMore" },
      { id: "view-books-5", label: "کتابیں دیکھیں", action: "viewBooks" },
    ],
  },

  {
    id: 6,
    slug: "friedrich-nietzsche",
    name: "فرائیڈرش نطشے",
    birthYear: 1844,
    country: "جرمنی",
    bio: "جرمن فلسفی جو اخلاق، مذہب اور ثقافت کی اپنی بنیادی تنقیدوں کے لیے جانا جاتا ہے، اور اس طرح کے خیالات جیسے Übermensch اور طاقت کی خواہش۔",
    bookCount: 15,
    mostFamousWork: "چنانچہ زرتھوسٹرا بولا",
    genres: ["فلسفہ", "وجودیت", "نفسیات"],
    image: authors_image_data.Friedrich_Nietzsche,
    socials: {
      wikipedia: "https://ur.wikipedia.org/wiki/فرائیڈرش_نطشے",
    },
    buttons: [
      { id: "know-more-6", label: "مزید جانیں", action: "knowMore" },
      { id: "view-books-6", label: "کتابیں دیکھیں", action: "viewBooks" },
    ],
  },

  {
    id: 7,
    slug: "immanuel-kant",
    name: "عمانوئیل کانٹ",
    birthYear: 1724,
    country: "جرمنی",
    bio: "جدید فلسفے کی مرکزی شخصیت جس نے ماورائی مثالیات اور اخلاقی فرض کے اپنے نظریہ کے ذریعے علمیات اور اخلاقیات کو نئی شکل دی۔",
    bookCount: 12,
    mostFamousWork: "خالص عقل کی تنقید",
    genres: ["فلسفہ", "علمیات", "اخلاقیات"],
    image: authors_image_data.Immanuel_Kant,
    socials: {
      wikipedia: "https://ur.wikipedia.org/wiki/عمانوئیل_کانٹ",
    },
    buttons: [
      { id: "know-more-7", label: "مزید جانیں", action: "knowMore" },
      { id: "view-books-7", label: "کتابیں دیکھیں", action: "viewBooks" },
    ],
  },

  {
    id: 8,
    slug: "arthur-schopenhauer",
    name: "ارتھر شوپنہاؤر",
    birthYear: 1788,
    country: "جرمنی",
    bio: "جرمن فلسفی اپنے مایوسی کے عالمی نقطہ نظر کے لیے مشہور ہے، جس میں انسانی وجود کی محرک قوت کے طور پر اندھی، غیر معقول خواہش کے کردار پر زور دیا گیا ہے۔",
    bookCount: 8,
    mostFamousWork: "دنیا بطور خواہش اور نمائندگی",
    genres: ["فلسفہ", "مابعدالطبیعیات", "مایوسی"],
    image: authors_image_data.Arthur_Schopenhauer,
    socials: {
      wikipedia: "https://ur.wikipedia.org/wiki/ارتھر_شوپنہاؤر",
    },
    buttons: [
      { id: "know-more-8", label: "مزید جانیں", action: "knowMore" },
      { id: "view-books-8", label: "کتابیں دیکھیں", action: "viewBooks" },
    ],
  },

  {
    id: 9,
    slug: "georg-wilhelm-friedrich-hegel",
    name: "جارج ولیم فریڈرک ہیگل",
    birthYear: 1770,
    country: "جرمنی",
    bio: "جرمن فلسفی اور جرمن آئیڈیلزم کی مرکزی شخصیت، جو اپنے جدلیاتی طریقہ کار اور تاریخ کو عقل اور آزادی کے ترقی پسند انکشاف کے طور پر دیکھنے کے لیے جانا جاتا ہے۔",
    bookCount: 10,
    mostFamousWork: "روح کا مظاہر",
    genres: ["فلسفہ", "جرمن آئیڈیلزم", "مابعدالطبیعیات"],
    image: authors_image_data.Georg_Wilhelm_Friedrich_Hegel,
    socials: {
      wikipedia: "https://ur.wikipedia.org/wiki/جرج_ولہلم_فریڈرک_ہیگل",
    },
    buttons: [
      { id: "know-more-9", label: "مزید جانیں", action: "knowMore" },
      { id: "view-books-9", label: "کتابیں دیکھیں", action: "viewBooks" },
    ],
  },

  {
    id: 10,
    slug: "leo-tolstoy",
    name: "لیو ٹالسٹائی",
    birthYear: 1828,
    country: "روس",
    bio: "روسی مصنف جسے اب تک کے عظیم ترین مصنفین میں سے ایک سمجھا جاتا ہے، جو انسانی نفسیات اور معاشرے میں گہری بصیرت کے لیے جانا جاتا ہے۔",
    bookCount: 20,
    mostFamousWork: "جنگ اور امن",
    genres: ["افسانہ", "فلسفہ", "حقیقت پسندی"],
    image: authors_image_data.Leo_Tolstoy,
    socials: {
      wikipedia: "https://ur.wikipedia.org/wiki/لیو_ٹالسٹائی",
    },
    buttons: [
      { id: "know-more-10", label: "مزید جانیں", action: "knowMore" },
      { id: "view-books-10", label: "کتابیں دیکھیں", action: "viewBooks" },
    ],
  },
];

export default authorsDataUrdu;
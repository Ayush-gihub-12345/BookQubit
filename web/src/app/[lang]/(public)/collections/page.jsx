// src/app/[lang]/collections/page.jsx
import CollectionsList from "@/features/collections/collections_list/collections_list";
import { generatePageMetadata } from "@/lib/seo";
import { locales } from "@/config/languages";

// Generate static params for all languages
export async function generateStaticParams() {
  return locales.map((locale) => ({
    lang: locale.code,
  }));
}

// Generate metadata dynamically based on language
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const currentLang = lang || 'en';
  
  const titles = {
    en: "Book Collections",
    es: "Colecciones de Libros",
    fr: "Collections de Livres",
    de: "Buchsammmlungen",
    ja: "本のコレクション",
    zh: "书籍收藏",
    hi: "पुस्तक संग्रह",
    ar: "مجموعات الكتب",
    ur: "کتابوں کے مجموعے",
    bn: "বুক কালেকশন",
    pt: "Coleções de Livros",
    ru: "Коллекции книг",
    it: "Collezioni di Libri",
    ko: "도서 컬렉션",
    nl: "Boencollecties",
    tr: "Kitap Koleksiyonları",
    vi: "Bộ Sưu Tập Sách",
    th: "คอลเลกชันหนังสือ",
    pl: "Kolekcje Książek",
    sv: "Boksamlingar",
  };
  
  const descriptions = {
    en: "Explore our curated book collections including bestsellers, new releases, editor's picks, and themed collections for every reader.",
    es: "Explore nuestras colecciones de libros seleccionadas, incluidos bestsellers, nuevos lanzamientos, selecciones del editor y colecciones temáticas para cada lector.",
    fr: "Explorez nos collections de livres organisées, y compris les best-sellers, les nouvelles sorties, les choix de l'éditeur et les collections thématiques pour chaque lecteur.",
    de: "Entdecken Sie unsere kuratierten Buchsammlungen, darunter Bestseller, Neuerscheinungen, Auswahl der Redaktion und thematische Sammlungen für jeden Leser.",
    ja: "ベストセラー、新刊、編集部おすすめ、テーマ別コレクションなど、厳選された本のコレクションをご覧ください。",
    zh: "探索我们精心策划的书籍收藏，包括畅销书、新书发布、编辑推荐以及为每位读者准备的主题收藏。",
    hi: "हमारे क्यूरेटेड बुक कलेक्शंस एक्सप्लोर करें जिसमें बेस्टसेलर, नए रिलीज़, एडिटर पिक्स और हर पाठक के लिए थीम कलेक्शंस शामिल हैं।",
  };
  
  return generatePageMetadata({
    title: titles[currentLang] || titles.en,
    description: descriptions[currentLang] || descriptions.en,
    path: "/collections",
    language: currentLang,
    type: "website",
    image: `/images/collections-og-${currentLang}.jpg`,
    alternateLanguages: locales.reduce((acc, locale) => {
      acc[locale.code] = `/${locale.code}/collections`;
      return acc;
    }, {}),
  });
}

export default function CollectionsPage() {
  return <CollectionsList />;
}
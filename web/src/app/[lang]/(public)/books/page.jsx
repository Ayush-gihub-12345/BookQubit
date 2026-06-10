// src/app/[lang]/(public)/books/page.jsx
import BookList from "@/features/book/booklist/booklist";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const currentLang = lang || "en";

  const titles = {
    en: "All Books | BookQubit",
    hi: "सभी पुस्तकें | BookQubit",
    ur: "تمام کتابیں | BookQubit",
    ar: "جميع الكتب | BookQubit",
    bn: "সমস্ত বই | BookQubit",
  };

  return {
    title: titles[currentLang] || titles.en,
    description: `Browse our complete collection of books in ${currentLang}. Find your next favorite read.`,
    alternates: {
      canonical: `https://bookqubit.com/${currentLang}/books`,
    },
  };
}

export default function BooksRoute() {
  return <BookList />;
}

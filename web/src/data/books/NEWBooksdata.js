import QubitBookData from './QubitBookData';

export const books = [
  {
    id: 1,

    // Core Details
    title: "Why I Am an Atheist",
    slug: "why-i-am-an-atheist",
    author: "Bhagat Singh",
    genre_catogory: "Essay",
    Collection: ["Philosophy", "Atheism"],

    // Book Languages
    book_lang: {
      originalLanguage: "Urdu",
      availableLanguages: ["English", "Hindi", "Punjabi", "Bengali", "Tamil"],
      currentEditionLanguage: "English",
      translations: [
        {
          language: "Hindi",
          title: "Main Nastik Kyon Hoon",
          publisher: "Rajkamal Prakashan",
          year: 2000
        },
        {
          language: "Punjabi",
          title: "Main Nastik Kyun Haan",
          publisher: "Lokgeet Parkashan",
          year: 2005
        },
        {
          language: "Bengali",
          title: "Ami Nastik Keno",
          publisher: "Ananda Publishers",
          year: 2010
        },
        {
          language: "Tamil",
          title: "Naan Endha Nambikkaiyil Illai",
          publisher: "New Century Book House",
          year: 2015
        }
      ]
    },

    // Book Time
    bookTime: {
      timeOfWriting: "1930",
      timeOfPublication: "1930",
      timePeriodCovered: "Colonial India"
    },

    // Geography
    geography: {
      country: "India",
      region: "South Asia",
      continent: "Asia",
      historicalEra: "British Raj",
      timePeriod: "Early 20th Century"
    },

    // SEO
    seo: {
      title: "Why I Am an Atheist – Summary & Details",
      description:
        "A bold rationalist essay written by Bhagat Singh during his imprisonment.",
      keywords: [
        "Why I Am an Atheist",
        "Bhagat Singh",
        "Atheism",
        "Revolutionary literature"
      ]
    },

    // Publication
    publication: {
      originalPublication: "Government of India Press, 1930",
      publicationYear: 1930,
      publisher: "Government of India Press",
      edition: "First Edition",
      isbn: "978-9389847120"
    },

    // Classification
    classification: {
      categories: ["Philosophy", "Atheism"],
      tags: ["Rationalism", "Revolution", "Colonial India"],
      subjects: ["Freedom Movement", "Philosophy"]
    },

    // Awards
    awards: [
      {
        name: "Historical Recognition",
        year: 1931,
        category: "Revolutionary Literature"
      }
    ],

    // Table of Contents
    tableOfContents: [
      { chapter: "Introduction", pages: "1–4" },
      { chapter: "Why I Reject God", pages: "5–10" },
      { chapter: "Reason & Revolution", pages: "11–20" }
    ],

    // Media
    media: {
      coverImage: QubitBookData.Why_I_Am_an_Atheist,
      audiobook: "https://youtu.be/z4qnQxWrmto",
      buyLink: "https://www.amazon.in/Why-Am-Atheist-Bhagat-Singh/dp/9389847125",
      previewLink: "https://books.google.com/books?id=..."
    },

    // Rating
    rating: 4.5,

    // Formats
    formats: ["Paperback", "Ebook", "Audiobook"],

    // Summary
    summary:
      "Written from the confines of Lahore Central Jail in 1930, *Why I Am an Atheist* is a bold and intellectually rigorous essay by Indian revolutionary Bhagat Singh. Challenging the notion that his disbelief in God was born out of arrogance, Singh presents a philosophical defense of atheism rooted in rationalism, humanism, and political consciousness.",

    // Buttons
    buttons: {
      knowMore: "/books/why-i-am-an-atheist",
      getBook:
        "https://www.amazon.in/Why-Am-Atheist-Bhagat-Singh/dp/9389847125?source=ps-sl-shoppingads-lpcontext&ref_=fplfs&psc=1&smid=A1UBX5OTEI9Y7I",
      readSummary: "#",
      listenAudiobook: "https://youtu.be/z4qnQxWrmto?si=ZWqVKRs2Ps_qs0uY"
    }
  },


  
];
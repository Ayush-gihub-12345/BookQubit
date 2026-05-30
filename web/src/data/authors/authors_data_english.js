// Author image imports
import authors_image_data from "./authors_image_data";

const authorsDataEnglish = [
  {
    id: 1,
    slug: "bhagat-singh",
    name: "Bhagat Singh",
    birthYear: 1907,
    country: "India",
    bio: "Indian socialist revolutionary whose acts of dramatic resistance against British rule made him a legendary figure in India's freedom struggle.",
    bookCount: 3,
    mostFamousWork: "Why I Am an Atheist",
    genres: ["Revolutionary", "Political Philosophy"],
    image: authors_image_data.Bhagat_Singh,
    socials: {
      wikipedia: "https://en.wikipedia.org/wiki/Bhagat_Singh",
    },
    buttons: [
      { id: "know-more-1", label: "Know More", action: "knowMore" },
      { id: "view-books-1", label: "View Books", action: "viewBooks" },
    ],
  },

  {
    id: 2,
    slug: "yuval-noah-harari",
    name: "Yuval Noah Harari",
    birthYear: 1976,
    country: "Israel",
    bio: "Historian and philosopher known for transforming complex historical ideas into accessible global narratives.",
    bookCount: 4,
    mostFamousWork: "Sapiens",
    genres: ["History", "Philosophy", "Future Studies"],
    image: authors_image_data.Yuval_Noah_Harari,
    socials: {
      wikipedia: "https://en.wikipedia.org/wiki/Yuval_Noah_Harari",
      website: "https://www.ynharari.com",
    },
    buttons: [
      { id: "know-more-2", label: "Know More", action: "knowMore" },
      { id: "view-books-2", label: "View Books", action: "viewBooks" },
    ],
  },

  {
    id: 3,
    slug: "george-orwell",
    name: "George Orwell",
    birthYear: 1903,
    country: "United Kingdom",
    bio: "English novelist and critic, famous for his sharp critique of totalitarianism and political manipulation.",
    bookCount: 5,
    mostFamousWork: "1984",
    genres: ["Dystopian", "Political Fiction"],
    image: authors_image_data.George_Orwell,
    socials: {
      wikipedia: "https://en.wikipedia.org/wiki/George_Orwell",
    },
    buttons: [
      { id: "know-more-3", label: "Know More", action: "knowMore" },
      { id: "view-books-3", label: "View Books", action: "viewBooks" },
    ],
  },

  {
    id: 4,
    slug: "br-ambedkar",
    name: "B. R. Ambedkar",
    birthYear: 1891,
    country: "India",
    bio: "Jurist, economist, and social reformer who fought against caste discrimination and drafted the Indian Constitution.",
    bookCount: 7,
    mostFamousWork: "Annihilation of Caste",
    genres: ["Social Justice", "Political Thought"],
    image: authors_image_data.B_R_Ambedkar,
    socials: {
      wikipedia: "https://en.wikipedia.org/wiki/B._R._Ambedkar",
    },
    buttons: [
      { id: "know-more-4", label: "Know More", action: "knowMore" },
      { id: "view-books-4", label: "View Books", action: "viewBooks" },
    ],
  },

  {
    id: 5,
    slug: "osho",
    name: "Osho",
    birthYear: 1931,
    country: "India",
    bio: "Mystic and spiritual teacher known for his revolutionary approach to meditation, awareness, and individuality.",
    bookCount: 10,
    mostFamousWork: "The Book of Nothing",
    genres: ["Spirituality", "Philosophy"],
    image: authors_image_data.Osho,
    socials: {
      wikipedia: "https://en.wikipedia.org/wiki/Rajneesh",
    },
    buttons: [
      { id: "know-more-5", label: "Know More", action: "knowMore" },
      { id: "view-books-5", label: "View Books", action: "viewBooks" },
    ],
  },

  {
    id: 6,
    slug: "friedrich-nietzsche",
    name: "Friedrich Nietzsche",
    birthYear: 1844,
    country: "Germany",
    bio: "German philosopher known for his radical critiques of morality, religion, and culture, and for ideas such as the Übermensch and the will to power.",
    bookCount: 15,
    mostFamousWork: "Thus Spoke Zarathustra",
    genres: ["Philosophy", "Existentialism", "Psychology"],
    image: authors_image_data.Friedrich_Nietzsche,
    socials: {
      wikipedia: "https://en.wikipedia.org/wiki/Friedrich_Nietzsche",
    },
    buttons: [
      { id: "know-more-6", label: "Know More", action: "knowMore" },
      { id: "view-books-6", label: "View Books", action: "viewBooks" },
    ],
  },

  {
    id: 7,
    slug: "immanuel-kant",
    name: "Immanuel Kant",
    birthYear: 1724,
    country: "Germany",
    bio: "Central figure of modern philosophy who reshaped epistemology and ethics through his theory of transcendental idealism and moral duty.",
    bookCount: 12,
    mostFamousWork: "Critique of Pure Reason",
    genres: ["Philosophy", "Epistemology", "Ethics"],
    image: authors_image_data.Immanuel_Kant,
    socials: {
      wikipedia: "https://en.wikipedia.org/wiki/Immanuel_Kant",
    },
    buttons: [
      { id: "know-more-7", label: "Know More", action: "knowMore" },
      { id: "view-books-7", label: "View Books", action: "viewBooks" },
    ],
  },

  {
    id: 8,
    slug: "arthur-schopenhauer",
    name: "Arthur Schopenhauer",
    birthYear: 1788,
    country: "Germany",
    bio: "German philosopher best known for his pessimistic worldview, emphasizing the role of the blind, irrational will as the driving force of human existence.",
    bookCount: 8,
    mostFamousWork: "The World as Will and Representation",
    genres: ["Philosophy", "Metaphysics", "Pessimism"],
    image: authors_image_data.Arthur_Schopenhauer,
    socials: {
      wikipedia: "https://en.wikipedia.org/wiki/Arthur_Schopenhauer",
    },
    buttons: [
      { id: "know-more-8", label: "Know More", action: "knowMore" },
      { id: "view-books-8", label: "View Books", action: "viewBooks" },
    ],
  },

  {
    id: 9,
    slug: "georg-wilhelm-friedrich-hegel",
    name: "Georg Wilhelm Friedrich Hegel",
    birthYear: 1770,
    country: "Germany",
    bio: "German philosopher and central figure of German Idealism, known for his dialectical method and viewing history as the progressive unfolding of reason and freedom.",
    bookCount: 10,
    mostFamousWork: "Phenomenology of Spirit",
    genres: ["Philosophy", "German Idealism", "Metaphysics"],
    image: authors_image_data.Georg_Wilhelm_Friedrich_Hegel,
    socials: {
      wikipedia: "https://en.wikipedia.org/wiki/Georg_Wilhelm_Friedrich_Hegel",
    },
    buttons: [
      { id: "know-more-9", label: "Know More", action: "knowMore" },
      { id: "view-books-9", label: "View Books", action: "viewBooks" },
    ],
  },

  {
    id: 10,
    slug: "leo-tolstoy",
    name: "Leo Tolstoy",
    birthYear: 1828,
    country: "Russia",
    bio: "Russian writer regarded as one of the greatest authors of all time, known for his deep insight into human psychology and society.",
    bookCount: 20,
    mostFamousWork: "War and Peace",
    genres: ["Fiction", "Philosophy", "Realism"],
    image: authors_image_data.Leo_Tolstoy,
    socials: {
      wikipedia: "https://en.wikipedia.org/wiki/Leo_Tolstoy",
    },
    buttons: [
      { id: "know-more-10", label: "Know More", action: "knowMore" },
      { id: "view-books-10", label: "View Books", action: "viewBooks" },
    ],
  },
];

export default authorsDataEnglish;
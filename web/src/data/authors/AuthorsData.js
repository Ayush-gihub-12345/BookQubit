import authors_image_data from "./authors_image_data";

const AuthorData = [
  {
    id: 1,
    slug: "bhagat-singh",
    name: "Bhagat Singh",
    birthYear: 1907,
    country: "India",
    bio:
      "Indian socialist revolutionary whose acts of dramatic resistance against British rule made him a legendary figure in India's freedom struggle.",
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
    bio:
      "Historian and philosopher known for transforming complex historical ideas into accessible global narratives.",
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
    bio:
      "English novelist and critic, famous for his sharp critique of totalitarianism and political manipulation.",
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
    bio:
      "Jurist, economist, and social reformer who fought against caste discrimination and drafted the Indian Constitution.",
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
    bio:
      "Mystic and spiritual teacher known for his revolutionary approach to meditation, awareness, and individuality.",
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
    bio:
      "German philosopher known for his radical critiques of morality, religion, and culture, and for ideas such as the Übermensch and the will to power.",
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
    bio:
      "Central figure of modern philosophy who reshaped epistemology and ethics through his theory of transcendental idealism and moral duty.",
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
    bio:
      "German philosopher best known for his pessimistic worldview, emphasizing the role of the blind, irrational will as the driving force of human existence.",
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
    bio:
      "German philosopher and central figure of German Idealism, known for his dialectical method and viewing history as the progressive unfolding of reason and freedom.",
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
  bio:
    "Russian writer regarded as one of the greatest authors of all time, known for his deep insight into human psychology and society.",
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

{
  id: 11,
  slug: "fyodor-dostoevsky",
  name: "Fyodor Dostoevsky",
  birthYear: 1821,
  country: "Russia",
  bio:
    "Russian novelist and philosopher best known for exploring psychology, morality, existentialism, and the human condition.",
  bookCount: 18,
  mostFamousWork: "Crime and Punishment",
  genres: ["Psychological Fiction", "Philosophy", "Existentialism"],
  image: authors_image_data.Fyodor_Dostoevsky,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/Fyodor_Dostoevsky",
  },
  buttons: [
    { id: "know-more-11", label: "Know More", action: "knowMore" },
    { id: "view-books-11", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 12,
  slug: "karl-marx",
  name: "Karl Marx",
  birthYear: 1818,
  country: "Germany",
  bio:
    "Philosopher, economist, and revolutionary socialist whose works shaped modern political thought and influenced global movements.",
  bookCount: 25,
  mostFamousWork: "The Communist Manifesto",
  genres: ["Political Theory", "Economics", "Philosophy"],
  image: authors_image_data.Karl_Marx,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/Karl_Marx",
  },
  buttons: [
    { id: "know-more-12", label: "Know More", action: "knowMore" },
    { id: "view-books-12", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 13,
  slug: "sigmund-freud",
  name: "Sigmund Freud",
  birthYear: 1856,
  country: "Austria",
  bio:
    "Neurologist and founder of psychoanalysis, known for his theories of the unconscious mind and human behavior.",
  bookCount: 30,
  mostFamousWork: "The Interpretation of Dreams",
  genres: ["Psychology", "Psychoanalysis", "Philosophy"],
  image: authors_image_data.Sigmund_Freud,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/Sigmund_Freud",
  },
  buttons: [
    { id: "know-more-13", label: "Know More", action: "knowMore" },
    { id: "view-books-13", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 14,
  slug: "albert-camus",
  name: "Albert Camus",
  birthYear: 1913,
  country: "France",
  bio:
    "French philosopher and novelist known for developing absurdism and writing powerful existential literature.",
  bookCount: 12,
  mostFamousWork: "The Stranger",
  genres: ["Existentialism", "Absurdism", "Philosophy"],
  image: authors_image_data.Albert_Camus,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/Albert_Camus",
  },
  buttons: [
    { id: "know-more-14", label: "Know More", action: "knowMore" },
    { id: "view-books-14", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 15,
  slug: "jean-paul-sartre",
  name: "Jean-Paul Sartre",
  birthYear: 1905,
  country: "France",
  bio:
    "French existentialist philosopher and Nobel prize-winning author, known for his ideas on freedom, responsibility, and existence.",
  bookCount: 16,
  mostFamousWork: "Being and Nothingness",
  genres: ["Existentialism", "Philosophy", "Phenomenology"],
  image: authors_image_data.Jean_Paul_Sartre,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/Jean-Paul_Sartre",
  },
  buttons: [
    { id: "know-more-15", label: "Know More", action: "knowMore" },
    { id: "view-books-15", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 16,
  slug: "plato",
  name: "Plato",
  birthYear: -428,
  country: "Greece",
  bio:
    "Classical Greek philosopher, student of Socrates, and founder of the Academy. His works laid the foundation of Western philosophy.",
  bookCount: 30,
  mostFamousWork: "The Republic",
  genres: ["Philosophy", "Political Theory", "Ethics"],
  image: authors_image_data.Plato,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/Plato",
  },
  buttons: [
    { id: "know-more-16", label: "Know More", action: "knowMore" },
    { id: "view-books-16", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 17,
  slug: "aristotle",
  name: "Aristotle",
  birthYear: -384,
  country: "Greece",
  bio:
    "Greek philosopher and polymath whose writings cover ethics, metaphysics, logic, science, and politics. Teacher of Alexander the Great.",
  bookCount: 40,
  mostFamousWork: "Nicomachean Ethics",
  genres: ["Philosophy", "Logic", "Science"],
  image: authors_image_data.Aristotle,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/Aristotle",
  },
  buttons: [
    { id: "know-more-17", label: "Know More", action: "knowMore" },
    { id: "view-books-17", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 18,
  slug: "socrates",
  name: "Socrates",
  birthYear: -470,
  country: "Greece",
  bio:
    "Ancient Greek philosopher credited as a founder of Western philosophy. Known for the Socratic method and his focus on ethical inquiry.",
  bookCount: 12,
  mostFamousWork: "Apology (via Plato)",
  genres: ["Philosophy", "Ethics"],
  image: authors_image_data.Socrates,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/Socrates",
  },
  buttons: [
    { id: "know-more-18", label: "Know More", action: "knowMore" },
    { id: "view-books-18", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 19,
  slug: "niccolo-machiavelli",
  name: "Niccolò Machiavelli",
  birthYear: 1469,
  country: "Italy",
  bio:
    "Italian diplomat, philosopher, and writer widely regarded as the father of modern political science.",
  bookCount: 10,
  mostFamousWork: "The Prince",
  genres: ["Political Philosophy", "Renaissance Thought"],
  image: authors_image_data.Niccolo_Machiavelli,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/Niccol%C3%B2_Machiavelli",
  },
  buttons: [
    { id: "know-more-19", label: "Know More", action: "knowMore" },
    { id: "view-books-19", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 20,
  slug: "john-locke",
  name: "John Locke",
  birthYear: 1632,
  country: "England",
  bio:
    "English philosopher and physician, known as the ‘Father of Liberalism.’ His theories on liberty and government shaped modern democracies.",
  bookCount: 14,
  mostFamousWork: "Two Treatises of Government",
  genres: ["Political Philosophy", "Epistemology"],
  image: authors_image_data.John_Locke,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/John_Locke",
  },
  buttons: [
    { id: "know-more-20", label: "Know More", action: "knowMore" },
    { id: "view-books-20", label: "View Books", action: "viewBooks" },
  ],
},
{
  id: 21,
  slug: "john-stuart-mill",
  name: "John Stuart Mill",
  birthYear: 1806,
  country: "United Kingdom",
  bio:
    "British philosopher and political economist, known for advocating liberty, utilitarianism, and social reform.",
  bookCount: 20,
  mostFamousWork: "On Liberty",
  genres: ["Philosophy", "Utilitarianism", "Political Theory"],
  image: authors_image_data.John_Stuart_Mill,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/John_Stuart_Mill",
  },
  buttons: [
    { id: "know-more-21", label: "Know More", action: "knowMore" },
    { id: "view-books-21", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 22,
  slug: "rene-descartes",
  name: "René Descartes",
  birthYear: 1596,
  country: "France",
  bio:
    "French philosopher, mathematician, and scientist known as the father of modern philosophy. Famous for 'Cogito, ergo sum'.",
  bookCount: 15,
  mostFamousWork: "Meditations on First Philosophy",
  genres: ["Philosophy", "Rationalism", "Metaphysics"],
  image: authors_image_data.Rene_Descartes,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/Ren%C3%A9_Descartes",
  },
  buttons: [
    { id: "know-more-22", label: "Know More", action: "knowMore" },
    { id: "view-books-22", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 23,
  slug: "jean-jacques-rousseau",
  name: "Jean-Jacques Rousseau",
  birthYear: 1712,
  country: "Switzerland",
  bio:
    "Genevan philosopher whose ideas on education, freedom, and social contract influenced modern political thought.",
  bookCount: 18,
  mostFamousWork: "The Social Contract",
  genres: ["Political Philosophy", "Education", "Enlightenment"],
  image: authors_image_data.Jean_Jacques_Rousseau,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/Jean-Jacques_Rousseau",
  },
  buttons: [
    { id: "know-more-23", label: "Know More", action: "knowMore" },
    { id: "view-books-23", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 24,
  slug: "david-hume",
  name: "David Hume",
  birthYear: 1711,
  country: "Scotland",
  bio:
    "Scottish Enlightenment philosopher known for his empiricism, skepticism, and contributions to moral philosophy.",
  bookCount: 14,
  mostFamousWork: "A Treatise of Human Nature",
  genres: ["Philosophy", "Empiricism", "Ethics"],
  image: authors_image_data.David_Hume,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/David_Hume",
  },
  buttons: [
    { id: "know-more-24", label: "Know More", action: "knowMore" },
    { id: "view-books-24", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 25,
  slug: "karl-poppe",
  name: "Karl Popper",
  birthYear: 1902,
  country: "Austria",
  bio:
    "Philosopher of science best known for rejecting classical inductivist methods and proposing falsifiability as the criterion of science.",
  bookCount: 12,
  mostFamousWork: "The Logic of Scientific Discovery",
  genres: ["Philosophy of Science", "Epistemology"],
  image: authors_image_data.Karl_Popper,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/Karl_Popper",
  },
  buttons: [
    { id: "know-more-25", label: "Know More", action: "knowMore" },
    { id: "view-books-25", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 26,
  slug: "carl-jung",
  name: "Carl Jung",
  birthYear: 1875,
  country: "Switzerland",
  bio:
    "Swiss psychiatrist and psychoanalyst who founded analytical psychology and introduced archetypes and the collective unconscious.",
  bookCount: 22,
  mostFamousWork: "Man and His Symbols",
  genres: ["Psychology", "Psychoanalysis"],
  image: authors_image_data.Carl_Jung,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/Carl_Jung",
  },
  buttons: [
    { id: "know-more-26", label: "Know More", action: "knowMore" },
    { id: "view-books-26", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 27,
  slug: "soren-kierkegaard",
  name: "Søren Kierkegaard",
  birthYear: 1813,
  country: "Denmark",
  bio:
    "Danish philosopher and theologian regarded as the father of existentialism.",
  bookCount: 16,
  mostFamousWork: "Either/Or",
  genres: ["Existentialism", "Philosophy", "Theology"],
  image: authors_image_data.Soren_Kierkegaard,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/S%C3%B8ren_Kierkegaard",
  },
  buttons: [
    { id: "know-more-27", label: "Know More", action: "knowMore" },
    { id: "view-books-27", label: "View Books", action: "viewBooks" },
  ],
},

{
  id: 28,
  slug: "simone-de-beauvoir",
  name: "Simone de Beauvoir",
  birthYear: 1908,
  country: "France",
  bio:
    "French existentialist philosopher, feminist, and social theorist known for her groundbreaking work on gender equality.",
  bookCount: 20,
  mostFamousWork: "The Second Sex",
  genres: ["Feminism", "Philosophy", "Existentialism"],
  image: authors_image_data.Simone_de_Beauvoir,
  socials: {
    wikipedia: "https://en.wikipedia.org/wiki/Simone_de_Beauvoir",
  },
  buttons: [
    { id: "know-more-28", label: "Know More", action: "knowMore" },
    { id: "view-books-28", label: "View Books", action: "viewBooks" },
  ],
},

];

export default AuthorData;
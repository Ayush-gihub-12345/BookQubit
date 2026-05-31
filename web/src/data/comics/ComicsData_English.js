// frontend/src/data/comics/ComicsData.js

import ComicsImageData from './ComicsImageData';

export const ComicsData = [
  {
    id: 1,
    slug: "marvel-comics-1",
    title: "Marvel Comics #1",
    publisher: "Timely Publications (Now Marvel Comics)",
    publicationDate: "October 1939",
    coverPrice: "10 cents",
    format: "68 pages, full color",
    charactersIntroduced: [
      "The Human Torch (Jim Hammond)",
      "Namor the Sub-Mariner",
      "Ka-Zar the Great",
      "The Masked Raider",
      "The Angel"
    ],
    creators: {
      editor: "Martin Goodman",
      writersArtists: [
        "Carl Burgos",
        "Bill Everett",
        "Ben Thompson",
        "Paul Gustavson",
        "Al Anders"
      ]
    },
    description: "Marvel Comics #1 (1939) marks the beginning of the Marvel Universe. Published by Timely Publications, it introduced iconic characters like the Human Torch and Namor the Sub-Mariner. The comic's anthology-style storytelling set the foundation for decades of superhero adventures and cemented Marvel's legacy in the comic world.",
    sales: {
      firstPrint: "80,000 copies",
      secondPrint: "800,000 copies (retitled Marvel Mystery Comics #1)"
    },
    valueToday: "$1.26 million (near-mint copy sold in 2019)",
    funFact: "Though called Marvel Comics, the company didn't officially take the Marvel name until the 1960s. This first issue's success led directly to the rise of the Marvel brand.",
    image: ComicsImageData.MarvelComics1,
    category: "Golden Age",
    rating: 9.8
  },
  {
    id: 2,
    slug: "amazing-fantasy-15",
    title: "Amazing Fantasy #15",
    publisher: "Marvel Comics",
    publicationDate: "August 1962",
    coverPrice: "12 cents",
    format: "36 pages, full color",
    charactersIntroduced: [
      "Spider-Man (Peter Parker)",
      "Uncle Ben",
      "Aunt May"
    ],
    creators: {
      editor: "Stan Lee",
      writersArtists: [
        "Stan Lee",
        "Steve Ditko"
      ]
    },
    description: "The first appearance of Spider-Man in Amazing Fantasy #15 revolutionized superhero storytelling by introducing a teenage hero with real-world problems. This issue laid the groundwork for one of Marvel's most iconic and enduring characters.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None (series was cancelled)"
    },
    valueToday: "$1.1 million (near-mint copy sold in 2011)",
    funFact: "This was the final issue of Amazing Fantasy before the series was cancelled, making Spider-Man's debut a 'last chance' story that unexpectedly created a legend.",
    image: ComicsImageData.AmazingFantasy15,
    category: "Silver Age",
    rating: 9.9
  },
  {
    id: 3,
    slug: "incredible-hulk-1",
    title: "The Incredible Hulk #1",
    publisher: "Marvel Comics",
    publicationDate: "May 1962",
    coverPrice: "12 cents",
    format: "40 pages, full color",
    charactersIntroduced: [
      "Hulk (Bruce Banner)",
      "Rick Jones",
      "General Thunderbolt Ross"
    ],
    creators: {
      editor: "Stan Lee",
      writersArtists: [
        "Stan Lee",
        "Jack Kirby"
      ]
    },
    description: "The first appearance of the Incredible Hulk introduced Bruce Banner, a scientist transformed into a raging green giant by gamma radiation. This comic explored themes of science gone wrong and the monster within.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$375,000 (near-mint copy)",
    funFact: "The Hulk was originally gray in this first issue, but coloring problems led to him becoming green in subsequent appearances.",
    image: ComicsImageData.IncredibleHulk1,
    category: "Silver Age",
    rating: 9.5
  },
  {
    id: 4,
    slug: "avengers-1",
    title: "The Avengers #1",
    publisher: "Marvel Comics",
    publicationDate: "September 1963",
    coverPrice: "12 cents",
    format: "36 pages, full color",
    charactersIntroduced: [
      "Avengers Team",
      "Loki (as main villain)"
    ],
    creators: {
      editor: "Stan Lee",
      writersArtists: [
        "Stan Lee",
        "Jack Kirby"
      ]
    },
    description: "The Avengers #1 brought together Earth's Mightiest Heroes - Iron Man, Thor, Hulk, Ant-Man, and the Wasp - to face Loki's schemes. This marked the beginning of Marvel's premier superhero team.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$274,000 (near-mint copy)",
    funFact: "The Hulk left the team in issue #2, and Captain America joined in issue #4, establishing the classic Avengers lineup.",
    image: ComicsImageData.Avengers1,
    category: "Silver Age",
    rating: 9.6
  },
  {
    id: 5,
    slug: "x-men-1",
    title: "The X-Men #1",
    publisher: "Marvel Comics",
    publicationDate: "September 1963",
    coverPrice: "12 cents",
    format: "36 pages, full color",
    charactersIntroduced: [
      "Professor X",
      "Cyclops",
      "Marvel Girl (Jean Grey)",
      "Beast",
      "Iceman",
      "Angel",
      "Magneto"
    ],
    creators: {
      editor: "Stan Lee",
      writersArtists: [
        "Stan Lee",
        "Jack Kirby"
      ]
    },
    description: "X-Men #1 introduced the world to Marvel's mutants - teenagers with extraordinary powers led by Professor Xavier to protect a world that fears and hates them.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$492,000 (near-mint copy)",
    funFact: "The X-Men were originally created as a way to have superheroes who were born with their powers, eliminating the need for radioactive accidents or high-tech armor.",
    image: ComicsImageData.XMen1,
    category: "Silver Age",
    rating: 9.7
  },
  {
    id: 6,
    slug: "fantastic-four-1",
    title: "Fantastic Four #1",
    publisher: "Marvel Comics",
    publicationDate: "November 1961",
    coverPrice: "10 cents",
    format: "36 pages, full color",
    charactersIntroduced: [
      "Mr. Fantastic",
      "Invisible Girl",
      "Human Torch",
      "The Thing",
      "The Mole Man"
    ],
    creators: {
      editor: "Stan Lee",
      writersArtists: [
        "Stan Lee",
        "Jack Kirby"
      ]
    },
    description: "Fantastic Four #1 launched the Marvel Age of Comics, introducing a superhero family with realistic personalities and conflicts. This groundbreaking approach revolutionized the industry.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$300,000 (near-mint copy)",
    funFact: "The Fantastic Four didn't have costumes in the first issue - they were introduced in issue #3, making this one of the few superhero debuts without traditional uniforms.",
    image: ComicsImageData.FantasticFour1,
    category: "Silver Age",
    rating: 9.8
  },
  {
    id: 7,
    slug: "iron-man-1",
    title: "Iron Man #1",
    publisher: "Marvel Comics",
    publicationDate: "May 1968",
    coverPrice: "12 cents",
    format: "36 pages, full color",
    charactersIntroduced: [
      "Iron Man (Tony Stark)",
      "Pepper Potts",
      "Happy Hogan"
    ],
    creators: {
      editor: "Stan Lee",
      writersArtists: [
        "Stan Lee",
        "Don Heck"
      ]
    },
    description: "Iron Man's first solo series expanded on his character after his debut in Tales of Suspense, establishing Tony Stark as a complex hero dealing with business pressures and personal demons.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$40,000 (near-mint copy)",
    funFact: "Iron Man was originally created as a challenge to make a capitalist weapons manufacturer into a likable superhero during the Cold War era.",
    image: ComicsImageData.IronMan1,
    category: "Silver Age",
    rating: 9.3
  },
  {
    id: 8,
    slug: "captain-america-comics-1",
    title: "Captain America Comics #1",
    publisher: "Timely Comics",
    publicationDate: "March 1941",
    coverPrice: "10 cents",
    format: "68 pages, full color",
    charactersIntroduced: [
      "Captain America (Steve Rogers)",
      "Bucky Barnes"
    ],
    creators: {
      editor: "Joe Simon",
      writersArtists: [
        "Joe Simon",
        "Jack Kirby"
      ]
    },
    description: "Captain America Comics #1 introduced the star-spangled superhero who would become Marvel's moral compass. The iconic cover showing Cap punching Hitler was controversial but hugely popular.",
    sales: {
      firstPrint: "nearly 1 million copies",
      secondPrint: "unknown"
    },
    valueToday: "$343,000 (near-mint copy)",
    funFact: "The first issue sold out in just days, and the character became so popular that the series was published bimonthly for a time to meet demand.",
    image: ComicsImageData.CaptainAmerica1,
    category: "Golden Age",
    rating: 9.7
  },
  {
    id: 9,
    slug: "nagraj-aur-miss-killer",
    title: "Nagraj Aur Miss Killer",
    publisher: "Raj Comics",
    publicationDate: "1989",
    coverPrice: "₹12",
    format: "32 pages, color",
    charactersIntroduced: ["Miss Killer"],
    creators: {
      editor: "Manoj Gupta",
      writersArtists: ["Sanjay Gupta", "Anupam Sinha"]
    },
    description: "In this action-packed issue, Nagraj faces Miss Killer, a deadly assassin who tests his powers and moral limits. The story delves deep into Nagraj’s struggle between vengeance and justice.",
    sales: { firstPrint: "highly circulated in North India" },
    valueToday: "₹2,000 (collector’s copy)",
    funFact: "Miss Killer became one of Raj Comics’ most iconic female villains after this debut.",
    image: ComicsImageData.NagrajMissKiller,
    category: "Indian Superhero Comics",
    rating: 9.2
  },
  {
    id: 10,
    slug: "super-commando-dhruva-pratishodh-ki-jwala",
    title: "Super Commando Dhruva: Pratishodh Ki Jwala",
    publisher: "Raj Comics",
    publicationDate: "1990",
    coverPrice: "₹15",
    format: "40 pages, color",
    charactersIntroduced: [],
    creators: {
      editor: "Manoj Gupta",
      writersArtists: ["Anupam Sinha"]
    },
    description: "Dhruva seeks revenge for his parents’ murder in this emotionally charged issue. The story highlights Dhruva’s intelligence, courage, and detective instincts.",
    sales: { firstPrint: "best-seller of 1990" },
    valueToday: "₹3,500 (mint copy)",
    funFact: "This comic cemented Dhruva as Raj Comics' top non-superpowered hero.",
    image: ComicsImageData.DhruvaPratishodhKiJwala,
    category: "Indian Superhero Comics",
    rating: 9.5
  },
  {
    id: 11,
    slug: "doga-khooni-paheli",
    title: "Doga: Khooni Paheli",
    publisher: "Raj Comics",
    publicationDate: "1993",
    coverPrice: "₹20",
    format: "36 pages, color",
    charactersIntroduced: [],
    creators: {
      editor: "Manoj Gupta",
      writersArtists: ["Tarun Kumar Wahi", "Manik"]
    },
    description: "Doga, the dark vigilante of Mumbai, hunts down a serial killer in this gritty crime thriller. It shows Doga’s no-mercy approach to justice.",
    sales: { firstPrint: "record-breaking in Mumbai" },
    valueToday: "₹3,000 (rare issue)",
    funFact: "‘Khooni Paheli’ is one of the first Raj Comics to explore psychological darkness.",
    image: ComicsImageData.DogaKhooniPaheli,
    category: "Indian Superhero Comics",
    rating: 9.4
  },
  {
    id: 12,
    slug: "bhokal-tilism-ka-rakhwala",
    title: "Bhokal: Tilism Ka Rakhwala",
    publisher: "Raj Comics",
    publicationDate: "1987",
    coverPrice: "₹10",
    format: "30 pages, color",
    charactersIntroduced: ["Bhokal"],
    creators: {
      editor: "Manoj Gupta",
      writersArtists: ["Dheeraj Verma"]
    },
    description: "The first appearance of Bhokal, the warrior prince from Parilok, who wields divine weapons and fights demonic forces to protect humanity.",
    sales: { firstPrint: "sold out within weeks" },
    valueToday: "₹4,000 (collector’s item)",
    funFact: "Bhokal’s debut issue is considered a cornerstone of Raj Comics’ fantasy universe.",
    image: ComicsImageData.BhokalTilismKaRakhwala,
    category: "Fantasy Superhero Comics",
    rating: 9.6
  },
  {
    id: 13,
    slug: "parmanu-atomic-hero",
    title: "Parmanu: Atomic Hero",
    publisher: "Raj Comics",
    publicationDate: "1991",
    coverPrice: "₹15",
    format: "35 pages, color",
    charactersIntroduced: ["Parmanu"],
    creators: {
      editor: "Manoj Gupta",
      writersArtists: ["Ved Prakash Sharma", "Bedi"]
    },
    description: "Inspector Vinay dons a high-tech suit to become Parmanu, India’s first atomic-powered superhero, using science and technology to fight crime.",
    sales: { firstPrint: "top 5 Raj Comics issue of 1991" },
    valueToday: "₹2,500 (mint copy)",
    funFact: "Parmanu’s character was inspired by Western heroes like Iron Man and The Atom.",
    image: ComicsImageData.ParmanuAtomicHero,
    category: "Science Fiction Comics",
    rating: 9.3
  },
  {
    id: 14,
    slug: "emperor-samar-chakrawarti",
    title: "Emperor Samar Chakrawarti",
    publisher: "Apex Comics",
    publicationDate: "2026",
    coverPrice: "₹15",
    format: "35 pages, color",
    charactersIntroduced: ["Samar Chakrawarti"],
    creators: {
      editor: "Sachin Chakrawarti",
      writersArtists: ["Sachin Chakrawarti"]
    },
    description: "The Cyber Mystic, The Architect of the Future, His enigmatic nature, coupled with his mysterious connection to figures like Samridhi Kapoor and Priyanka Shrivastav, makes him one of the most influential beings of his era...",
    sales: { firstPrint: "" },
    valueToday: "₹2,500 (mint copy)",
    funFact: "Emperor Samar Chakrawarti marks the birth of Apex Comics' Metaphysical Cyberverse — a fusion of mysticism, transhumanism, and artificial consciousness.",
    image: ComicsImageData.EmperorSamarChakrawarti,
    category: "Science Fiction Comics",
    rating: 9.3
  },



    {
    id: 15,
    slug: "detective-comics-27",
    title: "Detective Comics #27",
    publisher: "DC Comics",
    publicationDate: "May 1939",
    coverPrice: "10 cents",
    format: "64 pages, full color",
    charactersIntroduced: [
      "Batman (Bruce Wayne)",
      "Commissioner Gordon"
    ],
    creators: {
      editor: "Vin Sullivan",
      writersArtists: [
        "Bob Kane",
        "Bill Finger"
      ]
    },
    description: "The historic first appearance of Batman in Detective Comics #27 introduced the world to the Dark Knight. This issue launched one of the most iconic and enduring characters in popular culture, establishing Gotham City's vigilante protector.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$1.5 million (near-mint copy)",
    funFact: "Bob Kane's original Batman concept had the character wearing red, but Bill Finger suggested the now-iconic black and gray costume with bat-like wings.",
    image: ComicsImageData.DetectiveComics27,
    category: "Golden Age",
    rating: 9.9
  },
  {
    id: 16,
    slug: "action-comics-1",
    title: "Action Comics #1",
    publisher: "DC Comics",
    publicationDate: "June 1938",
    coverPrice: "10 cents",
    format: "68 pages, full color",
    charactersIntroduced: [
      "Superman (Clark Kent)",
      "Lois Lane"
    ],
    creators: {
      editor: "Vin Sullivan",
      writersArtists: [
        "Jerry Siegel",
        "Joe Shuster"
      ]
    },
    description: "Action Comics #1 marked the debut of Superman, the first superhero and the beginning of the Golden Age of Comics. This issue revolutionized the comic book industry and created the superhero genre as we know it.",
    sales: {
      firstPrint: "200,000 copies",
      secondPrint: "None"
    },
    valueToday: "$3.2 million (near-mint copy sold in 2014)",
    funFact: "The now-famous cover of Superman lifting a car was actually a green car, not a taxi. Colorist decisions made it look like a taxi cab!",
    image: ComicsImageData.ActionComics1,
    category: "Golden Age",
    rating: 10.0
  },
  {
    id: 17,
    slug: "flash-123",
    title: "The Flash #123",
    publisher: "DC Comics",
    publicationDate: "September 1961",
    coverPrice: "12 cents",
    format: "32 pages, full color",
    charactersIntroduced: [
      "Jay Garrick (Golden Age Flash)",
      "Multiverse Concept"
    ],
    creators: {
      editor: "Julius Schwartz",
      writersArtists: [
        "Gardner Fox",
        "Carmine Infantino"
      ]
    },
    description: "The Flash #123, 'Flash of Two Worlds,' introduced the concept of the Multiverse to comics. Barry Allen vibrates into Earth-2 and meets his predecessor Jay Garrick, opening infinite storytelling possibilities.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$85,000 (near-mint copy)",
    funFact: "This issue created the 'Crisis on Infinite Earths' concept that DC would use for major crossovers decades later.",
    image: ComicsImageData.Flash123,
    category: "Silver Age",
    rating: 9.6
  },
  {
    id: 18,
    slug: "giant-size-x-men-1",
    title: "Giant-Size X-Men #1",
    publisher: "Marvel Comics",
    publicationDate: "May 1975",
    coverPrice: "25 cents",
    format: "68 pages, full color",
    charactersIntroduced: [
      "Storm",
      "Nightcrawler",
      "Colossus",
      "Thunderbird",
      "Wolverine"
    ],
    creators: {
      editor: "Len Wein",
      writersArtists: [
        "Len Wein",
        "Dave Cockrum"
      ]
    },
    description: "Giant-Size X-Men #1 relaunched the X-Men franchise with an international team of mutants, including the debut of Wolverine. This issue saved the failing series and created the most popular X-Men lineup.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$100,000 (near-mint copy)",
    funFact: "Wolverine was originally designed as a mutated wolverine that evolved into a human before becoming a mutant with Adamantium claws.",
    image: ComicsImageData.GiantSizeXMen1,
    category: "Bronze Age",
    rating: 9.8
  },
  {
    id: 19,
    slug: "watchmen-1",
    title: "Watchmen #1",
    publisher: "DC Comics",
    publicationDate: "September 1986",
    coverPrice: "$1.50",
    format: "32 pages, full color",
    charactersIntroduced: [
      "Rorschach",
      "Doctor Manhattan",
      "Silk Spectre",
      "Nite Owl",
      "Ozymandias",
      "The Comedian"
    ],
    creators: {
      editor: "Len Wein",
      writersArtists: [
        "Alan Moore",
        "Dave Gibbons"
      ]
    },
    description: "Watchmen #1 begins the groundbreaking deconstruction of the superhero genre. This series explored realistic consequences, psychological depth, and political commentary in ways never before seen in comics.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Multiple"
    },
    valueToday: "$9,000 (near-mint first print)",
    funFact: "Watchmen was originally going to use the Charlton Comics characters (The Question, Blue Beetle, etc.) before DC decided to make original characters instead.",
    image: ComicsImageData.Watchmen1,
    category: "Modern Age",
    rating: 9.9
  },
  {
    id: 20,
    slug: "dark-knight-returns-1",
    title: "The Dark Knight Returns #1",
    publisher: "DC Comics",
    publicationDate: "February 1986",
    coverPrice: "$2.95",
    format: "48 pages, full color",
    charactersIntroduced: [
      "Old Bruce Wayne",
      "Carrie Kelly (Robin)"
    ],
    creators: {
      editor: "Dick Giordano",
      writersArtists: [
        "Frank Miller"
      ]
    },
    description: "The Dark Knight Returns #1 redefined Batman for a new generation, presenting an aging Bruce Wayne coming out of retirement. This dark, mature take on the character influenced comics, film, and popular culture.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Multiple"
    },
    valueToday: "$2,500 (near-mint first print)",
    funFact: "Frank Miller's concept was so influential that it directly inspired Christopher Nolan's 'The Dark Knight Rises' film.",
    image: ComicsImageData.DarkKnightReturns1,
    category: "Modern Age",
    rating: 9.8
  },
  {
    id: 21,
    slug: "sandman-1",
    title: "The Sandman #1",
    publisher: "DC Comics",
    publicationDate: "January 1989",
    coverPrice: "$1.50",
    format: "32 pages, full color",
    charactersIntroduced: [
      "Dream/Morpheus",
      "Death"
    ],
    creators: {
      editor: "Karen Berger",
      writersArtists: [
        "Neil Gaiman",
        "Sam Keith"
      ]
    },
    description: "The Sandman #1 launched Neil Gaiman's revolutionary series that elevated comics as a literary art form. This issue introduces Dream, one of the Endless, as he escapes imprisonment and rebuilds his kingdom.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Multiple"
    },
    valueToday: "$3,000 (near-mint first print)",
    funFact: "The Sandman became the first comic to win the World Fantasy Award for Best Short Story in 1991.",
    image: ComicsImageData.Sandman1,
    category: "Modern Age",
    rating: 9.9
  },
  {
    id: 22,
    slug: "raj-comics-nagraj-1",
    title: "Nagraj #1",
    publisher: "Raj Comics",
    publicationDate: "1987",
    coverPrice: "₹8",
    format: "32 pages, color",
    charactersIntroduced: [
      "Nagraj",
      "Vishaka",
      "Takshak"
    ],
    creators: {
      editor: "Manoj Gupta",
      writersArtists: [
        "Sanjay Gupta",
        "Anupam Sinha"
      ]
    },
    description: "The first issue of Nagraj, India's most iconic superhero, introduced the snake-powered hero with unique abilities and a tragic origin. This comic launched Raj Comics and Indian superhero genre.",
    sales: {
      firstPrint: "sold out within days",
      secondPrint: "Multiple reprints"
    },
    valueToday: "₹25,000 (rare mint condition)",
    funFact: "Nagraj's ability to shoot snakes from his palms was considered too controversial initially but became his signature power.",
    image: ComicsImageData.Nagraj1,
    category: "Indian Superhero Comics",
    rating: 9.5
  },
  {
    id: 23,
    slug: "superman-75",
    title: "Superman #75",
    publisher: "DC Comics",
    publicationDate: "November 1992",
    coverPrice: "$2.50",
    format: "40 pages, full color",
    charactersIntroduced: [
      "Cyborg Superman",
      "Steel (John Henry Irons)"
    ],
    creators: {
      editor: "Mike Carlin",
      writersArtists: [
        "Dan Jurgens",
        "Brett Breeding"
      ]
    },
    description: "Superman #75, 'The Death of Superman,' shocked the world by killing the world's most famous superhero. The black-bagged issue became a cultural phenomenon and the best-selling comic of its era.",
    sales: {
      firstPrint: "3 million copies",
      secondPrint: "Multiple reprints"
    },
    valueToday: "$200 (unopened black bag with armband)",
    funFact: "The issue came sealed in a black plastic bag with a red armband to prevent spoilers and preserve the shocking moment.",
    image: ComicsImageData.Superman75,
    category: "Modern Age",
    rating: 9.4
  },
  {
    id: 24,
    slug: "spawn-1",
    title: "Spawn #1",
    publisher: "Image Comics",
    publicationDate: "May 1992",
    coverPrice: "$1.95",
    format: "32 pages, full color",
    charactersIntroduced: [
      "Spawn (Al Simmons)",
      "Violator",
      "Malebolgia"
    ],
    creators: {
      editor: "Tom Orzechowski",
      writersArtists: [
        "Todd McFarlane"
      ]
    },
    description: "Spawn #1 launched Todd McFarlane's dark anti-hero and founded Image Comics. This issue revolutionized creator rights in comics, proving that artists could own and profit from their creations.",
    sales: {
      firstPrint: "1.7 million copies",
      secondPrint: "Multiple"
    },
    valueToday: "$1,500 (near-mint first print)",
    funFact: "Spawn was the first successful creator-owned superhero comic, paving the way for other artists to leave Marvel and DC.",
    image: ComicsImageData.Spawn1,
    category: "Modern Age",
    rating: 9.5
  },

    {
    id: 25,
    slug: "journey-into-mystery-83",
    title: "Journey into Mystery #83",
    publisher: "Marvel Comics",
    publicationDate: "August 1962",
    coverPrice: "12 cents",
    format: "32 pages, full color",
    charactersIntroduced: [
      "Thor (Donald Blake)",
      "Loki",
      "Odin"
    ],
    creators: {
      editor: "Stan Lee",
      writersArtists: [
        "Stan Lee",
        "Jack Kirby"
      ]
    },
    description: "Journey into Mystery #83 introduced Thor, the God of Thunder, who would become one of Marvel's most powerful heroes. This issue established Asgardian mythology within the Marvel Universe.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$75,000 (near-mint copy)",
    funFact: "Thor's alter ego was originally a medical student named Donald Blake, who discovered a walking stick that transformed into Mjolnir.",
    image: ComicsImageData.JourneyIntoMystery83,
    category: "Silver Age",
    rating: 9.6
  },
  {
    id: 26,
    slug: "tales-of-suspense-39",
    title: "Tales of Suspense #39",
    publisher: "Marvel Comics",
    publicationDate: "March 1963",
    coverPrice: "12 cents",
    format: "32 pages, full color",
    charactersIntroduced: [
      "Iron Man (Tony Stark)",
      "Wong-Chu"
    ],
    creators: {
      editor: "Stan Lee",
      writersArtists: [
        "Stan Lee",
        "Don Heck",
        "Jack Kirby"
      ]
    },
    description: "The first appearance of Iron Man in Tales of Suspense #39 introduced Tony Stark, a wealthy industrialist who builds a suit of armor to save his life and fight evil during the Vietnam War.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$55,000 (near-mint copy)",
    funFact: "Iron Man was created as a challenge to make a weapons manufacturer into a likable hero during the Cold War.",
    image: ComicsImageData.TalesOfSuspense39,
    category: "Silver Age",
    rating: 9.5
  },
  {
    id: 27,
    slug: "strange-tales-110",
    title: "Strange Tales #110",
    publisher: "Marvel Comics",
    publicationDate: "July 1963",
    coverPrice: "12 cents",
    format: "32 pages, full color",
    charactersIntroduced: [
      "Doctor Strange",
      "Ancient One",
      "Nightmare"
    ],
    creators: {
      editor: "Stan Lee",
      writersArtists: [
        "Stan Lee",
        "Steve Ditko"
      ]
    },
    description: "Strange Tales #110 introduced Doctor Strange, the Master of the Mystic Arts. This issue expanded Marvel's universe into supernatural and mystical dimensions, exploring magic and alternate realities.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$50,000 (near-mint copy)",
    funFact: "Doctor Strange's origin story was inspired by classic horror comics and the writings of H.P. Lovecraft.",
    image: ComicsImageData.StrangeTales110,
    category: "Silver Age",
    rating: 9.7
  },
  {
    id: 28,
    slug: "heroes-for-hire-1",
    title: "Heroes for Hire #1",
    publisher: "Marvel Comics",
    publicationDate: "June 2023",
    coverPrice: "$4.99",
    format: "32 pages, full color",
    charactersIntroduced: [
      "New Heroes for Hire Team"
    ],
    creators: {
      editor: "C.B. Cebulski",
      writersArtists: [
        "David F. Walker",
        "Carlos Villa"
      ]
    },
    description: "Heroes for Hire #1 relaunches Marvel's street-level superhero team in the modern era, combining classic characters with new heroes fighting crime on a pay-for-hire basis in New York City.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$25 (near-mint copy)",
    funFact: "This new series features a diverse team including classic heroes and new characters representing modern Marvel.",
    image: ComicsImageData.HeroesForHire1,
    category: "Modern Age",
    rating: 9.1
  },
  {
    id: 29,
    slug: "crisis-on-infinite-earths-1",
    title: "Crisis on Infinite Earths #1",
    publisher: "DC Comics",
    publicationDate: "April 1985",
    coverPrice: "75 cents",
    format: "48 pages, full color",
    charactersIntroduced: [
      "Monitor",
      "Anti-Monitor",
      "Harbinger"
    ],
    creators: {
      editor: "Robert Greenberger",
      writersArtists: [
        "Marv Wolfman",
        "George Pérez"
      ]
    },
    description: "Crisis on Infinite Earths #1 began DC's landmark event that restructured the entire DC Multiverse into a single timeline. This series killed off major characters and changed DC continuity forever.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Multiple"
    },
    valueToday: "$500 (near-mint first print)",
    funFact: "Supergirl and the Flash (Barry Allen) both died during this series, marking the first major superhero deaths in DC history.",
    image: ComicsImageData.CrisisOnInfiniteEarths1,
    category: "Bronze Age",
    rating: 9.7
  },
  {
    id: 30,
    slug: "infinity-gauntlet-1",
    title: "The Infinity Gauntlet #1",
    publisher: "Marvel Comics",
    publicationDate: "July 1991",
    coverPrice: "$1.50",
    format: "48 pages, full color",
    charactersIntroduced: [
      "Thanos with Infinity Gauntlet",
      "Nebula",
      "Death"
    ],
    creators: {
      editor: "Craig Anderson",
      writersArtists: [
        "Jim Starlin",
        "George Pérez"
      ]
    },
    description: "The Infinity Gauntlet #1 launched the epic story of Thanos obtaining the ultimate power in the universe. This series inspired the Marvel Cinematic Universe's Avengers: Infinity War and Endgame films.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Multiple"
    },
    valueToday: "$400 (near-mint first print)",
    funFact: "The Infinity Gauntlet story was almost never published because editors thought it was too dark and cosmic.",
    image: ComicsImageData.InfinityGauntlet1,
    category: "Modern Age",
    rating: 9.8
  },
  {
    id: 31,
    slug: "civil-war-1",
    title: "Civil War #1",
    publisher: "Marvel Comics",
    publicationDate: "May 2006",
    coverPrice: "$3.99",
    format: "48 pages, full color",
    charactersIntroduced: [
      "Superhero Registration Act"
    ],
    creators: {
      editor: "Tom Brevoort",
      writersArtists: [
        "Mark Millar",
        "Steve McNiven"
      ]
    },
    description: "Civil War #1 kicked off Marvel's blockbuster event pitting hero against hero over the Superhero Registration Act. Captain America led anti-registration while Iron Man supported the government mandate.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Multiple"
    },
    valueToday: "$150 (near-mint first print)",
    funFact: "The cover of Captain America vs. Iron Man became one of the most iconic images of 2000s comics.",
    image: ComicsImageData.CivilWar1,
    category: "Modern Age",
    rating: 9.6
  },
  {
    id: 32,
    slug: "batman-the-killing-joke",
    title: "Batman: The Killing Joke",
    publisher: "DC Comics",
    publicationDate: "March 1988",
    coverPrice: "$2.95",
    format: "48 pages, full color",
    charactersIntroduced: [
      "Oracle (Barbara Gordon's fate)"
    ],
    creators: {
      editor: "Dennis O'Neil",
      writersArtists: [
        "Alan Moore",
        "Brian Bolland"
      ]
    },
    description: "Batman: The Killing Joke is one of the most influential Batman stories ever told, exploring the Joker's origin and his relationship with Batman. This graphic novel permanently altered Barbara Gordon's fate.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Multiple"
    },
    valueToday: "$1,200 (near-mint first print)",
    funFact: "Alan Moore later expressed regret for making the story so dark, particularly the treatment of Barbara Gordon.",
    image: ComicsImageData.KillingJoke,
    category: "Modern Age",
    rating: 9.9
  },
  {
    id: 33,
    slug: "shakti-1",
    title: "Shakti #1",
    publisher: "Raj Comics",
    publicationDate: "1995",
    coverPrice: "₹15",
    format: "32 pages, color",
    charactersIntroduced: [
      "Shakti",
      "Kali"
    ],
    creators: {
      editor: "Manoj Gupta",
      writersArtists: [
        "Nitin Mishra",
        "Hemant Kumar"
      ]
    },
    description: "Shakti #1 introduced India's first major female superhero, a goddess-powered protector of women and the oppressed. This groundbreaking issue addressed social issues while delivering action-packed storytelling.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Multiple"
    },
    valueToday: "₹5,000 (mint copy)",
    funFact: "Shakti was created to empower young girls and women readers in India's male-dominated comic market.",
    image: ComicsImageData.Shakti1,
    category: "Indian Superhero Comics",
    rating: 9.4
  },
  {
    id: 34,
    slug: "tinkle-digest-1",
    title: "Tinkle Digest #1",
    publisher: "Amar Chitra Katha",
    publicationDate: "1980",
    coverPrice: "₹5",
    format: "64 pages, color",
    charactersIntroduced: [
      "Suppandi",
      "Shikari Shambu",
      "Kalia the Crow"
    ],
    creators: {
      editor: "Anant Pai",
      writersArtists: [
        "Luis Fernandes",
        "Vasant Halbe"
      ]
    },
    description: "Tinkle Digest #1 launched India's most beloved children's comic magazine, introducing generations of readers to Suppandi, Shikari Shambu, and other iconic characters in a blend of humor and education.",
    sales: {
      firstPrint: "50,000 copies",
      secondPrint: "Multiple reprints"
    },
    valueToday: "₹8,000 (rare first print)",
    funFact: "Tinkle has been published continuously for over 40 years and remains India's longest-running children's comic.",
    image: ComicsImageData.Tinkle1,
    category: "Indian Humor Comics",
    rating: 9.7
  },
  {
    id: 35,
    slug: "one-piece-1",
    title: "ONE PIECE #1",
    publisher: "Shueisha",
    publicationDate: "July 1997",
    coverPrice: "¥390",
    format: "56 pages, black and white",
    charactersIntroduced: [
      "Monkey D. Luffy",
      "Roronoa Zoro",
      "Nami",
      "Shanks"
    ],
    creators: {
      editor: "Hisashi Sasaki",
      writersArtists: [
        "Eiichiro Oda"
      ]
    },
    description: "ONE PIECE #1 begins the greatest manga adventure of all time, introducing Monkey D. Luffy and his quest to become the Pirate King. This issue launched the best-selling manga series in history.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Thousands"
    },
    valueToday: "$10,000 (graded 9.8 first print)",
    funFact: "ONE PIECE has sold over 500 million copies worldwide, making it the best-selling comic series of all time.",
    image: ComicsImageData.OnePiece1,
    category: "Manga",
    rating: 9.9
  },
  {
    id: 36,
    slug: "naruto-1",
    title: "NARUTO #1",
    publisher: "Shueisha",
    publicationDate: "September 1999",
    coverPrice: "¥390",
    format: "200 pages, black and white",
    charactersIntroduced: [
      "Naruto Uzumaki",
      "Sasuke Uchiha",
      "Sakura Haruno",
      "Kakashi Hatake"
    ],
    creators: {
      editor: "Kosuke Yahagi",
      writersArtists: [
        "Masashi Kishimoto"
      ]
    },
    description: "NARUTO #1 introduces the hyperactive ninja Naruto Uzumaki, who dreams of becoming Hokage. This manga became a global phenomenon, popularizing ninja mythology and shonen storytelling worldwide.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Thousands"
    },
    valueToday: "$5,000 (graded 9.8 first print)",
    funFact: "Kishimoto originally created Naruto as a ramen chef before developing the ninja concept.",
    image: ComicsImageData.Naruto1,
    category: "Manga",
    rating: 9.8
  },
  {
    id: 37,
    slug: "death-note-1",
    title: "DEATH NOTE #1",
    publisher: "Shueisha",
    publicationDate: "December 2003",
    coverPrice: "¥390",
    format: "200 pages, black and white",
    charactersIntroduced: [
      "Light Yagami",
      "Ryuk",
      "L"
    ],
    creators: {
      editor: "Tsuguru Nakamura",
      writersArtists: [
        "Tsugumi Ohba",
        "Takeshi Obata"
      ]
    },
    description: "DEATH NOTE #1 begins the psychological thriller about Light Yagami, a genius who gains the power to kill anyone by writing their name in a supernatural notebook. This manga redefined the cat-and-mouse genre.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Multiple"
    },
    valueToday: "$3,000 (graded 9.8 first print)",
    funFact: "The series was rejected multiple times before being accepted, as editors felt the concept was too dark for Weekly Shonen Jump.",
    image: ComicsImageData.DeathNote1,
    category: "Manga",
    rating: 9.9
  },
  {
    id: 38,
    slug: "dragon-ball-1",
    title: "DRAGON BALL #1",
    publisher: "Shueisha",
    publicationDate: "December 1984",
    coverPrice: "¥360",
    format: "200 pages, black and white",
    charactersIntroduced: [
      "Son Goku",
      "Bulma",
      "Yamcha",
      "Master Roshi"
    ],
    creators: {
      editor: "Kazuhiko Torishima",
      writersArtists: [
        "Akira Toriyama"
      ]
    },
    description: "DRAGON BALL #1 introduced the world to Son Goku, a boy with a monkey tail searching for the seven magical Dragon Balls. This manga became the blueprint for modern shonen action series worldwide.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Thousands"
    },
    valueToday: "$8,000 (graded 9.8 first print)",
    funFact: "Dragon Ball was originally inspired by the classic Chinese novel 'Journey to the West' and was intended to be a comedy series.",
    image: ComicsImageData.DragonBall1,
    category: "Manga",
    rating: 9.9
  },
  {
    id: 39,
    slug: "attack-on-titan-1",
    title: "Attack on Titan #1",
    publisher: "Kodansha",
    publicationDate: "September 2009",
    coverPrice: "¥440",
    format: "200 pages, black and white",
    charactersIntroduced: [
      "Eren Yeager",
      "Mikasa Ackerman",
      "Armin Arlert"
    ],
    creators: {
      editor: "Shintarou Kawakatsu",
      writersArtists: [
        "Hajime Isayama"
      ]
    },
    description: "Attack on Titan #1 introduces a world where humanity lives inside walled cities to survive against man-eating Titans. This dark fantasy manga became a global phenomenon and redefined horror in shonen manga.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Thousands"
    },
    valueToday: "$2,000 (graded 9.8 first print)",
    funFact: "Hajime Isayama originally submitted the series to Weekly Shonen Jump, where it was rejected before being accepted by Monthly Shonen Magazine.",
    image: ComicsImageData.AttackOnTitan1,
    category: "Manga",
    rating: 9.7
  },

    {
    id: 40,
    slug: "showcase-4",
    title: "Showcase #4",
    publisher: "DC Comics",
    publicationDate: "October 1956",
    coverPrice: "10 cents",
    format: "32 pages, full color",
    charactersIntroduced: [
      "Barry Allen (The Flash)",
      "Iris West"
    ],
    creators: {
      editor: "Julius Schwartz",
      writersArtists: [
        "Robert Kanigher",
        "Carmine Infantino"
      ]
    },
    description: "Showcase #4 introduced Barry Allen as the new Flash, launching the Silver Age of Comics. This issue revived the superhero genre and established the modern DC Universe.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$450,000 (near-mint copy)",
    funFact: "The success of Showcase #4 led directly to the creation of Justice League of America and the superhero boom of the Silver Age.",
    image: ComicsImageData.Showcase4,
    category: "Silver Age",
    rating: 9.8
  },
  {
    id: 41,
    slug: "green-lantern-76",
    title: "Green Lantern #76",
    publisher: "DC Comics",
    publicationDate: "April 1970",
    coverPrice: "15 cents",
    format: "32 pages, full color",
    charactersIntroduced: [
      "John Stewart (cameo)"
    ],
    creators: {
      editor: "Julius Schwartz",
      writersArtists: [
        "Dennis O'Neil",
        "Neal Adams"
      ]
    },
    description: "Green Lantern #76, 'No Evil Shall Escape My Sight,' reinvented the character by addressing social issues. This landmark issue teamed Green Lantern with Green Arrow and tackled racism and poverty.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$25,000 (near-mint copy)",
    funFact: "This issue's cover showing Green Lantern ignoring a black man's plight while Green Arrow confronts him is one of comics' most iconic images.",
    image: ComicsImageData.GreenLantern76,
    category: "Bronze Age",
    rating: 9.9
  },
  {
    id: 42,
    slug: "house-of-secrets-92",
    title: "House of Secrets #92",
    publisher: "DC Comics",
    publicationDate: "June 1971",
    coverPrice: "15 cents",
    format: "32 pages, full color",
    charactersIntroduced: [
      "Swamp Thing"
    ],
    creators: {
      editor: "Joe Orlando",
      writersArtists: [
        "Len Wein",
        "Bernie Wrightson"
      ]
    },
    description: "House of Secrets #92 introduced Swamp Thing, a tragic creature who would become one of DC's most acclaimed horror characters. This issue launched the career of legendary artist Bernie Wrightson.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "$20,000 (near-mint copy)",
    funFact: "Alan Moore's later run on Swamp Thing in the 1980s reinvented the character and helped launch DC's mature readers imprint, Vertigo.",
    image: ComicsImageData.HouseOfSecrets92,
    category: "Bronze Age",
    rating: 9.7
  },
  {
    id: 43,
    slug: "new-mutants-98",
    title: "New Mutants #98",
    publisher: "Marvel Comics",
    publicationDate: "February 1991",
    coverPrice: "$1.00",
    format: "32 pages, full color",
    charactersIntroduced: [
      "Deadpool",
      "Domino (as Copycat impostor)"
    ],
    creators: {
      editor: "Bob Harras",
      writersArtists: [
        "Rob Liefeld",
        "Fabian Nicieza"
      ]
    },
    description: "New Mutants #98 features the first appearance of Deadpool, the 'Merc with a Mouth.' This issue introduced one of Marvel's most popular and unconventional anti-heroes of the modern era.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Multiple"
    },
    valueToday: "$3,000 (near-mint copy)",
    funFact: "Deadpool's appearance in New Mutants #98 was originally intended to be a Deathstroke parody from DC Comics.",
    image: ComicsImageData.NewMutants98,
    category: "Modern Age",
    rating: 9.6
  },
  {
    id: 44,
    slug: "edge-of-spider-verse-2",
    title: "Edge of Spider-Verse #2",
    publisher: "Marvel Comics",
    publicationDate: "September 2014",
    coverPrice: "$3.99",
    format: "32 pages, full color",
    charactersIntroduced: [
      "Spider-Gwen (Gwen Stacy)",
      "Spider-Ham (cameo)"
    ],
    creators: {
      editor: "Nick Lowe",
      writersArtists: [
        "Jason Latour",
        "Robbi Rodriguez"
      ]
    },
    description: "Edge of Spider-Verse #2 introduced Spider-Gwen, an alternate universe Gwen Stacy who was bitten by the radioactive spider. This character became an instant fan-favorite and spawned multiple series.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Multiple"
    },
    valueToday: "$500 (near-mint first print)",
    funFact: "Spider-Gwen's costume design became so popular that it's now featured in multiple video games, animated series, and the Spider-Verse films.",
    image: ComicsImageData.EdgeOfSpiderVerse2,
    category: "Modern Age",
    rating: 9.8
  },
  {
    id: 45,
    slug: "super-sons-1",
    title: "Super Sons #1",
    publisher: "DC Comics",
    publicationDate: "February 2017",
    coverPrice: "$3.99",
    format: "32 pages, full color",
    charactersIntroduced: [
      "Jon Kent (Superboy)",
      "Damian Wayne (Robin)"
    ],
    creators: {
      editor: "Alex Antone",
      writersArtists: [
        "Peter J. Tomasi",
        "Jorge Jimenez"
      ]
    },
    description: "Super Sons #1 launched the beloved series pairing Jon Kent (Superman's son) and Damian Wayne (Batman's son) as an unlikely duo. This series captured the spirit of classic buddy adventures in the DC Universe.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Multiple"
    },
    valueToday: "$50 (near-mint first print)",
    funFact: "The Super Sons dynamic was so popular that both characters continue to appear together in comics and animated media despite aging up.",
    image: ComicsImageData.SuperSons1,
    category: "Modern Age",
    rating: 9.7
  },
  {
    id: 46,
    slug: "ms-marvel-1-2014",
    title: "Ms. Marvel #1 (2014)",
    publisher: "Marvel Comics",
    publicationDate: "February 2014",
    coverPrice: "$2.99",
    format: "32 pages, full color",
    charactersIntroduced: [
      "Kamala Khan (Ms. Marvel)",
      "Bruno Carrelli",
      "Nakia Bahadir"
    ],
    creators: {
      editor: "Sana Amanat",
      writersArtists: [
        "G. Willow Wilson",
        "Adrian Alphona"
      ]
    },
    description: "Ms. Marvel #1 introduced Kamala Khan, Marvel's first Muslim-American character to headline her own series. This groundbreaking comic won the Hugo Award and became a cultural phenomenon.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Multiple"
    },
    valueToday: "$200 (near-mint first print)",
    funFact: "Kamala Khan's powers (embiggening and shapeshifting) were inspired by Mr. Fantastic, but her character's heart and humor made her unique.",
    image: ComicsImageData.MsMarvel1,
    category: "Modern Age",
    rating: 9.9
  },
  {
    id: 47,
    slug: "devil-dinosaur-1",
    title: "Devil Dinosaur #1",
    publisher: "Raj Comics",
    publicationDate: "1994",
    coverPrice: "₹12",
    format: "28 pages, color",
    charactersIntroduced: [
      "Devil Dinosaur",
      "Kali",
      "Snake-Eye"
    ],
    creators: {
      editor: "Manoj Gupta",
      writersArtists: [
        "Sanjay Gupta",
        "Ranjeet Singh"
      ]
    },
    description: "Devil Dinosaur #1 introduced Indian comics' most unique hero - a prehistoric dinosaur brought to modern times with superhuman intelligence. This comic blended action, science fiction, and Indian mythology.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Limited"
    },
    valueToday: "₹4,000 (mint copy)",
    funFact: "Devil Dinosaur was created to appeal to younger readers fascinated by dinosaurs, making it one of Raj Comics' most successful children's titles.",
    image: ComicsImageData.DevilDinosaur1,
    category: "Indian Fantasy Comics",
    rating: 9.3
  },
  {
    id: 48,
    slug: "chacha-chaudhary-1",
    title: "Chacha Chaudhary #1",
    publisher: "Pran's Features",
    publicationDate: "1971",
    coverPrice: "₹2",
    format: "16 pages, color",
    charactersIntroduced: [
      "Chacha Chaudhary",
      "Rocket (Sabu)",
      "Dagga"
    ],
    creators: {
      editor: "Pran Kumar Sharma",
      writersArtists: [
        "Pran Kumar Sharma"
      ]
    },
    description: "Chacha Chaudhary #1 introduced India's most beloved comic character - a wise old man whose brain works faster than a computer. This comic became a household name across India for generations.",
    sales: {
      firstPrint: "100,000 copies",
      secondPrint: "Multiple reprints"
    },
    valueToday: "₹15,000 (rare first print)",
    funFact: "Chacha Chaudhary's tagline 'Chacha Chaudhary ka dimag computer se bhi tez chalta hai' (Chacha Chaudhary's brain works faster than a computer) became iconic in Indian pop culture.",
    image: ComicsImageData.ChachaChaudhary1,
    category: "Indian Humor Comics",
    rating: 9.9
  },
  {
    id: 49,
    slug: "super-commando-dhruva-nagraj-1",
    title: "Super Commando Dhruva / Nagraj #1",
    publisher: "Raj Comics",
    publicationDate: "1988",
    coverPrice: "₹10",
    format: "32 pages, color",
    charactersIntroduced: [
      "Dhruva-Nagraj Team-up",
      "Maya"
    ],
    creators: {
      editor: "Manoj Gupta",
      writersArtists: [
        "Anupam Sinha",
        "Sanjay Gupta"
      ]
    },
    description: "This special crossover issue brought together Raj Comics' two biggest heroes - Super Commando Dhruva and Nagraj. The team-up introduced new villains and expanded the Raj Comics shared universe.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "None"
    },
    valueToday: "₹7,000 (mint copy)",
    funFact: "This was the first major superhero crossover in Indian comics history, predating similar crossovers in Western comics.",
    image: ComicsImageData.DhruvaNagrajCrossover,
    category: "Indian Superhero Comics",
    rating: 9.6
  },
  {
    id: 50,
    slug: "demon-slayer-1",
    title: "Demon Slayer: Kimetsu no Yaiba #1",
    publisher: "Shueisha",
    publicationDate: "February 2016",
    coverPrice: "¥440",
    format: "200 pages, black and white",
    charactersIntroduced: [
      "Tanjiro Kamado",
      "Nezuko Kamado",
      "Muzan Kibutsuji"
    ],
    creators: {
      editor: "Tatsuhiko Katayama",
      writersArtists: [
        "Koyoharu Gotouge"
      ]
    },
    description: "Demon Slayer #1 introduces Tanjiro Kamado, a kind-hearted boy who becomes a demon slayer after his family is slaughtered and his sister Nezuko is turned into a demon. This manga became a global phenomenon.",
    sales: {
      firstPrint: "unknown",
      secondPrint: "Thousands"
    },
    valueToday: "$1,500 (graded 9.8 first print)",
    funFact: "Demon Slayer became the best-selling manga of 2020, selling over 80 million copies in a single year, breaking records set by ONE PIECE.",
    image: ComicsImageData.DemonSlayer1,
    category: "Manga",
    rating: 9.9
  },

];
// src/pages/footerpages/newsblog/NewsData.js

const newsData = [
  {
    id: 1,
    title: "AI-Powered Book Summaries Now Available",
    excerpt: "Discover how our new AI technology can summarize any book in seconds, helping readers save time and grasp key concepts faster.",
    category: "Feature Update",
    date: "2024-03-15",
    readTime: "5 min read",
    author: "Sarah Chen",
    image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["AI", "Technology", "Reading"],
    featured: true,
    content: `
      <h2>Revolutionizing Reading with AI</h2>
      <p>We're excited to announce the launch of our AI-powered book summarization feature. This innovative tool uses advanced natural language processing to provide comprehensive summaries of books in multiple formats.</p>
      
      <h3>Key Features:</h3>
      <ul>
        <li>Generate summaries in 1, 3, or 5-minute formats</li>
        <li>Extract key concepts and themes</li>
        <li>Create study guides and discussion points</li>
        <li>Available for over 100,000 books</li>
      </ul>
      
      <p>This tool is perfect for students, busy professionals, and anyone looking to expand their knowledge efficiently.</p>
    `
  },
  {
    id: 2,
    title: "The Rise of Audiobooks in 2024",
    excerpt: "Audiobook consumption has increased by 45% in the past year. Explore the trends driving this growth and what it means for publishers.",
    category: "Industry Trends",
    date: "2024-03-10",
    readTime: "7 min read",
    author: "Michael Rodriguez",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Audiobooks", "Trends", "Industry"],
    featured: true,
    content: `
      <h2>The Audiobook Revolution</h2>
      <p>The audiobook market has seen unprecedented growth, with listeners embracing the convenience and flexibility of audio content.</p>
      
      <h3>Key Statistics:</h3>
      <ul>
        <li>45% increase in audiobook consumption</li>
        <li>72% of listeners use mobile devices</li>
        <li>Average listening time: 3.5 hours per week</li>
        <li>Most popular genres: Fiction, Self-Help, Business</li>
      </ul>
      
      <p>This trend shows no signs of slowing down, with new technologies like immersive audio and AI narration emerging.</p>
    `
  },
  {
    id: 3,
    title: "Interview with Bestselling Author Elena Martinez",
    excerpt: "We sit down with award-winning author Elena Martinez to discuss her writing process, inspiration, and upcoming projects.",
    category: "Author Interview",
    date: "2024-03-05",
    readTime: "10 min read",
    author: "James Wilson",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Interview", "Authors", "Writing"],
    featured: false,
    content: `
      <h2>A Conversation with Elena Martinez</h2>
      <p>Elena Martinez, author of the critically acclaimed 'Whispers of the Valley,' shares insights into her creative journey.</p>
      
      <h3>On Writing Process:</h3>
      <p>"I write every morning from 5 AM to 8 AM. This uninterrupted time is sacred to me. The silence of dawn fuels my creativity."</p>
      
      <h3>Advice for Aspiring Writers:</h3>
      <p>"Read voraciously, write consistently, and don't be afraid to revise. Your first draft is just the beginning of the conversation."</p>
    `
  },
  {
    id: 4,
    title: "10 Writing Tips from Professional Authors",
    excerpt: "Learn the secrets of successful writing from authors who have mastered their craft and achieved publishing success.",
    category: "Writing Tips",
    date: "2024-03-01",
    readTime: "8 min read",
    author: "David Park",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Writing", "Tips", "How-to"],
    featured: false,
    content: `
      <h2>Mastering the Art of Writing</h2>
      <p>Professional authors share their most valuable tips for improving your writing and developing your unique voice.</p>
      
      <h3>Top 10 Tips:</h3>
      <ol>
        <li>Write daily, even if only for 15 minutes</li>
        <li>Read your work aloud to catch awkward phrasing</li>
        <li>Create detailed character profiles</li>
        <li>Use the 'show, don't tell' principle</li>
        <li>Take regular breaks to avoid burnout</li>
        <li>Join a writing group for feedback</li>
        <li>Study the masters in your genre</li>
        <li>Embrace the editing process</li>
        <li>Develop a consistent writing routine</li>
        <li>Believe in your unique voice</li>
      </ol>
    `
  },
  {
    id: 5,
    title: "Virtual Book Club Platform Launch",
    excerpt: "Our new virtual book club platform connects readers worldwide for meaningful literary discussions and author interactions.",
    category: "Platform Update",
    date: "2024-02-25",
    readTime: "6 min read",
    author: "Lisa Thompson",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Community", "Book Clubs", "Features"],
    featured: true,
    content: `
      <h2>Connecting Readers Globally</h2>
      <p>Our new virtual book club platform breaks geographical barriers, allowing readers from around the world to connect and discuss literature.</p>
      
      <h3>Platform Features:</h3>
      <ul>
        <li>Live video discussions with authors</li>
        <li>Scheduled reading plans</li>
        <li>Discussion guides and questions</li>
        <li>Member forums and chat rooms</li>
        <li>Personalized book recommendations</li>
      </ul>
    `
  },
  {
    id: 6,
    title: "The Future of Digital Publishing",
    excerpt: "Exploring emerging technologies and trends that are shaping the future of how we create, distribute, and consume books.",
    category: "Industry Analysis",
    date: "2024-02-20",
    readTime: "9 min read",
    author: "Robert Kim",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Publishing", "Future", "Technology"],
    featured: false,
    content: `
      <h2>Tomorrow's Publishing Landscape</h2>
      <p>The digital publishing industry is evolving rapidly with new technologies creating exciting opportunities and challenges.</p>
      
      <h3>Emerging Trends:</h3>
      <ul>
        <li>AI-assisted writing and editing tools</li>
        <li>Interactive and multimedia books</li>
        <li>Blockchain for rights management</li>
        <li>Personalized reading experiences</li>
        <li>Sustainable digital distribution</li>
      </ul>
    `
  },
  {
    id: 7,
    title: "How to Build a Consistent Reading Habit",
    excerpt: "Practical strategies and psychological tips to help you read more books and develop a lifelong reading habit.",
    category: "Self-Improvement",
    date: "2024-02-15",
    readTime: "6 min read",
    author: "Maria Gonzalez",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Reading", "Habits", "Productivity"],
    featured: false,
    content: `
      <h2>Cultivating a Reading Lifestyle</h2>
      <p>Building a consistent reading habit is about creating systems and environments that support your literary goals.</p>
      
      <h3>Effective Strategies:</h3>
      <ul>
        <li>Start with just 10 minutes a day</li>
        <li>Always carry a book (physical or digital)</li>
        <li>Join reading challenges</li>
        <li>Create a dedicated reading space</li>
        <li>Mix different genres and formats</li>
        <li>Track your progress</li>
        <li>Share your reading journey with others</li>
      </ul>
    `
  },
  {
    id: 8,
    title: "Book Review: 'Echoes of Tomorrow'",
    excerpt: "An in-depth review of the latest science fiction masterpiece that explores artificial intelligence and human consciousness.",
    category: "Book Review",
    date: "2024-02-10",
    readTime: "7 min read",
    author: "Thomas Reed",
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Review", "Science Fiction", "Books"],
    featured: true,
    content: `
      <h2>A Masterpiece of Speculative Fiction</h2>
      <p>'Echoes of Tomorrow' by Alex Chen is a breathtaking exploration of what it means to be human in an age of artificial intelligence.</p>
      
      <h3>Review Highlights:</h3>
      <ul>
        <li><strong>Plot:</strong> 5/5 - Original and thought-provoking</li>
        <li><strong>Characters:</strong> 5/5 - Deeply developed and relatable</li>
        <li><strong>Writing Style:</strong> 4.5/5 - Elegant and immersive</li>
        <li><strong>Overall:</strong> 4.8/5 - Highly recommended</li>
      </ul>
      
      <p>This novel will stay with you long after you've turned the final page, challenging your perceptions of consciousness and identity.</p>
    `
  }
];

// Categories for filtering
export const categories = [
  "All News",
  "Feature Update",
  "Industry Trends",
  "Author Interview",
  "Writing Tips",
  "Platform Update",
  "Industry Analysis",
  "Self-Improvement",
  "Book Review"
];

// Featured news (for highlights)
export const featuredNews = newsData.filter(news => news.featured);

// Latest news (most recent first)
export const latestNews = [...newsData].sort((a, b) => new Date(b.date) - new Date(a.date));

export default newsData;
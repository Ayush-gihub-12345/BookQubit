# BookQubit - Modern Book Discovery Platform

Multilingual book discovery platform with Next.js frontend and Node.js backend, featuring 20+ languages, dynamic theming, and user authentication.

## 📦 Project Structure

```
BookQubit/
├── web/              # Next.js frontend (Cloudflare Workers deployment)
├── server/           # Node.js API server (book data)
├── app/              # Flutter mobile app
└── db/               # Database files & schemas
```

## 🚀 Quick Start

### Frontend (Web)
```bash
cd web
npm install
npm run dev        # Development
npm run deploy     # Deploy to Cloudflare
```

### Backend (Server)
```bash
cd server
npm install
npm run dev        # Development
```

### Mobile (Flutter)
```bash
cd app
flutter pub get
flutter run
```

## ✨ Features

- **20+ Languages** with RTL support (English, Hindi, Urdu, Arabic, Bengali, Tamil, Telugu, Kannada, Malayalam, Spanish, French, German, Italian, Chinese, Japanese, Korean, Persian, Russian, Pashto, Marathi)
- **Multiple Themes** (Dark, Light, Forest, Cyberpunk, and more)
- **Book Discovery** with advanced search and filtering
- **User Authentication** via Firebase
- **User Library** for tracking reading progress
- **Responsive Design** optimized for all devices
- **Fast Performance** via Cloudflare Workers edge deployment
- **Rich Metadata** with genres, subjects, ratings, affiliate links

## 🎯 Key Technologies

- **Frontend**: Next.js 15, React 19, Tailwind CSS, TypeScript
- **Backend**: Node.js, Express
- **Mobile**: Flutter
- **Deployment**: Cloudflare Workers, Wrangler
- **Authentication**: Firebase
- **Data**: JSON-based (books, authors, publishers, translations)

## 📱 Pages & Features

- Home page with featured books
- Book detail pages with full metadata
- Advanced search with filters
- Browse by author, category, genre
- User dashboard with saved library
- Multi-language support with instant switching
- Theme switcher (5+ themes)
- User ratings and reviews

## 📊 Data

All book data stored in `server/src/api/v1/modules/books/data/` with translations for each language:

```
BooksData_English.js, BooksData_Hindi.js, BooksData_Urdu.js, ...
(20 language variants with 600+ books total)
```

Each book includes:
- Title, author, publisher, ISBN
- Description and detailed summary
- Cover image URL
- Rating and review count
- Categories, genres, subjects, tags
- Reading level and key points
- Affiliate purchase links (Amazon, Audible, etc.)
- Geographic origin data

## 🌐 Deployment

### Web (Cloudflare Workers)
```bash
cd web
npm run deploy
```

### Server (Node.js)
Deploy to any Node.js hosting (Vercel, Railway, Heroku, etc.)

### Mobile (Flutter)
Build for iOS/Android via Flutter CLI

## 📚 Documentation

See individual README files:
- `web/README.md` - Web app details
- `server/README.md` - Backend API details  
- `app/README.md` - Mobile app details

## 🔐 Authentication

Firebase configured for user authentication. Update credentials in:
- `web/src/config/firebase.js`
- `server/.env` (for API validation)

## 🎨 Customization

### Themes
Modify themes in `web/src/themes/`:
- `dark.js`, `light.js`, `forest.js`, `cyberpunk.js`, etc.

### Languages
Add new language by creating:
- `web/src/data/books/BooksData_[Language].js`
- `web/src/translations/[lang_code].json`

### Book Data
Update book data in `server/src/api/v1/modules/books/data/BooksData_*.js`

## 📦 Dependencies

Install dependencies in each folder:
```bash
npm install  # web/
npm install  # server/
```

## 🚀 Development Workflow

1. Make changes in `web/` or `server/`
2. Test locally with `npm run dev`
3. Commit to git
4. Deploy with `npm run deploy`

## 📄 License

Proprietary - BookQubit Inc.

---

**Version**: 0.1.0  
**Last Updated**: June 2024  
**Status**: Active Development
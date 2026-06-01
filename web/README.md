# BookQubit Web - Next.js Frontend

Modern, multilingual book discovery platform built with Next.js and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for Cloudflare
npm run cf:build

# Deploy
npm run deploy
```

## 📦 Project Structure

```
src/
├── app/              # Next.js pages and routes
├── components/       # React components (books, search, auth, etc.)
├── contexts/         # React context (Language, Theme, Font)
├── data/             # Book data in JSON format
├── datalang/         # Multilingual content
├── features/         # Feature modules
├── hooks/            # Custom React hooks
├── layout/           # Layout components
├── themes/           # Theme definitions (dark, light, forest, cyberpunk)
├── translations/     # i18n translations
└── utils/            # Utility functions
```

## 🌍 Features

- **20+ Languages** with RTL support
- **Multiple Themes** (dark, light, forest, cyberpunk, etc.)
- **Book Search & Discovery**
- **User Authentication** (Firebase)
- **Responsive Design** (mobile-first)
- **Fast Performance** (Cloudflare Workers deployment)

## 🎨 Themes

Located in `src/themes/`. Currently available:
- Dark theme
- Light theme
- Forest theme
- Cyberpunk theme
- Minimal theme

## 🌐 Languages Supported

English, Hindi, Urdu, Arabic, Bengali, Tamil, Telugu, Kannada, Malayalam, Spanish, French, German, Italian, Chinese, Japanese, Korean, Persian, Russian, Pashto, Marathi

## 📊 Data Format

Books stored as JSON in `src/data/` with fields:
- `id`, `title`, `slug`, `author`
- `description`, `summary`
- `category`, `genres`, `subjects`, `tags`, `keyPoints`
- `imageUrl`, `rating`, `price`, `isbn`
- `pageCount`, `published`, `format`
- `buttons` (affiliate links)

## 🔧 Configuration Files

- `next.config.mjs` - Next.js settings
- `wrangler.toml` - Cloudflare Workers config
- `wrangler.jsonc` - Worker JSON config
- `open-next.config.ts` - OpenNext adapter config
- `tailwind.config.js` - Tailwind CSS config

## 📱 Main Pages

- `/` - Home with featured books
- `/books/:slug` - Book detail
- `/search` - Search and filter
- `/authors` - Browse authors
- `/categories` - Browse categories
- `/dashboard` - User dashboard
- `/drift` - Social/trending feature

## 🔐 Authentication

Firebase configured in `src/config/firebase.js`. Update with your Firebase credentials.

## 🎨 Styling

- Tailwind CSS v4
- Custom theme system
- React Icons
- Framer Motion for animations

## 📦 Key Dependencies

- `next` (v15) - React framework
- `tailwindcss` - CSS framework
- `firebase` - Backend & auth
- `react-icons` - Icons
- `framer-motion` - Animations
- `wrangler` - Cloudflare CLI

## 🚢 Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

Ensure `wrangler.toml` is configured with your Cloudflare account ID.

## 🧪 Development

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run lint      # Lint code
npm start         # Run production server
```

## 📄 License

Proprietary - BookQubit Inc.

---

**Version**: 0.1.0

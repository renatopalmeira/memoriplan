# MemoriPlan 📚⏱️

A powerful study session planner with integrated timer, progress tracking, and 35-week curriculum management.

**Live Demo:** [memoriplan.netlify.app](https://memoriplan.netlify.app)

---

## 🎯 Features

- **Study Sessions**: Timer-based study tracking with session notes
- **35-Week Curriculum**: Organized weekday schedule with progress checklist
- **Dashboard**: Real-time stats, streak tracking, and progress visualization
- **Authentication**: Secure login with email via Supabase
- **Data Sync**: Cloud-based data persistence with Supabase
- **Responsive Design**: Works on desktop, tablet, and mobile

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Supabase account ([free tier available](https://supabase.com))

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/renatopalmeira/memoriplan.git
   cd memoriplan
   ```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your Project URL and Anon Key
   - Open `js/config.js` and add your credentials:
     ```javascript
     const SUPABASE_URL = 'https://your-project.supabase.co';
     const SUPABASE_ANON_KEY = 'your-anon-key-here';
     ```

3. **Initialize database tables**
   - Go to Supabase SQL Editor
   - Create a new query and paste contents of `supabase-setup.sql`
   - Execute the SQL

4. **Run locally**
   - Use Live Server (VS Code extension) or any simple HTTP server
   - Open `login.html` to start

---

## 📁 Project Structure

```
memoriplan/
├── index.html              # Dashboard
├── login.html              # Authentication
├── sessoes.html            # Study session timer
├── cronograma.html         # 35-week curriculum
├── js/
│   ├── config.js           # Supabase configuration
│   ├── auth.js             # Authentication logic
│   ├── data.js             # Database CRUD operations
│   └── nav.js              # Shared navigation & utilities
├── supabase-setup.sql      # Database initialization script
├── netlify.toml            # Netlify deployment config
└── README.md               # This file
```

---

## 🔧 Configuration

### Environment Variables

For production deployment, use environment variables instead of hardcoding:

**Netlify Environment Variables:**
1. Go to your Netlify site settings
2. Navigate to Build & deploy → Environment
3. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**Using in code:**
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-key';
```

---

## 🛠️ Development

### File Overview

| File | Purpose |
|------|---------|
| `login.html` | User authentication (login/signup) |
| `index.html` | Main dashboard with stats |
| `sessoes.html` | Study session timer & logging |
| `cronograma.html` | Weekly calendar & checklist |
| `js/auth.js` | Authentication functions |
| `js/data.js` | Database operations |
| `js/config.js` | Supabase client setup |
| `js/nav.js` | Shared utilities |

### Key Functions

**Authentication (`auth.js`):**
- `signup()` - Register new user
- `login()` - Authenticate user
- `logout()` - Clear session

**Data Management (`data.js`):**
- `saveSessao()` - Log study session
- `getProgress()` - Fetch user progress
- `updateSettings()` - Save preferences

---

## 📱 Pages

- **Login** (`login.html`) - Sign up or log in
- **Dashboard** (`index.html`) - Overview of progress and stats
- **Study Session** (`sessoes.html`) - Timer with session logging
- **Curriculum** (`cronograma.html`) - 35-week plan with checkboxes

---

## 🌐 Deployment

### Netlify (Recommended)

1. **Connect Repository**
   - Sign up at [netlify.com](https://netlify.com)
   - Connect your GitHub repo
   - Select this repo during setup

2. **Configure Build Settings**
   - Publish directory: `.` (root)
   - Build command: (leave empty - static site)

3. **Add Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add your Supabase credentials

4. **Deploy**
   - Push to `main` branch - automatic deploy triggers
   - View at `https://your-site.netlify.app`

### Other Platforms

- **Vercel**: Similar to Netlify, connect GitHub repo
- **GitHub Pages**: Push to `gh-pages` branch
- **Firebase Hosting**: Upload static files

---

## 🔐 Security Notes

- **Supabase Anon Key** is intentionally public (RLS policies protect data)
- **User Authentication** is required to access data
- **Database Rules** restrict access to user's own records
- For production, review [Supabase Security Docs](https://supabase.com/docs/guides/auth)

---

## 📊 Database Schema

**Tables:**
- `users` - User profiles (managed by Supabase Auth)
- `sessoes` - Study session records
- `cronograma_progresso` - Weekly checklist status
- `user_settings` - User preferences

See `supabase-setup.sql` for full schema.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 📧 Support

- **Issues**: Open a [GitHub Issue](https://github.com/renatopalmeira/memoriplan/issues)
- **Discussions**: Use [GitHub Discussions](https://github.com/renatopalmeira/memoriplan/discussions)
- **Docs**: Check [leia-me.md](./leia-me.md) for Portuguese setup guide

---

**Last Updated:** March 2026  
**Version:** 1.0.0

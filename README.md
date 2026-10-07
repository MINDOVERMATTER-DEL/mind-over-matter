# Mind Over Matter website

The website for **Mind Over Matter**, the student-led mental health club for students across Kenya: club information, events and programs, a blog, a contact form, and a private admin dashboard for publishing posts and events and reading messages.

Built with React and Vite. Content (blog posts, events, contact messages) and admin sign-in use Firebase.

## Run it locally

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install      # first time only: installs the libraries
npm run dev      # starts the site at http://localhost:5173
```

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Run the site locally with live reload |
| `npm run build` | Build the finished site into `dist/` |
| `npm run preview` | Preview the built site |
| `npm run lint` / `npm run lint:css` | Check the code and styles |
| `npm run icons` | Regenerate `pages/icons.jsx` after adding an icon |
| `npm run share-image` | Regenerate the social share image |

The live address, `https://www.mindovermatterke.org`, is set in `vite.config.js` and used for share previews and the
sitemap. To build a copy for a different address, set `SITE_URL`:

```bash
# Windows (Command Prompt)
set SITE_URL=https://your-site-address && npm run build
# macOS / Linux
SITE_URL=https://your-site-address npm run build
```

## Where things are

| Path | Contents |
| --- | --- |
| `pages/` | One HTML file per page, `main.jsx` (the whole app), `icons.jsx` (generated) |
| `styles.css` | All styling |
| `data/club.js` | Club text: mission, values, team, contact details, social links |
| `data/blog.js` | Firebase: posts, events, contact messages, admin sign-in |
| `firebase-config.js` | The Firebase project's public web config |
| `firestore.rules` | Database security rules: paste into the Firebase console when changed |
| `assets/images/` | All website images (see the README inside) |
| `documents/` | The Articles of Association and the club presentation |
| `scripts/` | Small build helpers (icons, share image) |

## Admin dashboard

The dashboard is at `/admin.html` (not linked in the menu). Admins sign in with an email and password created in Firebase. See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for setting up Firebase and adding admins.

Designed by Vincent Murithi.

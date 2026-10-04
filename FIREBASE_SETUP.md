# Connecting the blog to Firebase

The admin page (`admin.html`) lets an admin publish and delete blog posts without touching code. Posts are stored in Firebase. Until Firebase is connected, the site shows the four built-in sample posts.

Everything below uses Firebase's free **Spark** plan. No credit card is needed.

## 1. Create the project

1. Go to <https://console.firebase.google.com> and sign in with a Google account the club controls (not a personal one, if possible).
2. Click **Create a project**, name it (for example `mind-over-matter`), and finish the wizard. Google Analytics is optional.

## 2. Add the website and copy its config

1. On the project's home page, click the **Web** icon (`</>`) to add a web app. Give it a nickname; skip Firebase Hosting for now.
2. Firebase shows a `firebaseConfig` block. Copy its six values into [`firebase-config.js`](firebase-config.js), replacing the `YOUR_...` placeholders.

These values are safe to publish. What protects the data is the rules in step 4.

## 3. Turn on the database and sign-in

1. **Firestore Database** → **Create database** → choose a location close to Kenya (for example `europe-west1`) → start in **production mode**.
2. **Authentication** → **Get started** → **Sign-in method** → enable **Email/Password**.

## 4. Add the security rules

1. **Firestore Database** → **Rules**.
2. Replace everything there with the contents of [`firestore.rules`](firestore.rules) and click **Publish**.

The rules let anyone read posts, but only admins can publish or delete them.

## 5. Create the admin account

1. **Authentication** → **Users** → **Add user**. Enter the admin's email and a strong password.
2. Copy the new user's **User UID** from the list.
3. **Firestore Database** → **Data** → **Start collection**. Collection ID: `admins`. Document ID: paste the UID. Add any field (for example `name` = the admin's name) and save.

Repeat step 5 for each extra admin. To remove an admin, delete their document from `admins` (and optionally the user from Authentication).

## 6. Try it

Open `admin.html`, sign in, and publish a test post. It appears on the Home and Blog pages straight away. Delete it from the same page.

## Good to know

- **Cover images** are resized in the browser and saved inside the post, so they don't need Firebase Storage (which requires the paid Blaze plan). Each post, including its image, must stay under about 1 MB, which a resized photo easily does.
- **Free plan limits:** 50,000 document reads and 20,000 writes per day. Each visit reads every post once, so with 20 posts the blog can handle about 2,500 visits a day for free.
- The admin page isn't linked from the menu. Bookmark it: `/admin.html`.

## ✅ **PHASE 1: Project Bootstrapping**

### 1. **Initialize Project**  
**Goal**: Set up the `skygit/` project with **Svelte + Vite + TailwindCSS**, starting inside an existing folder (with e.g., a `README.md` already there).

---

### 🔧 **A. Scaffold Svelte + Vite (SPA Template)**

From inside the `skygit/` folder:

```bash
npx degit sveltejs/template ./ --force
```

- This copies the official **Svelte + Vite template** into the current folder.
- Existing files like `README.md` will be preserved (unless they conflict with the scaffold).

Then install dependencies:

```bash
npm install
```

---

### ✅ **Test #1: Base Svelte App Works**

```bash
npm run dev
```

- Open your browser to the printed `localhost` URL (usually http://localhost:5173)
- You should see:  
  > Hello world!  
- ✅ This confirms Svelte + Vite are working.

---

### 🎨 **B. Add TailwindCSS**

Now let’s add Tailwind to style the app.

#### Step 1: Install Tailwind dependencies

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

> Creates:
> - `tailwind.config.js`
> - `postcss.config.js`

---

#### Step 2: Configure Tailwind

Edit `tailwind.config.js` to:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,ts,svelte}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

#### Step 3: Add Tailwind directives

Create a CSS file:

```bash
touch src/global.css
```

Inside `src/global.css`, add:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

#### Step 4: Import Tailwind in `main.js`

Edit `src/main.js` and add at the top:

```js
import './global.css';
```

---

### ✅ **Test #2: Tailwind Works**

Edit `src/App.svelte` and replace the content with:

```svelte
<script>
  let message = "SkyGit is alive!";
</script>

<h1 class="text-3xl font-bold text-blue-600">{message}</h1>
```

Then run:

```bash
npm run dev
```

✅ If the text appears **large and blue**, Tailwind is working correctly!

---

### 📁 Expected Folder Structure After This Step

```
skygit/
├── README.md
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.png
├── src/
│   ├── App.svelte
│   ├── main.js
│   └── global.css
└── ...
```

---

### ✅ **Final Checklist**

| Task                           | Done? |
|--------------------------------|-------|
| Svelte template installed      | ✅    |
| Dev server runs                | ✅    |
| Tailwind installed             | ✅    |
| Tailwind classes render in UI | ✅    |

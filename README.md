

# 🎨 YouTube Thumbnail AI

AI-powered YouTube thumbnail generator built with **Vite, React, TypeScript, Tailwind CSS, shadcn/ui, and Radix UI**.

## 🚀 Features

* 🤖 AI-based YouTube thumbnail generation
* 📸 Preview thumbnails in-app (click to enlarge)
* ⬇️ One-click download support
* 🎨 Styled with Tailwind + shadcn/ui components
* 🔍 Clean routing via React Router DOM
* ⚡ Optimized state management with React Query + React Hook Form + Zod
* 🖼️ Open Graph & Twitter Card meta tags for beautiful social previews

## 🛠️ Tech Stack

* **Frontend:** [React 18](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
* **UI:** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
* **Forms & Validation:** [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
* **Data Fetching:** [React Query](https://tanstack.com/query/v5)
* **Charts (if needed):** [Recharts](https://recharts.org/)
* **Icons:** [Lucide React](https://lucide.dev/)

## ⚡ Getting Started

Clone and set up the project:

```bash
# 1️⃣ Clone the repo
git clone <YOUR_GIT_URL>

# 2️⃣ Move into project folder
cd youtube-thumbnail-ai

# 3️⃣ Install dependencies
npm install

# 4️⃣ Start development server
npm run dev
```

The app will be running at:
👉 **[http://localhost:5173/](http://localhost:5173/)**

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 📸 Social Preview

Update the `public/thumbnail-preview.png` (or use your own image) for meta tags:

```html
<meta property="og:image" content="/thumbnail-preview.png" />
<meta name="twitter:image" content="/thumbnail-preview.png" />
```



# Password Generator / Vault

Local dev
1. Copy env template: `cp .env.local.example .env.local` and fill values (see below).
2. Install: `npm install`
3. Run: `npm run dev` (opens http://localhost:3000)

Build / Production
- `npm run build`
- `npm start` (or deploy to Vercel/Netlify — set the same env vars in the host dashboard)

Environment (.env.local)
- MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/<dbname>?retryWrites=true&w=majority
- (optional) MONGODB_URI_FALLBACK=mongodb://<user>:<password>@host1:27017,host2:27017/<dbname>?replicaSet=...
- JWT_SECRET=your_jwt_secret

Notes
- API routes for /api/auth/* and /api/entries/* expect a MongoDB database and the above env vars.
- Client-side encryption uses Web Crypto (AES-GCM + PBKDF2). Master password is never sent to server.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

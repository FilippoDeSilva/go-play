# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# TMDB API Configuration
NEXT_PUBLIC_TMDB_ACCESS_TOKEN=<your-token>
NEXT_PUBLIC_TMDB_API_KEY=<your-api-key>
NEXT_PUBLIC_TMDB_API_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
NEXT_PUBLIC_BASE_URL=https://vidlink.pro

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your_nextauth_secret_here>
```

## Getting TMDB API Key

1. Go to [TMDB API](https://www.themoviedb.org/settings/api)
2. Create an account if you don't have one
3. Request an API key
4. Copy the API key and add it to your `.env.local` file

## NextAuth Secret

Generate a secure random string for `NEXTAUTH_SECRET`. You can use the following command:

```bash
openssl rand -base64 32
```

## Development

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

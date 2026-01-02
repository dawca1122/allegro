This repository is configured to deploy on Vercel as a monorepo. The frontend is built with Vite and served as static assets. The backend FastAPI endpoints live under /api and are deployed using Vercel Python serverless functions.

Environment variables to set in Vercel (see README for details):
- DISABLE_AUTH=1 (set to 1 for development to bypass authentication)
- OPENAI_API_KEY (if AI modules use OpenAI)
- ALLEGRO_CLIENT_ID and ALLEGRO_CLIENT_SECRET or ALLEGRO_API_TOKEN (for Allegro API access)
- DATABASE_URL (if your modules use a database)
- SECRET_KEY (app secret, if used)



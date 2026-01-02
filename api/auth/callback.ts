import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Brak kodu' });

  const basicAuth = Buffer.from(`${process.env.ALLEGRO_CLIENT_ID}:${process.env.ALLEGRO_CLIENT_SECRET}`).toString('base64');

  try {
    const token_url = process.env.ALLEGRO_TOKEN_URL || 'https://allegro.pl/auth/oauth/token'
    const response = await fetch(token_url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: process.env.ALLEGRO_REDIRECT_URI || 'https://allegro-app.vercel.app/api/auth/callback'
      })
    });

    const data = await response.json();
    if (!response.ok) throw data;

    // BEZPIECZNIK: Jeśli data.expires_in nie istnieje, używamy 43200 (12h)
    const secondsToExpire = data.expires_in || 43200;
    const expiresAt = new Date(Date.now() + (secondsToExpire * 1000)).toISOString();

    const { error } = await supabase
      .from('allegro_tokens')
      .upsert({
        user_email: 'admin',
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: expiresAt // Gwarantujemy, że to nie będzie null
      }, { onConflict: 'user_email' });

    if (error) throw error;

    res.redirect('/?auth=success');

  } catch (err: any) {
    res.status(500).json({ 
      error: 'Baza danych odrzuciła zapis', 
      details: err,
      debug_info: 'Upewnij się, że zrobiłeś Redeploy na Vercel!' 
    });
  }
}909
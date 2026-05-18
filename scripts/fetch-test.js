const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');

// Prefer IPv4 DNS resolution
try {
  const dns = require('dns');
  if (typeof dns.setDefaultResultOrder === 'function') dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

(async () => {
  try {
    const envFile = path.join(process.cwd(), '.env.local');
    let env = {};
    if (fs.existsSync(envFile)) {
      const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
      for (const l of lines) {
        const m = l.match(/^([^#=\s]+)=(.*)$/);
        if (m) env[m[1]] = m[2].replace(/^"|"$/g, '');
      }
    }
    const url = env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      console.error('Missing URL/anon key in .env.local');
      process.exit(1);
    }
    const rest = url.replace(/\/$/, '') + '/rest/v1/contributions?select=id&limit=1';
    console.log('Fetching', rest);
    try {
      const res = await fetch(rest, { method: 'GET', headers: { apikey: anon, Authorization: `Bearer ${anon}` } });
      console.log('Status:', res.status);
      const text = await res.text();
      console.log('Body:', text.slice(0, 1000));
    } catch (err) {
      console.error('Fetch error:', err && err.message ? err.message : err);
      if (err && err.stack) console.error(err.stack);
    }
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
  }
})();

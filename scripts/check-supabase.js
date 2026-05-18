const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Prefer IPv4 DNS resolution
try {
  const dns = require('dns');
  if (typeof dns.setDefaultResultOrder === 'function') dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

function loadEnvFile(file) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) return {};
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  const out = {};
  for (const l of lines) {
    const m = l.match(/^([^#=\s]+)=(.*)$/);
    if (m) {
      out[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  }
  return out;
}

(async () => {
  try {
    const env = { ...process.env, ...loadEnvFile('.env.local') };
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Supabase URL:', supabaseUrl ? supabaseUrl : '(not set)');
    console.log('Anon key set:', !!anonKey);
    console.log('Service role set:', !!serviceKey);

    if (!supabaseUrl) {
      console.error('No NEXT_PUBLIC_SUPABASE_URL configured.');
      process.exit(1);
    }

    // basic network fetch test
    try {
      const res = await fetch(supabaseUrl, { method: 'GET' });
      console.log('Fetch to supabase base URL status:', res.status);
    } catch (err) {
      console.error('Network fetch to Supabase base URL failed:', err && err.message ? err.message : err);
      if (err && err.stack) console.error(err.stack);
    }

    // try Supabase REST basic query using client
    try {
      const keyToUse = serviceKey || anonKey || '';
      if (!keyToUse) {
        console.error('No anon or service key available to test Supabase client.');
        process.exit(1);
      }
      const supabase = createClient(supabaseUrl, keyToUse);
      console.log('Performing a lightweight query to contributions (select id limit 1)...');
      const { data, error } = await supabase.from('contributions').select('id').limit(1);
      if (error) {
        console.error('Supabase client query error:', error.message || error);
      } else {
        console.log('Supabase query succeeded, rows returned:', Array.isArray(data) ? data.length : typeof data);
      }
    } catch (err) {
      console.error('Supabase client operation failed:', err && err.message ? err.message : err);
      if (err && err.stack) console.error(err.stack);
    }
  } catch (err) {
    console.error('Diagnostic failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();

/**
 * Migrate content from Supabase to Prismic (document by document, skip existing)
 * Usage: PRISMIC_WRITE_TOKEN=xxx node scripts/migrate-to-prismic.mjs
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vafbtwbsxdlefksonpyg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZmJ0d2JzeGRsZWZrc29ucHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTEyMTYsImV4cCI6MjA4OTg2NzIxNn0.56cOAQq5jAAorhi5UYSN3RKNpjmd0j62fvGlTlSWcmY';
const PRISMIC_REPO = 'prado-itineraire';
const PRISMIC_WRITE_TOKEN = process.env.PRISMIC_WRITE_TOKEN;
const PRISMIC_API = `https://migration.prismic.io/documents`;

if (!PRISMIC_WRITE_TOKEN) { console.error('Missing PRISMIC_WRITE_TOKEN'); process.exit(1); }

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

async function createDocument(type, uid, data) {
  const body = { title: data.title || uid, type, uid, lang: 'en-us', data };
  const res = await fetch(PRISMIC_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PRISMIC_WRITE_TOKEN}`,
      'Content-Type': 'application/json',
      'repository': PRISMIC_REPO,
      'x-api-key': PRISMIC_WRITE_TOKEN,
    },
    body: JSON.stringify(body),
  });
  if (res.ok) return 'created';
  const text = await res.text();
  if (text.includes('already exists')) return 'exists';
  throw new Error(`${res.status}: ${text}`);
}

async function main() {
  const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);

  console.log('Fetching data from Supabase...');
  const { data: actions } = await supabase.from('actions').select('*').order('id');
  const { data: ressources } = await supabase.from('ressources').select('*').order('id');
  console.log(`Found ${actions?.length ?? 0} actions, ${ressources?.length ?? 0} ressources`);

  const usedUids = new Set();
  function uniqueUid(base, id) {
    let uid = base;
    if (usedUids.has(uid)) uid = `${base}-${id}`;
    usedUids.add(uid);
    return uid;
  }

  let created = 0, skipped = 0, errors = 0;

  // Migrate actions
  console.log('\nMigrating actions...');
  for (const a of actions ?? []) {
    const uid = uniqueUid(slugify(a.title), a.id);
    try {
      const result = await createDocument('action', uid, {
        title: a.title,
        category: a.category,
        date_text: a.date ?? '',
        time_text: a.time ?? '',
        summary: a.summary ?? '',
        description: [{ type: 'paragraph', text: a.description ?? '', spans: [] }],
        url_detail: { link_type: 'Web', url: a.url_detail || 'https://itineraires.le-prado.fr' },
        // image skipped - add via Prismic dashboard later
        is_activite: a.is_activite ?? false,
        original_id: a.id,
      });
      if (result === 'created') { created++; process.stdout.write('+'); }
      else { skipped++; process.stdout.write('.'); }
    } catch (err) {
      errors++;
      process.stdout.write('!');
      console.error(`\n  Error ${uid}: ${err.message}`);
    }
    // Rate limit: 200ms between requests
    await new Promise(r => setTimeout(r, 1500));
  }

  // Migrate ressources
  console.log('\n\nMigrating ressources...');
  for (const r of ressources ?? []) {
    const uid = uniqueUid(slugify(r.title), `r${r.id}`);
    try {
      const result = await createDocument('ressource', uid, {
        title: r.title,
        category: r.category,
        description: [{ type: 'paragraph', text: r.description ?? '', spans: [] }],
        url: { link_type: 'Web', url: r.url || 'https://itineraires.le-prado.fr' },
        // image skipped - add via Prismic dashboard later
        original_id: r.id,
      });
      if (result === 'created') { created++; process.stdout.write('+'); }
      else { skipped++; process.stdout.write('.'); }
    } catch (err) {
      errors++;
      process.stdout.write('!');
      console.error(`\n  Error ${uid}: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n\nDone! Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch(console.error);

/**
 * Migrate content from Supabase to Prismic using the official SDK Migration API
 * This creates AND publishes documents.
 *
 * Usage: PRISMIC_WRITE_TOKEN=xxx node scripts/migrate-to-prismic.mjs
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import * as prismic from '@prismicio/client';

const SUPABASE_URL = 'https://vafbtwbsxdlefksonpyg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZmJ0d2JzeGRsZWZrc29ucHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTEyMTYsImV4cCI6MjA4OTg2NzIxNn0.56cOAQq5jAAorhi5UYSN3RKNpjmd0j62fvGlTlSWcmY';
const PRISMIC_REPO = 'prado-itineraire';
const PRISMIC_WRITE_TOKEN = process.env.PRISMIC_WRITE_TOKEN;

if (!PRISMIC_WRITE_TOKEN) { console.error('Missing PRISMIC_WRITE_TOKEN'); process.exit(1); }

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

async function main() {
  const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);

  console.log('Fetching data from Supabase...');
  const { data: actions } = await supabase.from('actions').select('*').order('id');
  const { data: ressources } = await supabase.from('ressources').select('*').order('id');
  console.log(`Found ${actions?.length ?? 0} actions, ${ressources?.length ?? 0} ressources`);

  // Create write client
  const writeClient = prismic.createWriteClient(PRISMIC_REPO, {
    writeToken: PRISMIC_WRITE_TOKEN,
  });

  // Create migration
  const migration = prismic.createMigration();

  // Track UIDs for uniqueness
  const usedUids = new Set();
  function uniqueUid(base, id) {
    // Add 'v2' suffix to avoid conflicts with ghost drafts from previous failed migration
    let uid = `${base}-v2`;
    if (usedUids.has(uid)) uid = `${base}-${id}-v2`;
    usedUids.add(uid);
    return uid;
  }

  // Add actions
  console.log('\nPreparing actions...');
  for (const a of actions ?? []) {
    const uid = uniqueUid(slugify(a.title), a.id);
    migration.createDocument(
      {
        type: 'action',
        uid,
        lang: 'en-us',
        data: {
          title: a.title,
          category: a.category,
          date_text: a.date ?? '',
          time_text: a.time ?? '',
          summary: a.summary ?? '',
          description: [{ type: 'paragraph', text: a.description ?? '', spans: [] }],
          url_detail: { link_type: 'Web', url: a.url_detail || 'https://itineraires.le-prado.fr' },
          is_activite: a.is_activite ?? false,
          original_id: a.id,
        },
      },
      `Action: ${a.title}`
    );
    console.log(`  + ${uid}`);
  }

  // Add ressources
  console.log('\nPreparing ressources...');
  for (const r of ressources ?? []) {
    const uid = uniqueUid(slugify(r.title), `r${r.id}`);
    migration.createDocument(
      {
        type: 'ressource',
        uid,
        lang: 'en-us',
        data: {
          title: r.title,
          category: r.category,
          description: [{ type: 'paragraph', text: r.description ?? '', spans: [] }],
          url: { link_type: 'Web', url: r.url || 'https://itineraires.le-prado.fr' },
          original_id: r.id,
        },
      },
      `Ressource: ${r.title}`
    );
    console.log(`  + ${uid}`);
  }

  // Execute migration - this creates AND publishes
  console.log(`\nPushing ${(actions?.length ?? 0) + (ressources?.length ?? 0)} documents to Prismic...`);
  console.log('(This may take several minutes due to rate limiting)\n');

  try {
    await writeClient.migrate(migration, {
      reporter: (event) => {
        if (event.type === 'documents:creating') {
          console.log(`Creating documents: ${event.data.current}/${event.data.total}`);
        }
        if (event.type === 'documents:created') {
          console.log(`Created: ${event.data.current}/${event.data.total}`);
        }
      },
    });
    console.log('\n✅ Migration complete! Documents are published.');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.response) {
      try { console.error('Details:', await err.response.text()); } catch {}
    }
  }
}

main().catch(console.error);

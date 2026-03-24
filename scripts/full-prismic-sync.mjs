/**
 * Full sync: Supabase published data → Prismic (with images)
 * Creates documents that don't exist, skips existing ones.
 * Usage: PRISMIC_WRITE_TOKEN=xxx node scripts/full-prismic-sync.mjs
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import * as prismic from '@prismicio/client';
import { readFileSync, existsSync } from 'fs';

const SUPABASE_URL = 'https://vafbtwbsxdlefksonpyg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZmJ0d2JzeGRsZWZrc29ucHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTEyMTYsImV4cCI6MjA4OTg2NzIxNn0.56cOAQq5jAAorhi5UYSN3RKNpjmd0j62fvGlTlSWcmY';
const PRISMIC_REPO = 'prado-nuxt';
const PRISMIC_WRITE_TOKEN = process.env.PRISMIC_WRITE_TOKEN;

if (!PRISMIC_WRITE_TOKEN) { console.error('Missing PRISMIC_WRITE_TOKEN'); process.exit(1); }

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

// Find local image file for an action/ressource
function findLocalImage(type, id) {
  const dir = `public/images/${type}`;
  for (const ext of ['png', 'jpg', 'jpeg']) {
    const path = `${dir}/${id}.${ext}`;
    if (existsSync(path)) return path;
  }
  return null;
}

async function main() {
  const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);

  console.log('Fetching published data from Supabase...');
  const { data: actions } = await supabase.from('actions').select('*').eq('is_published', true).order('id');
  const { data: ressources } = await supabase.from('ressources').select('*').eq('is_published', true).order('id');
  console.log(`Published: ${actions?.length ?? 0} actions, ${ressources?.length ?? 0} ressources`);

  const writeClient = prismic.createWriteClient(PRISMIC_REPO, { writeToken: PRISMIC_WRITE_TOKEN });
  const migration = prismic.createMigration();

  const usedUids = new Set();
  function uniqueUid(base, id) {
    let uid = base;
    if (usedUids.has(uid)) uid = `${base}-${id}`;
    usedUids.add(uid);
    return uid;
  }

  // Migrate actions
  console.log('\nPreparing actions...');
  for (const a of actions ?? []) {
    const uid = uniqueUid(slugify(a.title), a.id);
    const localImg = findLocalImage('actions', a.id);

    const data = {
      title: a.title,
      category: a.category ?? '',
      date_text: a.date ?? '',
      time_text: a.time ?? '',
      summary: a.summary ?? '',
      description: [{ type: 'paragraph', text: a.description ?? '', spans: [] }],
      url_detail: a.url_detail ? { link_type: 'Web', url: a.url_detail } : undefined,
      is_activite: a.is_activite ?? false,
      original_id: a.id,
    };

    // Add image if we have a local copy
    if (localImg) {
      data.image = migration.createAsset(readFileSync(localImg), localImg.split('/').pop());
    }

    migration.createDocument(
      { type: 'action', uid, lang: 'en-us', data },
      `Action: ${a.title}`
    );
    process.stdout.write('+');
  }

  // Migrate ressources
  console.log('\n\nPreparing ressources...');
  for (const r of ressources ?? []) {
    const uid = uniqueUid(slugify(r.title), `r${r.id}`);
    const localImg = findLocalImage('ressources', r.id);

    const data = {
      title: r.title,
      category: r.category ?? '',
      description: [{ type: 'paragraph', text: r.description ?? '', spans: [] }],
      url: r.url ? { link_type: 'Web', url: r.url } : undefined,
      original_id: r.id,
    };

    if (localImg) {
      data.image = migration.createAsset(readFileSync(localImg), localImg.split('/').pop());
    }

    migration.createDocument(
      { type: 'ressource', uid, lang: 'en-us', data },
      `Ressource: ${r.title}`
    );
    process.stdout.write('+');
  }

  console.log(`\n\nPushing ${(actions?.length ?? 0) + (ressources?.length ?? 0)} documents to Prismic...`);
  console.log('(This will take a while - images need uploading)\n');

  try {
    await writeClient.migrate(migration, {
      reporter: (event) => {
        if (event.type === 'assets:creating') {
          console.log(`Uploading assets: ${event.data.current}/${event.data.total}`);
        }
        if (event.type === 'documents:creating') {
          console.log(`Creating documents: ${event.data.current}/${event.data.total}`);
        }
      },
    });
    console.log('\n✅ Migration complete!');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
  }
}

main().catch(console.error);

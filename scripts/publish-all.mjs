/**
 * Publish all draft documents in Prismic
 * Usage: PRISMIC_WRITE_TOKEN=xxx node scripts/publish-all.mjs
 */

const PRISMIC_REPO = 'prado-itineraire';
const PRISMIC_WRITE_TOKEN = process.env.PRISMIC_WRITE_TOKEN;
const API_BASE = 'https://migration.prismic.io/documents';

if (!PRISMIC_WRITE_TOKEN) { console.error('Missing PRISMIC_WRITE_TOKEN'); process.exit(1); }

async function getApiRef() {
  const res = await fetch(`https://${PRISMIC_REPO}.cdn.prismic.io/api/v2`);
  const data = await res.json();
  return data.refs[0].ref;
}

async function getAllDocuments(ref) {
  let allDocs = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await fetch(
      `https://${PRISMIC_REPO}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&pageSize=100&page=${page}`
    );
    // CDN only returns published docs. Use the Write API to list all including drafts.
    page++;
    if (page > 1) break; // CDN won't show drafts
  }

  // Use the Migration/Write API to list documents instead
  // Actually, let's use the Document API
  const writeRes = await fetch(`https://customtypes.prismic.io/documents`, {
    headers: {
      'Authorization': `Bearer ${PRISMIC_WRITE_TOKEN}`,
      'repository': PRISMIC_REPO,
    },
  });

  if (!writeRes.ok) {
    console.log('Direct document listing not available, trying alternate approach...');
    return [];
  }

  return await writeRes.json();
}

async function publishDocument(docId) {
  // Use the Migration API to publish
  const res = await fetch(`${API_BASE}/${docId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${PRISMIC_WRITE_TOKEN}`,
      'Content-Type': 'application/json',
      'repository': PRISMIC_REPO,
      'x-api-key': PRISMIC_WRITE_TOKEN,
    },
    body: JSON.stringify({}),
  });
  return res.ok;
}

async function main() {
  console.log('Fetching all documents...');

  // The Prismic Migration API doesn't have a list endpoint easily.
  // Instead, use the /documents endpoint with a search
  // Actually, we need to use the Prismic Document API (different from Migration API)

  // Let's try a different approach: use the content API with the write token
  // to search for unpublished documents

  // Actually the simplest approach: query all docs from ALL refs
  const apiRes = await fetch(`https://${PRISMIC_REPO}.cdn.prismic.io/api/v2`);
  const apiData = await apiRes.json();

  // Check if there's a drafts ref
  console.log('Available refs:', apiData.refs.map(r => `${r.id}: ${r.label}`));

  // Unfortunately, CDN API doesn't expose drafts to anonymous clients.
  // The Migration API creates docs but they need to be published via the Prismic dashboard
  // or via the Document API with proper authentication.

  console.log('\n⚠️  Prismic CDN API cannot list draft documents.');
  console.log('The documents need to be published via one of these methods:');
  console.log('');
  console.log('Option 1: Prismic Dashboard (manual)');
  console.log('  → Go to https://prado-itineraire.prismic.io/documents');
  console.log('  → Select all documents → Publish');
  console.log('');
  console.log('Option 2: Re-run migration with the @prismicio/client Migration API');
  console.log('  which auto-publishes documents');
  console.log('');

  // Let's try the Migration API approach to publish
  // The createWriteClient + migrate() method should handle publishing
  console.log('Attempting to publish via Migration API...');

  const { createWriteClient, createMigration } = await import('@prismicio/client');
  const writeClient = createWriteClient(PRISMIC_REPO, {
    writeToken: PRISMIC_WRITE_TOKEN,
  });

  // Try to get all documents via write client
  try {
    // The write client can list documents
    const migration = createMigration();

    // We can't easily list existing draft docs via the SDK
    // Let's try the REST API approach
    const listRes = await fetch(`https://migration.prismic.io/documents?limit=300`, {
      headers: {
        'Authorization': `Bearer ${PRISMIC_WRITE_TOKEN}`,
        'repository': PRISMIC_REPO,
        'x-api-key': PRISMIC_WRITE_TOKEN,
      },
    });

    if (listRes.ok) {
      const docs = await listRes.json();
      console.log(`Found ${Array.isArray(docs) ? docs.length : 'unknown'} documents`);

      if (Array.isArray(docs)) {
        let published = 0;
        for (const doc of docs) {
          // Publish each document
          const pubRes = await fetch(`https://migration.prismic.io/documents/${doc.id}/publish`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${PRISMIC_WRITE_TOKEN}`,
              'repository': PRISMIC_REPO,
              'x-api-key': PRISMIC_WRITE_TOKEN,
            },
          });
          if (pubRes.ok) {
            published++;
            process.stdout.write('+');
          } else {
            process.stdout.write('.');
          }
          await new Promise(r => setTimeout(r, 500));
        }
        console.log(`\n\nPublished: ${published}/${docs.length}`);
      }
    } else {
      console.log('List endpoint returned:', listRes.status, await listRes.text());
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main().catch(console.error);

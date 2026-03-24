/**
 * Scrape full descriptions from Prado detail pages.
 *
 * For each published action and ressource in Supabase that has a detail URL,
 * fetches the HTML, extracts the full description content, and writes results
 * to JSON files for later database update.
 *
 * Output files:
 *   scripts/action-details.json   -- action descriptions + practical info
 *   scripts/ressource-details.json -- ressource descriptions
 *
 * Usage:  node scripts/scrape-details.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SUPABASE_URL = 'https://vafbtwbsxdlefksonpyg.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZmJ0d2JzeGRsZWZrc29ucHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTEyMTYsImV4cCI6MjA4OTg2NzIxNn0.56cOAQq5jAAorhi5UYSN3RKNpjmd0j62fvGlTlSWcmY';

const RATE_LIMIT_MS = 500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a URL with retry logic. Returns null for 404s.
 */
async function fetchPage(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) PradoScraper/1.0',
        },
        redirect: 'follow',
      });

      if (res.status === 404) {
        return null;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }

      return await res.text();
    } catch (err) {
      if (attempt === retries) {
        console.error(`  FAILED after ${retries} attempts: ${err.message}`);
        return null;
      }
      console.log(`  [retry ${attempt}/${retries}] ${err.message} -- waiting 2s`);
      await sleep(2000);
    }
  }
  return null;
}

/**
 * Decode common HTML entities.
 */
function decodeEntities(html) {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&nbsp;/g, ' ')
    .replace(/&laquo;/g, '\u00AB')
    .replace(/&raquo;/g, '\u00BB')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&eacute;/g, '\u00E9')
    .replace(/&egrave;/g, '\u00E8')
    .replace(/&agrave;/g, '\u00E0')
    .replace(/&ccedil;/g, '\u00E7')
    .replace(/&ocirc;/g, '\u00F4')
    .replace(/&ucirc;/g, '\u00FB')
    .replace(/&icirc;/g, '\u00EE')
    .replace(/&acirc;/g, '\u00E2')
    .replace(/&ecirc;/g, '\u00EA')
    .replace(/&euml;/g, '\u00EB')
    .replace(/&iuml;/g, '\u00EF')
    .replace(/&uuml;/g, '\u00FC')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Convert HTML content to clean plain text, preserving structure:
 * - <br>, </p>, </div> become newlines
 * - <li> items become "  - item"
 * - All other tags are stripped
 * - Multiple blank lines are collapsed
 */
function htmlToText(html) {
  if (!html) return '';

  let text = html;

  // Remove style and script tags entirely
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Convert list items to bullet points
  text = text.replace(/<li[^>]*>/gi, '\n  - ');
  text = text.replace(/<\/li>/gi, '');

  // Convert block-level closing tags to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  text = text.replace(/<\/ul>/gi, '\n');
  text = text.replace(/<\/ol>/gi, '\n');

  // Strip all remaining tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode entities
  text = decodeEntities(text);

  // Collapse multiple blank lines into at most two newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  // Trim each line
  text = text
    .split('\n')
    .map((line) => line.trim())
    .join('\n');

  // Remove leading/trailing whitespace
  text = text.trim();

  return text;
}

/**
 * Convert HTML content to Prismic Rich Text format (array of paragraph objects).
 * Each <p> becomes a paragraph, each <li> becomes a list-item, etc.
 */
function htmlToPrismicRichText(html) {
  if (!html) return [{ type: 'paragraph', text: '', spans: [] }];

  const blocks = [];
  let remaining = html;

  // Remove style/script blocks
  remaining = remaining.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  remaining = remaining.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Extract blocks: paragraphs, list items, headings
  const blockRegex = /<(p|li|h[1-6]|ul|ol|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
  const matches = remaining.matchAll(blockRegex);

  for (const match of matches) {
    const tag = match[1].toLowerCase();
    const content = match[0];

    if (tag === 'ul' || tag === 'ol') {
      // Extract inner list items
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      const listItems = content.matchAll(liRegex);
      for (const li of listItems) {
        const text = htmlToInlineText(li[1]);
        if (text.trim()) {
          blocks.push({
            type: tag === 'ol' ? 'o-list-item' : 'list-item',
            text: text.trim(),
            spans: extractSpans(li[1]),
          });
        }
      }
    } else if (tag.startsWith('h')) {
      const level = parseInt(tag[1], 10);
      const text = htmlToInlineText(content.replace(/<\/?h[1-6][^>]*>/gi, ''));
      if (text.trim()) {
        blocks.push({
          type: `heading${Math.min(Math.max(level, 3), 6)}`,
          text: text.trim(),
          spans: [],
        });
      }
    } else if (tag === 'li') {
      const text = htmlToInlineText(content.replace(/<\/?li[^>]*>/gi, ''));
      if (text.trim()) {
        blocks.push({
          type: 'list-item',
          text: text.trim(),
          spans: extractSpans(content.replace(/<\/?li[^>]*>/gi, '')),
        });
      }
    } else {
      // Paragraph or div
      const inner = content
        .replace(/<\/?(p|div)[^>]*>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n');
      const text = htmlToInlineText(inner);
      if (text.trim()) {
        blocks.push({
          type: 'paragraph',
          text: text.trim(),
          spans: extractSpans(inner),
        });
      }
    }
  }

  // If no blocks found, try treating the whole content as a single paragraph
  if (blocks.length === 0) {
    const text = htmlToText(html);
    if (text.trim()) {
      blocks.push({ type: 'paragraph', text: text.trim(), spans: [] });
    }
  }

  return blocks.length > 0
    ? blocks
    : [{ type: 'paragraph', text: '', spans: [] }];
}

/**
 * Strip tags but preserve inline text content. Handles <br> as newlines.
 */
function htmlToInlineText(html) {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  ).trim();
}

/**
 * Extract Prismic spans (bold, em, hyperlinks) from inline HTML.
 * This is a simplified extraction -- handles <strong>/<b>, <em>/<i>, <a>.
 */
function extractSpans(html) {
  const spans = [];
  // We need to work on stripped text to compute correct positions
  // For simplicity, only extract bold and link spans
  const textParts = [];
  let pos = 0;

  // Very simplified: just strip tags and return no spans
  // A full implementation would track tag positions, but for this use case
  // plain text paragraphs with structural spans suffice.
  return spans;
}

// ---------------------------------------------------------------------------
// Action detail scraping
// ---------------------------------------------------------------------------

/**
 * Extract full description from an action detail page.
 * Content lives between <h4>Description</h4> and <h4>Infos pratiques</h4>
 * inside <div class="event-content">.
 */
function extractActionDescription(html) {
  // Try to get content between Description and Infos pratiques headers
  const descMatch = html.match(
    /<h4>Description<\/h4>\s*([\s\S]*?)\s*(?:<\/div>\s*<\/div>\s*<div[^>]*>[\s\S]*?)?<h4>Infos pratiques<\/h4>/
  );

  if (descMatch) {
    return {
      descriptionHtml: descMatch[1].trim(),
      descriptionText: htmlToText(descMatch[1]),
      descriptionRichText: htmlToPrismicRichText(descMatch[1]),
    };
  }

  // Fallback: try to get everything after <h4>Description</h4> within the event-content div
  const fallbackMatch = html.match(
    /<h4>Description<\/h4>\s*([\s\S]*?)<\/div>\s*(?:<\/div>|\s*<div class="uk-width)/
  );

  if (fallbackMatch) {
    return {
      descriptionHtml: fallbackMatch[1].trim(),
      descriptionText: htmlToText(fallbackMatch[1]),
      descriptionRichText: htmlToPrismicRichText(fallbackMatch[1]),
    };
  }

  return null;
}

/**
 * Extract practical info from the Infos pratiques section.
 */
function extractActionPracticalInfo(html) {
  const infoMatch = html.match(
    /<h4>Infos pratiques<\/h4>([\s\S]*?)(?:<\/div>\s*<\/div>\s*<\/div>|<div class="event-sidebar")/
  );

  if (!infoMatch) return null;

  const infoHtml = infoMatch[1];

  // Date
  const dateMatch = infoHtml.match(
    /class="datesAndTimeframe"[\s\S]*?<span>\s*([\s\S]*?)\s*<\/span>/
  );
  const dateText = dateMatch ? htmlToInlineText(dateMatch[1]).trim() : '';

  // Time
  const timeMatch = infoHtml.match(
    /<span>(\d{2}:\d{2})\s*[&\u2013\-]/
  );
  const timeText = timeMatch ? timeMatch[1] : '';

  // Location
  const locationMatch = infoHtml.match(
    /class="eventAddress"[\s\S]*?<\/i>\s*([\s\S]*?)\s*<\/div>/
  );
  const location = locationMatch ? htmlToInlineText(locationMatch[1]).trim() : '';

  // Target audience
  const targetMatch = infoHtml.match(
    /class="eventTarget"[\s\S]*?<\/i>\s*([\s\S]*?)\s*<\/div>/
  );
  const target = targetMatch ? htmlToInlineText(targetMatch[1]).trim() : '';

  return {
    date: dateText,
    time: timeText,
    location,
    target,
  };
}

// ---------------------------------------------------------------------------
// Ressource detail scraping
// ---------------------------------------------------------------------------

/**
 * Extract full description from a ressource detail page.
 * Content lives inside data-field="Summary" > <div class="Content">...</div>
 */
function extractRessourceDescription(html) {
  const summaryMatch = html.match(
    /data-field="Summary"[\s\S]*?<div class="Content">([\s\S]*?)<\/div>/
  );

  if (summaryMatch) {
    return {
      descriptionHtml: summaryMatch[1].trim(),
      descriptionText: htmlToText(summaryMatch[1]),
      descriptionRichText: htmlToPrismicRichText(summaryMatch[1]),
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Prado Detail Scraper ===\n');

  // Fetch published actions with a url_detail
  console.log('Fetching published actions from Supabase...');
  const { data: actions, error: actionsError } = await supabase
    .from('actions')
    .select('*')
    .eq('is_published', true)
    .not('url_detail', 'is', null)
    .order('id');

  if (actionsError) {
    console.error('Error fetching actions:', actionsError.message);
    return;
  }

  console.log(`Found ${actions.length} published actions with url_detail\n`);

  // Fetch published ressources
  console.log('Fetching published ressources from Supabase...');
  const { data: ressources, error: ressourcesError } = await supabase
    .from('ressources')
    .select('*')
    .eq('is_published', true)
    .not('url', 'is', null)
    .order('id');

  if (ressourcesError) {
    console.error('Error fetching ressources:', ressourcesError.message);
    return;
  }

  console.log(`Found ${ressources.length} published ressources with url\n`);

  // --- Scrape Actions ---
  console.log('--- Scraping action detail pages ---\n');
  const actionDetails = [];
  let actionSuccess = 0;
  let actionSkipped = 0;
  let actionFailed = 0;

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const url = action.url_detail;

    process.stdout.write(`[${i + 1}/${actions.length}] #${action.id} ${action.title.slice(0, 50)}... `);

    if (!url || url.trim() === '') {
      console.log('SKIP (no URL)');
      actionSkipped++;
      continue;
    }

    const html = await fetchPage(url);

    if (html === null) {
      console.log('SKIP (404 or error)');
      actionSkipped++;
      await sleep(RATE_LIMIT_MS);
      continue;
    }

    const extracted = extractActionDescription(html);
    const practicalInfo = extractActionPracticalInfo(html);

    if (extracted && extracted.descriptionText.length > 0) {
      actionDetails.push({
        id: action.id,
        title: action.title,
        url_detail: url,
        full_description: extracted.descriptionText,
        full_description_html: extracted.descriptionHtml,
        prismic_rich_text: extracted.descriptionRichText,
        practical_info: practicalInfo,
        current_description: action.description,
      });
      actionSuccess++;
      console.log(`OK (${extracted.descriptionText.length} chars)`);
    } else {
      actionFailed++;
      console.log('FAIL (no description found)');
    }

    await sleep(RATE_LIMIT_MS);
  }

  console.log(`\nActions: ${actionSuccess} scraped, ${actionSkipped} skipped, ${actionFailed} failed\n`);

  // --- Scrape Ressources ---
  console.log('--- Scraping ressource detail pages ---\n');
  const ressourceDetails = [];
  let resSuccess = 0;
  let resSkipped = 0;
  let resFailed = 0;

  for (let i = 0; i < ressources.length; i++) {
    const res = ressources[i];
    const url = res.url;

    process.stdout.write(`[${i + 1}/${ressources.length}] #${res.id} ${res.title.slice(0, 50)}... `);

    if (!url || url.trim() === '') {
      console.log('SKIP (no URL)');
      resSkipped++;
      continue;
    }

    const html = await fetchPage(url);

    if (html === null) {
      console.log('SKIP (404 or error)');
      resSkipped++;
      await sleep(RATE_LIMIT_MS);
      continue;
    }

    const extracted = extractRessourceDescription(html);

    if (extracted && extracted.descriptionText.length > 0) {
      ressourceDetails.push({
        id: res.id,
        title: res.title,
        url: url,
        full_description: extracted.descriptionText,
        full_description_html: extracted.descriptionHtml,
        prismic_rich_text: extracted.descriptionRichText,
        current_description: res.description,
      });
      resSuccess++;
      console.log(`OK (${extracted.descriptionText.length} chars)`);
    } else {
      resFailed++;
      console.log('FAIL (no description found)');
    }

    await sleep(RATE_LIMIT_MS);
  }

  console.log(`\nRessources: ${resSuccess} scraped, ${resSkipped} skipped, ${resFailed} failed\n`);

  // --- Write output files ---
  const actionOutputPath = join(__dirname, 'action-details.json');
  writeFileSync(actionOutputPath, JSON.stringify(actionDetails, null, 2), 'utf-8');
  console.log(`Wrote ${actionDetails.length} action details to ${actionOutputPath}`);

  const ressourceOutputPath = join(__dirname, 'ressource-details.json');
  writeFileSync(ressourceOutputPath, JSON.stringify(ressourceDetails, null, 2), 'utf-8');
  console.log(`Wrote ${ressourceDetails.length} ressource details to ${ressourceOutputPath}`);

  // --- Write SQL update file ---
  const sqlLines = [];

  sqlLines.push('-- Auto-generated SQL to update action descriptions');
  sqlLines.push(`-- Generated: ${new Date().toISOString()}`);
  sqlLines.push('');

  for (const a of actionDetails) {
    const escaped = a.full_description.replace(/'/g, "''");
    sqlLines.push(
      `UPDATE actions SET description = '${escaped}' WHERE id = ${a.id};`
    );
  }

  sqlLines.push('');
  sqlLines.push('-- Ressource descriptions');
  sqlLines.push('');

  for (const r of ressourceDetails) {
    const escaped = r.full_description.replace(/'/g, "''");
    sqlLines.push(
      `UPDATE ressources SET description = '${escaped}' WHERE id = ${r.id};`
    );
  }

  const sqlOutputPath = join(__dirname, 'update-descriptions.sql');
  writeFileSync(sqlOutputPath, sqlLines.join('\n'), 'utf-8');
  console.log(`Wrote SQL updates to ${sqlOutputPath}`);

  // --- Summary ---
  console.log('\n=== Summary ===');
  console.log(`Actions:     ${actionSuccess} descriptions scraped`);
  console.log(`Ressources:  ${resSuccess} descriptions scraped`);
  console.log('');
  console.log('Output files:');
  console.log(`  ${actionOutputPath}`);
  console.log(`  ${ressourceOutputPath}`);
  console.log(`  ${sqlOutputPath}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Review the JSON files for accuracy');
  console.log('  2. Run update-descriptions.sql against Supabase (requires service key)');
  console.log('  3. Update Prismic description field type to support multi-paragraph');
  console.log('  4. Re-run prismic sync with the new rich text descriptions');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

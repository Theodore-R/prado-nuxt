/**
 * Synchronize actions and ressources between Supabase DB and the live Prado site.
 *
 * Tasks:
 *   1. Unpublish dead actions (detail page returns 404 on Prado)
 *   2. Unpublish dead ressources (detail page returns 404 on Prado)
 *   3. Scrape and insert missing actions from Prado
 *   4. Scrape and insert missing ressources from Prado
 *
 * Usage:  node scripts/sync-prado.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SUPABASE_URL = 'https://vafbtwbsxdlefksonpyg.supabase.co';
// Requires the service_role key to bypass RLS policies for write operations.
// Pass via env: SUPABASE_SERVICE_KEY=xxx node scripts/sync-prado.mjs
// Falls back to the anon key (read-only, writes will fail due to RLS).
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZmJ0d2JzeGRsZWZrc29ucHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTEyMTYsImV4cCI6MjA4OTg2NzIxNn0.56cOAQq5jAAorhi5UYSN3RKNpjmd0j62fvGlTlSWcmY';

const PRADO_BASE = 'https://itineraires.le-prado.fr';
const RATE_LIMIT_MS = 500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------------------------------------------------
// Dead IDs
// ---------------------------------------------------------------------------

const DEAD_ACTION_IDS = [
  14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 32, 33, 34,
  35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 52, 53, 62, 63, 64, 65, 66,
  67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84,
  85, 86, 87, 88, 89, 90,
];

const DEAD_RESSOURCE_IDS = [
  15, 17, 18, 19, 20, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
  37, 38, 42, 43, 44, 45, 50, 55, 74, 76, 77, 78, 79, 82, 83, 84, 85, 86,
  87, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 105, 106, 107, 108,
  109, 110, 111, 112, 113, 114, 115, 128, 142, 143, 144, 145, 147, 148, 149,
  150, 151, 152, 153, 154, 155, 156, 158, 159, 162, 163, 164, 165, 166, 167,
  168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182,
  183,
];

// ---------------------------------------------------------------------------
// Missing action URLs (64)
// ---------------------------------------------------------------------------

const MISSING_ACTION_URLS = [
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/cine-debat-protection-de-lenfance-je-vais-te-tuer',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/vrai-du-faux-jeu-danalyse-des-medias-4',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/portes-ouvertes-troubles-psychiques',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/la-fresque-de-la-protection-de-lenfance-1',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/pro-dun-jour-visite-les-metiers-de-lusinage',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parenthese-nature-3',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/visite-epide-meyzieu-special-filles',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/quel-pilote-es-tu-tous-en-voiture-8',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/visite-structure-dinsertion-2',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/pro-dun-jour-visite-les-metiers-de-la-culture-et-de-la-creation',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/entre-vues-invitation-contemporaine',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/webinaire-coffre-fort-numerique-reconnect-1',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/mediation-animale-equi-defi-2',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parenthese-nature-5',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parenthese-nature-6',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parenthese-nature-7',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/quel-pilote-es-tu-tous-en-voiture-9',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/smartphone-show',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parenthese-nature-8',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/mediation-animale-equi-defi-3',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parenthese-nature-9',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/entre-vues',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/passer-son-permis-de-conduire',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/formation-code-de-la-route-et-permis-b',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/droits-devant-le-coffre-fort-numerique',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parcours-de-remobilisation-par-lartisanat',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/formation-au-certificat-daptitude-a-la-conduite-en-securite-caces',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/participe-a-une-aventure-collective',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/decouvre-la-menuiserie-et-finance-ton-projet',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/immersion-pro-dun-jour',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/preparer-un-entretien-dembauche',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/fresque-de-la-sante-mentale',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/droits-devant-lescape-game-de-lautonomie-1',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/frise-de-la-vie-active-1',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/mediation-animale-au-contact-des-chiens-en-groupe-2',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/en-mode-beau-gosse-travailler-lestime-de-soi',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/heindependant-jeu-sur-les-addictions-en-groupe',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/ecrans-la-quete-du-numerique-en-groupe',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parcours-remobilisation-par-la-transition-ecologique',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/vrai-du-faux-jeu-danalyse-des-medias-en-groupe',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/vie-affective-et-sexuelle-latelier-sans-tabou',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/mediation-animale-comment-chat-va-toi-3',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/quel-pilote-es-tu-tous-en-voiture',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/gestion-de-conflits-communication-non-violente-en-groupe',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/benevolat',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/cine-debat-4',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parenthese-nature-1',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/les-cles-de-chez-moi-bricolage-groupe',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/cuisine-petit-budget-groupe',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/formation-generation-alpha-des-besoins-et-leviers-daccompagnement-specifiques',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/formation-gratuite-prostitution-des-mineurs',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/mediation-animale-equi-defi',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parenthese-nature-10',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/visite-structure-dinsertion-4',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parenthese-nature-11',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/mediation-animale-equi-defi-4',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parenthese-nature-12',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parenthese-nature-4',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parenthese-nature-13',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/visite-structure-dinsertion-5',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/parenthese-nature-14',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/mediation-animale-equi-defi-5',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/semaine-de-linsertion',
  'https://itineraires.le-prado.fr/programmation/tous-les-evenements/detail/visite-structure-dinsertion-7',
];

// ---------------------------------------------------------------------------
// Missing ressource URLs (100) -- discovered by diffing Prado listing with DB
// ---------------------------------------------------------------------------

const MISSING_RESSOURCE_URLS = [
  '/ressources/toutes-les-ressources/detail/a-lire-accompagner-les-sorties-des-dispositifs-de-prise-en-charge',
  '/ressources/toutes-les-ressources/detail/a-lire-etude-dinsertion-des-16-19-ans-region-aura',
  '/ressources/toutes-les-ressources/detail/acceder-a-un-contrat-dinsertion-par-lactivite-economique',
  '/ressources/toutes-les-ressources/detail/acces-aux-clubs-sportifs-avec-entourage-sport',
  '/ressources/toutes-les-ressources/detail/acces-et-formation-au-numerique',
  '/ressources/toutes-les-ressources/detail/accompagnement-a-la-mobilite-dmi',
  '/ressources/toutes-les-ressources/detail/accompagnement-a-lentrepreunariat-louvre-boite',
  '/ressources/toutes-les-ressources/detail/accompagnement-dossier-mdmph-actifh',
  '/ressources/toutes-les-ressources/detail/accompagnement-intensif-des-jeunes-aij',
  '/ressources/toutes-les-ressources/detail/accompagnement-sur-les-addictions-consultations-jeunes-consommateurs',
  '/ressources/toutes-les-ressources/detail/accueil-de-jour-majeur-peniche-daccueil-le-mas',
  '/ressources/toutes-les-ressources/detail/action-logement-aides-au-logement',
  '/ressources/toutes-les-ressources/detail/afute-formations-professionnelles-pour-jeunes-en-situation-de-handicap-mental-etou-cognitif',
  '/ressources/toutes-les-ressources/detail/aide-au-logement-pour-interimaires-fastt',
  '/ressources/toutes-les-ressources/detail/aide-regionale-beneficier-de-laccompagnement-h-formation',
  '/ressources/toutes-les-ressources/detail/aide-regionale-logement-de-formation',
  '/ressources/toutes-les-ressources/detail/aides-financieres-pour-le-logement',
  '/ressources/toutes-les-ressources/detail/ateliers-du-present-remobilisation-par-lart',
  '/ressources/toutes-les-ressources/detail/autoecole-sociale-mob-and-go',
  '/ressources/toutes-les-ressources/detail/boost-insertion-passeport-pour-agir-apprentis-dauteuil',
  '/ressources/toutes-les-ressources/detail/boutique-de-lentraide',
  '/ressources/toutes-les-ressources/detail/budget-responsible-plateforme-deducation-budgetaire',
  '/ressources/toutes-les-ressources/detail/caf-simplification-obtention-allocations',
  '/ressources/toutes-les-ressources/detail/centres-daccueil-et-daccompagnement-a-la-reduction-de-risques-pour-usagers-de-drogues',
  '/ressources/toutes-les-ressources/detail/centres-de-soins-daccompagnement-et-de-prevention-en-addictologie',
  '/ressources/toutes-les-ressources/detail/cheque-energie-une-aide-pour-payer-les-factures-denergie-de-son-logement',
  '/ressources/toutes-les-ressources/detail/clubhouse-lieu-de-retablissement',
  '/ressources/toutes-les-ressources/detail/contrat-engagement-jeune-cej',
  '/ressources/toutes-les-ressources/detail/cses-parlons-vie-affective-et-sexualite',
  '/ressources/toutes-les-ressources/detail/danse-inclusive-et-adaptee-ateliers-hebdos',
  '/ressources/toutes-les-ressources/detail/de-laide-juridique-contre-la-discrimination',
  '/ressources/toutes-les-ressources/detail/demarche-h-formation',
  '/ressources/toutes-les-ressources/detail/depistage-ist-gratuit-sans-ordonnance-pour-les-de-26-ans',
  '/ressources/toutes-les-ressources/detail/des-preservatifs-gratuits-pour-les-de-26-ans',
  '/ressources/toutes-les-ressources/detail/dispositif-sesame-formateur-sportif',
  '/ressources/toutes-les-ressources/detail/droits-devant-le-livret-des-droits-et-demarches',
  '/ressources/toutes-les-ressources/detail/droits-devant-les-lieux-ressources-pour-taider',
  '/ressources/toutes-les-ressources/detail/duo-for-a-job-mentorat-intergenerationnel-et-interculturel',
  '/ressources/toutes-les-ressources/detail/enquete-a-lecole-du-changement',
  '/ressources/toutes-les-ressources/detail/entourage-pro-reseau-pro-et-coaching',
  '/ressources/toutes-les-ressources/detail/entrer-dans-le-monde-du-travail-declarez-moi',
  '/ressources/toutes-les-ressources/detail/epide-accompagnement-intensif',
  '/ressources/toutes-les-ressources/detail/equipe-mobile-dappui-a-la-protection-de-lenfance-emape-avec-repit-double-accompagnement-handicap-ase',
  '/ressources/toutes-les-ressources/detail/equipe-mobile-sante-mentale-13-18-ans-mouvados',
  '/ressources/toutes-les-ressources/detail/espace-sport-sante-gratuit-sur-ordonnance',
  '/ressources/toutes-les-ressources/detail/examen-de-prevention-en-sante-eps',
  '/ressources/toutes-les-ressources/detail/financer-son-bafa',
  '/ressources/toutes-les-ressources/detail/formation-agent-de-maintenance-specialite-tourisme',
  '/ressources/toutes-les-ressources/detail/formation-btp',
  '/ressources/toutes-les-ressources/detail/formation-integracode-formation-code-pour-allophone',
  '/ressources/toutes-les-ressources/detail/formation-premiers-secours-en-sante-mentale-jeunes-pssm',
  '/ressources/toutes-les-ressources/detail/fracture-numerique-des-ordinateurs-pour-les-jeunes',
  '/ressources/toutes-les-ressources/detail/guide-cpam-accompagnement-sante-jeunes',
  '/ressources/toutes-les-ressources/detail/guide-de-lurgence-sociale',
  '/ressources/toutes-les-ressources/detail/guide-des-droits-sociaux',
  '/ressources/toutes-les-ressources/detail/guide-les-droits-des-jeunes-en-danger-isolees',
  '/ressources/toutes-les-ressources/detail/guide-usage-du-numerique',
  '/ressources/toutes-les-ressources/detail/hello-bus-animation-sante-gratuite',
  '/ressources/toutes-les-ressources/detail/itinerance-jeunes-communaute-gens-du-voyage-artag',
  '/ressources/toutes-les-ressources/detail/jeunes-sans-abris-maraude-jeunes',
  '/ressources/toutes-les-ressources/detail/la-boussole-des-jeunes',
  '/ressources/toutes-les-ressources/detail/la-boussole-des-metiers',
  '/ressources/toutes-les-ressources/detail/la-plateforme-de-linclusion',
  '/ressources/toutes-les-ressources/detail/la-touline-soutien-aux-sortants-de-laide-sociale-a-lenfance',
  '/ressources/toutes-les-ressources/detail/lab-lumiere-relations-parents-jeunes',
  '/ressources/toutes-les-ressources/detail/laccueil-specifique-des-mna-et-ex-mna-cr-reseau-ressources',
  '/ressources/toutes-les-ressources/detail/ladapt-un-accompagnement-personnalise-vers-un-emploi-adapte',
  '/ressources/toutes-les-ressources/detail/le-wassap-du-benevolat',
  '/ressources/toutes-les-ressources/detail/linsertion-par-le-sport-kabubu',
  '/ressources/toutes-les-ressources/detail/maison-metropolitaine-dinsertion-pour-lemploi',
  '/ressources/toutes-les-ressources/detail/mallette-pedagogique-sur-la-prostitution-de-mineur',
  '/ressources/toutes-les-ressources/detail/metemploi-la-plateforme-de-la-metropole-de-lyon-pour-lacces-a-lemploi',
  '/ressources/toutes-les-ressources/detail/meubler-son-chez-soi-a-petits-prix-les-meilleurs-sites',
  '/ressources/toutes-les-ressources/detail/obligation-de-formation-les-outils-de-la-region',
  '/ressources/toutes-les-ressources/detail/offres-solidaires-telephonie-internet',
  '/ressources/toutes-les-ressources/detail/oree-ajd-hebergement',
  '/ressources/toutes-les-ressources/detail/parcours-emploi-competences',
  '/ressources/toutes-les-ressources/detail/parcours-medico-administratif-transidentite',
  '/ressources/toutes-les-ressources/detail/pass-iae-comment-ca-marche',
  '/ressources/toutes-les-ressources/detail/pass-region-des-avantages-pour-les-jeunes',
  '/ressources/toutes-les-ressources/detail/preparer-son-insertion-la-b-ase-la-plateforme-pour-trouver-de-laide-pres-de-chez-soi',
  '/ressources/toutes-les-ressources/detail/projet-metropolitain-des-solidarites',
  '/ressources/toutes-les-ressources/detail/promo-16-18',
  '/ressources/toutes-les-ressources/detail/prostitution-se-faire-accompagner',
  '/ressources/toutes-les-ressources/detail/psycom-informer-et-sensibiliser-sur-la-sante-mentale',
  '/ressources/toutes-les-ressources/detail/repere-metiers-la-plateforme-qui-favorise-la-decouverte-metier',
  '/ressources/toutes-les-ressources/detail/reseau-et-accompagnement-infos-jeune',
  '/ressources/toutes-les-ressources/detail/reseaux-sociaux-jeu-de-prevention-h-social',
  '/ressources/toutes-les-ressources/detail/sante-mentale-jeu-tombe-pas-a-plat',
  '/ressources/toutes-les-ressources/detail/sante-mentale-les-lieux-ressources',
  '/ressources/toutes-les-ressources/detail/service-logement-mission-locale-venissieux',
  '/ressources/toutes-les-ressources/detail/support-sante-mentale-cosmos-mental-psycom',
  '/ressources/toutes-les-ressources/detail/trouver-son-ikigai-donner-du-sens-a-sa-vie',
  '/ressources/toutes-les-ressources/detail/un-toit-pour-toi-rhone',
  '/ressources/toutes-les-ressources/detail/un-toit-un-job-1',
  '/ressources/toutes-les-ressources/detail/unis-cite-le-service-civique',
  '/ressources/toutes-les-ressources/detail/velo-egaux-apprendre-et-acceder-a-un-velo',
  '/ressources/toutes-les-ressources/detail/viacompetences-actualite-de-lorientation-la-formation-lemploi',
  '/ressources/toutes-les-ressources/detail/wake-up-cafe-une-reinsertion-durable',
  '/ressources/toutes-les-ressources/detail/wetechcare-des-outils-pour-favoriser-linclusion-numerique-des-jeunes',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pause for a given number of milliseconds. */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetch a URL with retry logic and rate limiting. */
async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) PradoSync/1.0',
        },
        redirect: 'follow',
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return await res.text();
    } catch (err) {
      if (attempt === retries) {
        throw err;
      }
      console.log(
        `  [retry ${attempt}/${retries}] ${err.message} -- waiting 2s`,
      );
      await sleep(2000);
    }
  }
}

/** Download binary content (image) and save to disk. */
async function downloadImage(imageUrl, destPath) {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) PradoSync/1.0',
      },
      redirect: 'follow',
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const dir = dirname(destPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(destPath, buffer);
    return true;
  } catch (err) {
    console.log(`    [image download failed] ${err.message}`);
    return false;
  }
}

/** Strip HTML tags and decode common HTML entities. */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Get file extension from a URL or content-type. */
function getExtFromUrl(url) {
  const match = url.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i);
  return match ? match[1].toLowerCase() : 'png';
}

// ---------------------------------------------------------------------------
// Scraping: Action detail page
// ---------------------------------------------------------------------------

/**
 * Parse an action detail page from itineraires.le-prado.fr.
 *
 * Structure observed:
 *   - og:title          => title
 *   - og:image          => image URL (high-res cropboxed version)
 *   - og:description    => starts with "DD/MM/YYYY HH:MM //" (date + time)
 *   - <!-- <div class="Category">XXX</div> --> => category
 *   - <img ... class="event-image" />  => image (original)
 *   - <h2 ...>TITLE</h2>  inside event-title div
 *   - datesAndTimeframe section => human-readable date/time
 *   - class="event-content" => full description
 */
function parseActionPage(html, url) {
  // Title from og:title
  const ogTitleMatch = html.match(
    /<meta\s+property="og:title"\s+content="([^"]*)"/,
  );
  const title = ogTitleMatch ? stripHtml(ogTitleMatch[1]) : '';

  // Image from og:image (high-res)
  const ogImageMatch = html.match(
    /<meta\s+property="og:image"\s+content="([^"]*)"/,
  );
  let imageUrl = ogImageMatch ? ogImageMatch[1] : '';

  // Also try to get the original (non-cropped) image from event-image
  const eventImgMatch = html.match(
    /<img\s+src="([^"]*)"[^>]*class="event-image"/,
  );
  if (eventImgMatch) {
    const src = eventImgMatch[1];
    imageUrl = src.startsWith('http') ? src : PRADO_BASE + src;
  }

  // Category from commented-out div
  const categoryMatch = html.match(
    /<!--\s*<div class="Category">([^<]*)<\/div>\s*-->/,
  );
  const category = categoryMatch ? stripHtml(categoryMatch[1]) : '';

  // Date and time from og:description (pattern: "DD/MM/YYYY HH:MM //")
  const ogDescMatch = html.match(
    /<meta\s+property="og:description"\s+content="([^"]*)"/,
  );
  const ogDesc = ogDescMatch ? ogDescMatch[1] : '';

  let date = '';
  let time = '';
  const dateTimeMatch = ogDesc.match(
    /(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})/,
  );
  if (dateTimeMatch) {
    date = dateTimeMatch[1];
    time = dateTimeMatch[2];
  } else {
    // Try from datesAndTimeframe section
    const dateFrameMatch = html.match(
      /class="datesAndTimeframe"[\s\S]*?<span>\s*([\s\S]*?)<\/span>/,
    );
    if (dateFrameMatch) {
      const rawDate = stripHtml(dateFrameMatch[1]);
      // Try to extract DD/MM/YYYY from French date like "Lu 13 Avril 2026"
      const frenchMatch = rawDate.match(
        /(\d{1,2})\s+(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre|F.vrier|Ao.t)\s+(\d{4})/i,
      );
      if (frenchMatch) {
        const months = {
          janvier: '01', fevrier: '02', mars: '03', avril: '04', mai: '05',
          juin: '06', juillet: '07', aout: '08', septembre: '09',
          octobre: '10', novembre: '11', decembre: '12',
        };
        const monthKey = frenchMatch[2]
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const mm = months[monthKey] || '01';
        date = `${frenchMatch[1].padStart(2, '0')}/${mm}/${frenchMatch[3]}`;
      } else {
        date = rawDate;
      }
    }

    // Time from datesAndTimeframe
    const timeMatch = html.match(
      /class="datesAndTimeframe"[\s\S]*?<span>(\d{2}:\d{2})\s*[&\-]/,
    );
    if (timeMatch) {
      time = timeMatch[1];
    }
  }

  // Full description from event-content
  const contentMatch = html.match(
    /class="event-content"[\s\S]*?<h4>Description<\/h4>\s*([\s\S]*?)(?:<\/div>\s*<\/div>\s*<div class="uk-width-medium-1-3"|<div class="uk-width-medium-1-3")/,
  );
  const description = contentMatch ? stripHtml(contentMatch[1]) : '';

  // Summary: first ~200 chars of description
  const summary =
    description.length > 200
      ? description.slice(0, 197) + '...'
      : description;

  // Determine is_activite: has a specific date (not "toute l'annee")
  const hasSpecificDate = /\d{2}\/\d{2}\/\d{4}/.test(date);
  const isActivite = hasSpecificDate;

  return {
    title,
    category,
    date: date || "Toute l'annee",
    time,
    summary,
    description,
    url_detail: url,
    url_image: imageUrl,
    is_activite: isActivite,
    is_published: true,
  };
}

// ---------------------------------------------------------------------------
// Scraping: Ressource detail page
// ---------------------------------------------------------------------------

/**
 * Parse a ressource detail page.
 *
 * Structure observed:
 *   - <h1>Title</h1> inside data-field="Title" block
 *   - data-field="Summary" => description
 *   - data-field="Image" => image
 *   - Category from sidebar link (active/current)
 *   - sidebar category links under /ressources/CATEGORY/
 */
function parseRessourcePage(html, url) {
  // Title from h1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const title = h1Match ? stripHtml(h1Match[1]) : '';

  // Description from data-field="Summary" section
  const summaryMatch = html.match(
    /data-field="Summary"[\s\S]*?<div class="Content">([\s\S]*?)<\/div>\s*(?:<\/div>)/,
  );
  const description = summaryMatch ? stripHtml(summaryMatch[1]) : '';

  // Image from data-field="Image" section
  const imgFieldMatch = html.match(
    /data-field="Image"[\s\S]*?<img\s+src="([^"]*)"/,
  );
  let imageUrl = '';
  if (imgFieldMatch) {
    const src = imgFieldMatch[1];
    imageUrl = src.startsWith('http') ? src : PRADO_BASE + src;
  }

  // Category from sidebar -- look for active category link
  // The sidebar has links like /ressources/logement-mobilite/ with category names
  let category = '';
  // Look for the category name in sidebar links
  const catLinks = html.matchAll(
    /href="\/ressources\/[^"]*\/"[^>]*>\s*<span>\s*([\s\S]*?)\s*<\/span>/g,
  );
  for (const m of catLinks) {
    const catName = stripHtml(m[1]);
    if (catName && catName !== 'Toutes les ressources' && catName.length < 60) {
      // If the page URL path contains a category hint, try to match
      // Otherwise take the first relevant category
      if (!category) {
        category = catName;
      }
    }
  }

  // Better approach: check the page body class or the URL structure for category
  // Actually, look at which sidebar link is "current" or "active"
  const activeMatch = html.match(
    /class="[^"]*(?:current|active|section)[^"]*"[^>]*>\s*<a\s+href="\/ressources\/[^"]*\/"[^>]*>\s*<span>\s*([\s\S]*?)\s*<\/span>/,
  );
  if (activeMatch) {
    category = stripHtml(activeMatch[1]);
  }

  // Fallback: try to detect category from first sidebar link that is highlighted
  if (!category) {
    const allCatMatch = html.match(
      /<a\s+href="\/ressources\/(?!toutes)[^"]*\/"[^>]*>\s*<span>\s*([\s\S]*?)\s*<\/span>/,
    );
    if (allCatMatch) {
      category = stripHtml(allCatMatch[1]);
    }
  }

  return {
    title,
    category,
    description,
    url: PRADO_BASE + (url.startsWith('/') ? url : '/' + url),
    image: imageUrl,
    is_published: true,
  };
}

// ---------------------------------------------------------------------------
// Task 1: Unpublish dead actions
// ---------------------------------------------------------------------------

async function task1_unpublishDeadActions() {
  console.log('\n========================================');
  console.log('TASK 1: Unpublish dead actions');
  console.log('========================================');
  console.log(`Setting is_published=false for ${DEAD_ACTION_IDS.length} action IDs...`);

  const { data, error } = await supabase
    .from('actions')
    .update({ is_published: false })
    .in('id', DEAD_ACTION_IDS)
    .select('id');

  if (error) {
    console.error('  ERROR:', error.message);
    return;
  }

  console.log(`  Updated ${data?.length ?? 0} actions.`);
}

// ---------------------------------------------------------------------------
// Task 2: Unpublish dead ressources
// ---------------------------------------------------------------------------

async function task2_unpublishDeadRessources() {
  console.log('\n========================================');
  console.log('TASK 2: Unpublish dead ressources');
  console.log('========================================');
  console.log(
    `Setting is_published=false for ${DEAD_RESSOURCE_IDS.length} ressource IDs...`,
  );

  const { data, error } = await supabase
    .from('ressources')
    .update({ is_published: false })
    .in('id', DEAD_RESSOURCE_IDS)
    .select('id');

  if (error) {
    console.error('  ERROR:', error.message);
    return;
  }

  console.log(`  Updated ${data?.length ?? 0} ressources.`);
}

// ---------------------------------------------------------------------------
// Task 3: Scrape and add missing actions
// ---------------------------------------------------------------------------

async function task3_scrapeAndInsertActions() {
  console.log('\n========================================');
  console.log('TASK 3: Scrape and insert missing actions');
  console.log('========================================');
  console.log(`Processing ${MISSING_ACTION_URLS.length} action URLs...\n`);

  const actionsImgDir = join(PROJECT_ROOT, 'public', 'images', 'actions');
  if (!existsSync(actionsImgDir)) {
    mkdirSync(actionsImgDir, { recursive: true });
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < MISSING_ACTION_URLS.length; i++) {
    const url = MISSING_ACTION_URLS[i];
    const slug = url.split('/detail/')[1] || url;
    console.log(`  [${i + 1}/${MISSING_ACTION_URLS.length}] ${slug}`);

    try {
      const html = await fetchWithRetry(url);
      const parsed = parseActionPage(html, url);

      if (!parsed.title) {
        console.log('    SKIP: No title found');
        failCount++;
        continue;
      }

      console.log(`    Title: ${parsed.title}`);
      console.log(`    Category: ${parsed.category || '(none)'}`);
      console.log(`    Date: ${parsed.date} ${parsed.time}`);
      console.log(`    is_activite: ${parsed.is_activite}`);

      // Insert into Supabase
      const { data: inserted, error: insertErr } = await supabase
        .from('actions')
        .insert({
          title: parsed.title,
          category: parsed.category,
          date: parsed.date,
          time: parsed.time,
          summary: parsed.summary,
          description: parsed.description,
          url_detail: parsed.url_detail,
          url_image: parsed.url_image,
          is_activite: parsed.is_activite,
          is_published: true,
        })
        .select('id')
        .single();

      if (insertErr) {
        console.log(`    INSERT ERROR: ${insertErr.message}`);
        failCount++;
      } else {
        const newId = inserted.id;
        console.log(`    Inserted with ID: ${newId}`);

        // Download image
        if (parsed.url_image) {
          const ext = getExtFromUrl(parsed.url_image);
          const imgPath = join(actionsImgDir, `${newId}.${ext}`);
          const ok = await downloadImage(parsed.url_image, imgPath);
          if (ok) {
            console.log(`    Image saved: ${newId}.${ext}`);
          }
        }

        successCount++;
      }
    } catch (err) {
      console.log(`    FETCH ERROR: ${err.message}`);
      failCount++;
    }

    await sleep(RATE_LIMIT_MS);
  }

  console.log(
    `\n  Actions: ${successCount} inserted, ${failCount} failed.\n`,
  );
}

// ---------------------------------------------------------------------------
// Task 4: Scrape and add missing ressources
// ---------------------------------------------------------------------------

async function task4_scrapeAndInsertRessources() {
  console.log('\n========================================');
  console.log('TASK 4: Scrape and insert missing ressources');
  console.log('========================================');
  console.log(
    `Processing ${MISSING_RESSOURCE_URLS.length} ressource URLs...\n`,
  );

  const ressourcesImgDir = join(
    PROJECT_ROOT,
    'public',
    'images',
    'ressources',
  );
  if (!existsSync(ressourcesImgDir)) {
    mkdirSync(ressourcesImgDir, { recursive: true });
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < MISSING_RESSOURCE_URLS.length; i++) {
    const relUrl = MISSING_RESSOURCE_URLS[i];
    const fullUrl = PRADO_BASE + relUrl;
    const slug = relUrl.split('/detail/')[1] || relUrl;
    console.log(`  [${i + 1}/${MISSING_RESSOURCE_URLS.length}] ${slug}`);

    try {
      const html = await fetchWithRetry(fullUrl);
      const parsed = parseRessourcePage(html, relUrl);

      if (!parsed.title) {
        console.log('    SKIP: No title found');
        failCount++;
        continue;
      }

      console.log(`    Title: ${parsed.title}`);
      console.log(`    Category: ${parsed.category || '(none)'}`);

      // Insert into Supabase
      const { data: inserted, error: insertErr } = await supabase
        .from('ressources')
        .insert({
          title: parsed.title,
          category: parsed.category,
          description: parsed.description,
          url: parsed.url,
          image: parsed.image,
          is_published: true,
        })
        .select('id')
        .single();

      if (insertErr) {
        console.log(`    INSERT ERROR: ${insertErr.message}`);
        failCount++;
      } else {
        const newId = inserted.id;
        console.log(`    Inserted with ID: ${newId}`);

        // Download image
        if (parsed.image) {
          const ext = getExtFromUrl(parsed.image);
          const imgPath = join(ressourcesImgDir, `${newId}.${ext}`);
          const ok = await downloadImage(parsed.image, imgPath);
          if (ok) {
            console.log(`    Image saved: ${newId}.${ext}`);
          }
        }

        successCount++;
      }
    } catch (err) {
      console.log(`    FETCH ERROR: ${err.message}`);
      failCount++;
    }

    await sleep(RATE_LIMIT_MS);
  }

  console.log(
    `\n  Ressources: ${successCount} inserted, ${failCount} failed.\n`,
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('==============================================');
  console.log('  Prado Sync Script');
  console.log('  ' + new Date().toISOString());
  console.log('==============================================');

  await task1_unpublishDeadActions();
  await task2_unpublishDeadRessources();
  await task3_scrapeAndInsertActions();
  await task4_scrapeAndInsertRessources();

  console.log('\n==============================================');
  console.log('  Sync complete!');
  console.log('==============================================\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

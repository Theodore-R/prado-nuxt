---
type: source
updated: 2026-04-17
source: ../../devis-prado-itineraires.md
---

# Source — Devis v2.0 (2 avril 2026)

**Document** : `devis-prado-itineraires.md`
**Référence** : DEV-2026-PRADO-002
**Validité** : 30 jours à compter du 2 avril 2026
**Date** : 2 avril 2026

## Statut : source de vérité coût

Version **2.0** intégrant les retours client + chiffrage demandé dans l'[[sources/echange-client-2026-04-01|email client du 1 avril]] (« pouvez-vous traduire le temps dédié en coût effectif »).

## Montant total

- **36,5 jours** · **21 900 € HT**

## Répartition en 7 lots

| # | Lot | Charge | Coût |
|---|---|---|---|
| 1 | Site vitrine & contenu éditorial | 8,5 j | 5 100 € |
| 2 | SEO & documents | 1 j | 600 € |
| 3 | Authentification & gestion des comptes — [[concepts/auth-flow]] | 4 j | 2 400 € |
| 4 | Espace prescripteur | 10 j | 6 000 € |
| 5 | Panel d'administration — [[entities/utilisateurs]] | 10 j | 6 000 € |
| 6 | Emails & automatisations — [[concepts/emails-automatiques]] | 2 j | 1 200 € |
| 7 | Hébergement & mise en production — [[concepts/deploiement]] | 1 j | 600 € |

## Modalités de paiement

- **Acompte** à la signature : 30 % · **6 570 €**
- **Situation** à mi-parcours : 30 % · **6 570 €**
- **Solde** à la livraison : 40 % · **8 760 €**

## Options (non chiffrées dans le total)

| Option | Détail | Coût |
|---|---|---|
| **A — CMS & blog Prismic** | Intégration + homepage éditable + blog + formation 1h | 3 j / 1 800 € |
| **B — Tracking & analytics** | GA4 + Clarity + dashboard analytics admin | 1,5 j / 900 € |
| **C — Maintenance** | *Forfait mensuel* : 2 j/mois à 500 €/j = **1 000 €/mois** · *À la demande* : 600 €/j | mensuel |
| **D — Cession code source** | Dépôt Git complet + doc + licence | **5 000 €** |

## À la charge du client (hors devis)

- Nom de domaine (sous-domaine du Prado, déjà existant → 0 €).
- Hébergement Vercel — compte client.
- Base de données Supabase — compte client.
- + Prismic / Cloudflare / Resend / Mailchimp — tous au nom du client.

## Points saillants

- Devis **aligné avec [[sources/cahier-des-charges-v2|cahier des charges v2]]** — tous les modules CDC (budget, émargement, récurrence, rapport PDF, stats complets, émargement, inscription groupée) sont chiffrés dans les lots 4 et 5.
- **Pas de ligne pour Veriff**, **pas de ligne pour fiche santé** — retirés du scope.
- **Pas de ligne pour prestation RGPD dédiée** — retirée au profit du dispositif mutualisé Fondation.
- Devis à **valider par le client** lors/après la visio programmée.

## Voir aussi

- [[concepts/couts-recurrents]] — les coûts récurrents à la charge du client (hors devis).
- [[client-docs/index-client-docs]] — index de tous les artefacts client vivants.

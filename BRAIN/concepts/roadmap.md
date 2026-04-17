---
type: concept
updated: 2026-04-17
---

# Roadmap V2+

Évolutions envisagées au-delà de la V1, **non contractualisées** dans le devis actuel.

## Court terme (post-livraison V1)

| Feature | Priorité | Description |
|---|---|---|
| Vérification d'identité | 🟡 Moyenne | Veriff (~1 €/vérif) ou France Identité (gratuit). Module indépendant, ~2 j dev |
| Notifications in-app | 🟡 Moyenne | Alertes temps réel dans l'interface (nouvelle action, validation, etc.) |
| Statistiques avancées | 🟡 Moyenne | Graphiques et rapports supplémentaires (inscriptions par période, taux de remplissage) |
| Réassignation de jeunes | 🟡 Moyenne | Transférer un jeune d'un organisme à un autre (éducateur qui change de structure) |

## Moyen terme

| Feature | Priorité | Description |
|---|---|---|
| Cartographie interactive | 🟢 Basse | Carte des actions géolocalisées |
| PWA mobile | 🟢 Basse | Version installable sur téléphone |

## Évolutions spéculatives

- **Attestation de participation PDF** (pour le jeune, souvent demandée ASE/PJJ). Question #19 de la prép visio.
- **Autorisation parentale dématérialisée** (upload ou signature). Question #18 — pour le moment, juste checkbox attestation prescripteur.
- **Intégration FranceConnect** mentionnée dans la PRD originelle — probablement pas prioritaire.

## Ce qui ne bougera pas V1 → V2

- Stack technique (Nuxt/Supabase/Prismic).
- Modèle organisme / isolation RLS.
- Design system (une fois la charte Fondation finalisée).

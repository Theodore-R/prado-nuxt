---
type: concept
updated: 2026-04-17
---

# RGPD & conformité

Approche : **mesures techniques intégrées** à la plateforme + **dispositif mutualisé** côté Fondation du Prado pour l'accompagnement juridique/DPO.

## Ce qui est intégré à la plateforme

| Mesure | Détail | Base RGPD |
|---|---|---|
| Bandeau cookies | Accepter / refuser, choix mémorisé | Art. 7 Consentement |
| Politique de confidentialité | Page dédiée détaillant traitements | Art. 13 Information |
| Droit à l'effacement | Suppression du compte + données depuis `/parametres` | Art. 17 |
| Droit à la portabilité | Export des données personnelles du prescripteur | Art. 20 |
| Newsletter double opt-in | Confirmation par email avec token | Art. 7 Consentement |
| Durée de conservation | Suppression à la clôture du compte (à préciser) | Art. 5.1.e |
| Minimisation | Seules les données nécessaires collectées | Art. 5.1.c |

## Ce qui a été retiré du scope V1 (économie)

- **Prestation RGPD dédiée** — retirée à la demande client (1 avril 2026) : Prado bénéficie d'un dispositif mutualisé (Fondation).
- **Fiche santé** et **fiche situation familiale** — retirées. Pas de données de santé collectées → **pas de besoin d'hébergement HDS**. Voir [[concepts/hds-historique]].
- **Vérification d'identité** (Veriff) — reportée en V2. Pas d'enjeu RGPD immédiat.

## Ce qui reste à faire / préciser

- **Durée de conservation** exacte des données d'un jeune après clôture du compte ou fin d'accompagnement — à définir avec le DPO mutualisé Prado (question n°22 de la prép visio).
- **Accessibilité RGAA** — si l'association reçoit des fonds publics (ce qui semble être le cas : Métropole, Département…), obligation légale. À mentionner dans le CDC et à viser niveau AA idéalement (question n°23).

## Données traitées

- **Prescripteurs** — identité pro, email, structure, téléphone.
- **Jeunes** — prénom, nom, date de naissance, sexe, code postal, QPV, situation, type d'accompagnement, notes prescripteur. **Mineurs concernés** (11–25 ans inclut les mineurs), donc attention renforcée.
- **Accompagnateurs / personnes d'urgence** — nom et téléphone collectés à l'inscription.
- **Newsletter** — email + structure + token de confirmation.

## Hébergement et territoire

Toutes les données personnelles restent en **Europe** :
- Supabase EU (Postgres + Auth)
- Prismic EU
- Resend EU
- Microsoft Clarity EU
- Vercel — réseau mondial mais point d'entrée EU pour le trafic européen

## Voir aussi

- [[concepts/rls-isolation]] — isolation technique des données par organisme.
- [[concepts/hds-historique]] — pourquoi on n'a plus besoin d'HDS.

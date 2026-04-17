---
type: concept
updated: 2026-04-17
---

# Inscription d'un jeune à une action

Parcours cœur de l'espace prescripteur.

## Étapes

1. Prescripteur parcourt le **catalogue** depuis son dashboard → sélectionne une action.
2. Choix du/des jeune(s) à inscrire (**inscription groupée** possible).
3. Formulaire d'inscription avec **deux choix mutuellement exclusifs** :
   - **Accompagnateur présent** → saisir nom, prénom et téléphone de l'accompagnateur.
   - **Jeune en autonomie** → saisir nom et téléphone d'une personne à prévenir en cas d'urgence.
4. Case obligatoire **bloquante** — attestation de responsabilité :
   > « J'atteste que le jeune que j'inscris reste sous la responsabilité de mon établissement pendant la durée de l'atelier. »
5. Vérification automatique des **places disponibles** (côté serveur, SELECT `places_max` / COUNT inscriptions actives).
6. Vérification des **conflits d'horaires** (même jeune, deux actions qui se chevauchent).
7. INSERT inscription → confirmation par email.
8. Possibilité d'annulation ultérieure (`canceled_at` SET).

## Règle client (demande du 1 avril 2026)

La case attestation est **obligatoire et bloquante** — pas d'inscription possible sans. Le libellé exact doit apparaître tel quel. Voir [[sources/echange-client-2026-04-01]] et [[sources/prep-visio-2026-04-01]] §18.

## Capacité

- `places_max = null` → action illimitée.
- `places_max = N` → N inscriptions actives max. Les inscriptions annulées libèrent la place.
- Une fois complète, l'UI affiche "Complet" et bloque l'inscription.

## Email de confirmation

Envoyé via Resend au prescripteur après INSERT réussi : titre action, date, jeune(s), référence inscription. Déclenche ensuite les [[concepts/emails-automatiques|rappels J-2 et J-1]].

## Voir aussi

- [[concepts/actions-recurrentes]] — gestion des séries
- [[concepts/emargement]] — pointage le jour J

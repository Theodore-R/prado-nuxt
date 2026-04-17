---
type: concept
updated: 2026-04-17
---

# Emails automatiques et newsletter

Deux canaux distincts : **transactionnels** (Resend) et **marketing** (Mailchimp).

## Transactionnels — Resend

Adresse d'envoi : `Prado Itinéraires <noreply@itineraires.le-prado.fr>` (DNS à configurer avant MEP).

| Email | Destinataire | Déclencheur |
|---|---|---|
| Confirmation newsletter | Visiteur | Inscription newsletter (double opt-in) |
| Notification contact | `itineraires@le-prado.fr` | Nouveau message via formulaire |
| Bienvenue prescripteur | Prescripteur | Création de compte |
| Approbation / refus | Prescripteur | Admin change `status` |
| Confirmation inscription | Prescripteur | Inscription d'un jeune à une action |
| Rappel J-2 | Prescripteur | 2 jours avant une action (cron 8h) |
| Rappel J-1 | Prescripteur | 1 jour avant une action (cron 8h) |
| Magic link | Prescripteur | Demande de connexion sans mot de passe |
| Réinitialisation mot de passe | Prescripteur | Demande de reset |

Textes de ces emails à **valider avec le client** (question n°5 des [[sources/questions-client]]).

## Newsletter — Mailchimp

L'association dispose déjà d'un compte Mailchimp. **Pas de migration** — la plateforme alimente automatiquement la liste :
- Formulaire de newsletter sur le site (double opt-in via token stocké dans `newsletter_subscribers`).
- Opt-in newsletter optionnel au moment de l'inscription prescripteur.
- Synchronisation : appel API Mailchimp après confirmation côté plateforme.

L'équipe Prado conserve ses habitudes Mailchimp pour les campagnes (création, segmentation, stats). Export CSV disponible depuis l'admin **ou** depuis Mailchimp.

## Charge devis

Lot 6 — **2 j / 1 200 €** (emails transactionnels + rappels + intégration Mailchimp). Voir [[sources/devis-v2]].

## Cron rappels

- Endpoint : `GET /api/cron/send-reminders`
- Fréquence : tous les jours à **8h**
- Sécurité : header `X-Cron-Secret`
- Logique : pour chaque action à date J+1 et J+2, grouper par prescripteur, envoyer un email récapitulatif.

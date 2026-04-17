---
type: entity
updated: 2026-04-17
---

# Utilisateurs de la plateforme

Trois rôles distincts, trois espaces dédiés.

## 1. Visiteur

Grand public, partenaires, financeurs.

**Ce qu'il fait** : consulte le site vitrine, parcourt le catalogue d'actions publiques, lit les ressources et actualités, envoie un message via le formulaire, s'abonne à la newsletter (double opt-in), crée un compte prescripteur.

**Accès** : site vitrine seulement. Aucune auth requise.

## 2. Prescripteur

Professionnel de l'accompagnement — éducateur, référent ASE/PJJ, conseiller en insertion, travailleur social, coordinateur d'une structure partenaire.

Rattaché à un **[[entities/organismes|organisme]]** (structure Prado ou partenaire externe).

### États du compte

```
inscription → pending → approved | rejected
```

- **pending** — compte créé, accès en lecture seule au dashboard, ajout de jeunes et inscription **bloqués**.
- **approved** — accès complet à l'espace prescripteur.
- **rejected** — accès bloqué, message d'erreur.

Validation **manuelle** par l'équipe Prado (admin). Voir [[concepts/auth-flow]].

### Ce qu'il fait (approved)

- CRUD des jeunes de **son organisme** (partagés avec les autres prescripteurs du même organisme).
- Inscription d'un jeune à une action (individuelle ou groupée), avec choix accompagnateur présent / jeune en autonomie + attestation de responsabilité obligatoire.
- Suivi des inscriptions, annulation.
- Parcours du catalogue, consultation des ressources.
- Paramètres : profil, mot de passe, email, suppression RGPD, export des données.
- Filtre par année sur le dashboard (utile pour compiler les rapports d'activité).

### Ce qu'il ne fait **pas**

- Voir les jeunes d'un autre organisme (RLS).
- Créer des actions ou valider d'autres prescripteurs.
- Accéder au module budget ou aux stats admin.

## 3. Admin (équipe Prado)

Membres de la direction Itinéraires et de l'équipe technique/pédagogique.

**Attribution** : le rôle `admin` ne peut **pas** être auto-attribué — uniquement par l'équipe technique.

### Ce qu'il fait

- Dashboard global : compteurs (prescripteurs, jeunes, inscriptions, contacts, newsletter) + journal d'activité.
- Validation des prescripteurs (approve/reject, filtrage par statut et par structure).
- Gestion des actions : CRUD, publication, archivage automatique, capacité, **récurrence** (séries avec gestion individuelle des occurrences), **coût** (pour le module budget).
- Vue globale des jeunes (lecture seule).
- **Émargement** des présences le jour J + export PDF feuille de présence.
- **Rapport d'action PDF** — synthétique par action, téléchargeable ou envoyable par email aux financeurs.
- **Module statistiques** (reproduction du rapport d'activité) : profils, provenances, actions, fidélisation, filtre par année.
- **Module budget confidentiel** : coût par action, ventilation par organisme (coût total imputé à chaque organisme participant, pas divisé), récapitulatif annuel, prix moyen.
- Gestion des contacts (marquage lu, export CSV) et de la newsletter (export CSV, synchro Mailchimp).

## Voir aussi

- [[concepts/auth-flow]] — le flux d'inscription détaillé
- [[concepts/rls-isolation]] — comment l'isolation est techniquement garantie
- [[entities/organismes]] — le modèle "organisme" vs "prescripteur individuel"

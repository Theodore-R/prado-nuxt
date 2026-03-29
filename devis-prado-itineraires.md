# Devis — Plateforme Web Prado Itinéraires

| | |
|---|---|
| **Prestataire** | Theodore Riant |
| **Client** | Association Prado Itinéraires |
| **Objet** | Conception et développement d'une plateforme web sur-mesure |
| **Date** | 25 mars 2026 |
| **Validité** | 30 jours |
| **Référence** | DEV-2026-PRADO-001 |

---

## Lot 1 — Site vitrine & contenu éditorial — 8 j/h

| Prestation | Charge |
|-----------|--------|
| Intégration graphique sur-mesure (responsive, mode sombre) | 2 j |
| Pages institutionnelles (organisation, impact social, rapport d'activité, pratiques inspirantes) | 1 j |
| Pages programmes dédiées (Foodtruck, Fresque de la Protection de l'Enfance, Educolab) | 2 j |
| Catalogue des actions (liste avec filtres par catégorie, recherche, détail de chaque action) | 1 j |
| Catalogue des ressources (liste, filtres, détail) | 0.5 j |
| Page contact avec formulaire fonctionnel | 0.5 j |
| Pages légales (mentions légales, politique de confidentialité) | 0.5 j |
| Bandeau cookies / consentement RGPD | 0.5 j |

---

## Lot 2 — SEO & documents — 1 j/h

| Prestation | Charge |
|-----------|--------|
| Optimisation SEO (meta tags dynamiques, sitemap, Open Graph, données structurées) | 0.5 j |
| Section documents téléchargeables (PDF, rapports) | 0.5 j |

---

## Lot 3 — Authentification & gestion des comptes — 6 j/h

| Prestation | Charge |
|-----------|--------|
| Système d'inscription prescripteur (flux email-first + lien magique) | 1 j |
| Connexion par mot de passe + réinitialisation | 0.5 j |
| Complétion du profil professionnel (nom, structure, fonction, téléphone) | 0.5 j |
| Vérification d'identité via service tiers (FranceConnect, Ubble ou L'Identité Numérique La Poste) | 2 j |
| Workflow de validation des comptes (en attente → approuvé / refusé) | 1 j |
| Gestion du compte (modification du profil, suppression RGPD, export des données) | 1 j |

**Services de vérification d'identité envisagés :**
- **FranceConnect** — SSO de l'État, gratuit, largement adopté dans le secteur public/social. Le prescripteur se connecte via ses identifiants impots.gouv, Ameli, etc.
- **Ubble** — Vérification d'identité par vidéo (pièce d'identité + selfie), utilisé par les services publics français. Payant à l'usage.
- **L'Identité Numérique La Poste** — Identité numérique certifiée, intégrée à FranceConnect+. Niveau de confiance élevé.

---

## Lot 4 — Espace prescripteur — 7 j/h

| Prestation | Charge |
|-----------|--------|
| Tableau de bord prescripteur (statistiques, activité récente, checklist d'onboarding) | 1.5 j |
| Gestion des jeunes (ajout, modification, consultation, recherche) | 1.5 j |
| Inscription d'un jeune à une action (formulaire, gestion des places disponibles) | 1.5 j |
| Suivi des inscriptions (liste consolidée, statut, annulation) | 1.5 j |
| Parcours d'onboarding interactif (3 étapes + checklist progressive) | 1 j |

---

## Lot 5 — Panel d'administration — 5.5 j/h

| Prestation | Charge |
|-----------|--------|
| Dashboard administrateur (6 indicateurs clés, timeline d'activité récente) | 1 j |
| Gestion des prescripteurs (liste, filtres, approbation/refus avec notification) | 1 j |
| Gestion des jeunes (vue transversale tous prescripteurs) | 0.5 j |
| Gestion des inscriptions (liste, filtres, export CSV) | 1 j |
| Gestion des messages de contact (lecture, marquage lu/non-lu, export) | 0.5 j |
| Gestion newsletter (synchronisation Mailchimp, consultation des abonnés) | 0.5 j |
| Gestion des actions (nombre de places, publication/dépublication) | 1 j |

---

## Lot 6 — Emails & automatisations — 2 j/h

| Prestation | Charge |
|-----------|--------|
| Emails transactionnels (confirmation d'inscription, bienvenue, approbation/refus) | 0.5 j |
| Rappels automatiques J-2 et J-1 avant chaque action (tâches planifiées) | 0.5 j |
| Intégration Mailchimp (inscription newsletter depuis le site, double opt-in, synchronisation) | 1 j |

---

## Lot 7 — Hébergement & mise en production — 1 j/h

| Prestation | Charge |
|-----------|--------|
| Configuration hébergement (serveur, base de données, DNS) | 0.5 j |
| Mise en production, tests de validation, corrections | 0.5 j |

---

## Récapitulatif

| Lot | Intitulé | Charge |
|-----|---------|--------|
| 1 | Site vitrine & contenu éditorial | 8 j |
| 2 | SEO & documents | 1 j |
| 3 | Authentification & gestion des comptes | 6 j |
| 4 | Espace prescripteur | 7 j |
| 5 | Panel d'administration | 5.5 j |
| 6 | Emails & automatisations | 2 j |
| 7 | Hébergement & mise en production | 1 j |
| | | |
| | **Total lots** | **30.5 j** |

---

## À la charge du client

- **Nom de domaine** — enregistrement et renouvellement annuel
- **Hébergement** — plateforme serverless (Vercel ou équivalent), compte au nom du client
- **Base de données** — service managé (Supabase ou équivalent), compte au nom du client

Le prestataire assure la configuration initiale de ces services (inclus dans le Lot 7). Le client en reste propriétaire et responsable des abonnements.

---

## Option A — CMS & blog (Prismic) — 3 j/h

Permet au client de modifier les contenus du site en toute autonomie, sans intervention technique.

| Prestation | Charge |
|-----------|--------|
| Intégration du CMS headless (Prismic) et connexion au site | 1 j |
| Page d'accueil éditable par le client (sections, textes, images, témoignages, FAQ) | 1 j |
| Section actualités / blog (liste paginée + page article, gérés depuis le CMS) | 0.5 j |
| Formation à la prise en main du CMS (1h supplémentaire) | 0.5 j |

**Avec cette option, le client peut :**
- Modifier les textes et images de la page d'accueil
- Publier et modifier des articles d'actualité
- Gérer les documents téléchargeables
- Tout cela sans solliciter le développeur

---

## Option B — Tracking & analytics — 1.5 j/h

Suivi de la fréquentation du site et du comportement des visiteurs pour piloter les décisions.

| Prestation | Charge |
|-----------|--------|
| Intégration Google Analytics 4 (événements, conversions, audiences) | 0.5 j |
| Intégration Microsoft Clarity (cartes de chaleur, enregistrements de sessions) | 0.5 j |
| Tableau de bord analytics dans le panel admin (visiteurs, pages vues, sources de trafic) | 0.5 j |

**Avec cette option, le client peut :**
- Voir combien de visiteurs consultent le site et d'où ils viennent
- Identifier les pages et actions les plus consultées
- Visualiser le parcours des utilisateurs via les cartes de chaleur
- Suivre les conversions (inscriptions, contacts, newsletter)
- Consulter les statistiques directement depuis le panel admin, sans aller sur Google Analytics

---

## Option C — Maintenance annuelle — 2 j/h par mois

| Prestation | Détail |
|-----------|--------|
| Hébergement | Infrastructure serverless + base de données + CMS |
| Mises à jour de sécurité | Correctifs et mises à jour des dépendances |
| Support technique | Assistance par email, délai de réponse 48h ouvrées |
| Évolutions mineures | Jusqu'à 4h d'ajustements par mois incluses |
| Sauvegardes | Sauvegardes automatiques quotidiennes de la base de données |

---

## Option D — Cession du code source

Livraison de l'intégralité du code source de la plateforme au client, avec droit d'utilisation, de modification et de redistribution sans restriction.

**Inclut :**
- Accès au dépôt Git complet (historique, branches, documentation technique)
- Documentation d'installation et de déploiement
- Licence de cession complète des droits patrimoniaux

**Le client peut alors :**
- Faire évoluer la plateforme avec le prestataire de son choix
- Héberger et maintenir le projet en interne
- Garantir la pérennité du projet indépendamment du prestataire initial

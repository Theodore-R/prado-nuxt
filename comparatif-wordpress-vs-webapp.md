# Prado Itinéraires — Comparatif WordPress vs Application Web Sur-Mesure

## Contexte du projet

Prado Itinéraires est une plateforme socio-éducative qui connecte trois types d'utilisateurs :

- **Le grand public** : consultation du catalogue d'actions, actualités, ressources, contact
- **Les prescripteurs** (professionnels référents) : inscription de jeunes aux actions, gestion de leur portefeuille, tableau de bord
- **Les administrateurs** : validation des prescripteurs, suivi des inscriptions, exports, gestion du contenu

Le projet comporte donc deux volets distincts :
1. **Un site vitrine** (contenu éditorial, actualités, catalogue)
2. **Une application métier** (authentification, gestion de données, workflows, emails transactionnels)

---

## Synthèse rapide

| Critère | WordPress | Application sur-mesure |
|---------|-----------|----------------------|
| Délai de mise en ligne (site vitrine) | Rapide (2-4 semaines) | Modéré (4-6 semaines) |
| Délai pour les fonctionnalités métier | Long (8-16 semaines) | Modéré (6-10 semaines) |
| Coût initial | Élevé (vitrine + dev custom métier) | Modéré (architecture native) |
| Coût de maintenance annuel | Élevé (plugins, compatibilité, sécurité) | Faible (pas de plugins tiers) |
| Autonomie éditoriale du client | Excellente | Bonne (via CMS headless) |
| Fonctionnalités métier complexes | Limité / plugins fragiles | Natif, sans compromis |
| Sécurité | Risque élevé (surface d'attaque large) | Maîtrisée |
| Performance | Variable (dépend des plugins) | Optimale |
| Évolutivité | Limitée | Illimitée |

---

## 1. WordPress — Avantages

### Familiarité et écosystème
- Interface d'administration connue par beaucoup de non-techniciens
- Large choix de thèmes et de plugins
- Communauté importante, documentation abondante

### Gestion de contenu éditoriale
- Éditeur de blocs (Gutenberg) intuitif pour les pages et articles
- Gestion des médias intégrée (images, PDF)
- Plugins SEO matures (Yoast, Rank Math)
- Multilingue possible via WPML ou Polylang

### Coût d'entrée perçu comme faible
- De nombreux hébergeurs proposent des offres WordPress à bas prix
- Des thèmes "tout-en-un" existent et donnent un résultat visuel rapide

### Autonomie du client
- Le client peut modifier les contenus (pages, articles, images) sans développeur
- Possibilité d'ajouter des pages simples en toute autonomie

---

## 2. WordPress — Inconvénients

### Fonctionnalités métier : le point de rupture

Le projet Prado n'est **pas un site vitrine classique**. Il nécessite :

| Fonctionnalité métier | WordPress natif | Réalité |
|----------------------|----------------|---------|
| Authentification prescripteur (email-first + magic link) | Non | Plugin custom ou développement sur-mesure |
| Espace prescripteur avec tableau de bord | Non | Développement complet à faire |
| Gestion des jeunes (CRUD, profils, lien prescripteur) | Non | Plugin custom obligatoire |
| Système d'inscription aux actions avec gestion des places | Non | Développement sur-mesure |
| Workflow de validation des prescripteurs (pending → approved) | Non | Développement sur-mesure |
| Emails transactionnels (confirmation, rappels J-2/J-1) | Non | Plugin + SMTP + custom hooks |
| Dashboard admin avec statistiques temps réel | Non | Plugin custom ou page React embarquée |
| Export CSV des données (contacts, inscriptions, jeunes) | Non | Développement sur-mesure |
| Newsletter double opt-in conforme RGPD | Partiel | Plugin (Mailchimp, etc.) |
| Tâches cron (rappels automatiques) | Limité | wp-cron est peu fiable, nécessite un vrai cron externe |

**Concrètement, 70% des fonctionnalités du projet nécessiteraient du développement sur-mesure, même sur WordPress.** On perdrait alors les avantages de WordPress (simplicité, plugins) tout en héritant de ses inconvénients (lourdeur, sécurité, dette technique).

### Sécurité — Un risque structurel

- WordPress représente **~43% du web**, ce qui en fait la cible n°1 des attaques automatisées
- Chaque plugin ajouté est un vecteur d'attaque potentiel (failles régulières sur WooCommerce, Elementor, etc.)
- Les mises à jour de plugins peuvent casser le site (incompatibilités)
- La gestion de données sensibles (jeunes mineurs, données personnelles des prescripteurs) sur WordPress expose à un risque RGPD accru
- Nécessité d'un **pare-feu applicatif** (Wordfence, Sucuri) et de mises à jour constantes

### Performance

- WordPress charge le thème + les plugins à chaque requête (architecture monolithique PHP)
- Besoin de plugins de cache (WP Rocket, W3 Total Cache) pour des performances acceptables
- L'ajout de fonctionnalités métier via plugins alourdit considérablement le temps de chargement
- Pas de rendu hybride (SSR + CSR) natif → expérience utilisateur moins fluide

### Maintenance et dette technique

- Mises à jour WordPress core + thème + plugins = **risque de régression permanent**
- Les plugins abandonnés sont courants (30% des plugins n'ont pas été mis à jour depuis 2+ ans)
- Chaque plugin custom développé pour Prado devra être maintenu **en plus** de l'écosystème WordPress
- Migration future très coûteuse si les besoins évoluent

### Limites de l'interface admin

- Le back-office WordPress est conçu pour du contenu, pas pour de la gestion de données relationnelles
- Un dashboard prescripteur dans WordPress = soit un plugin de "frontend dashboard" (souvent limité et laid), soit un développement React/Vue embarqué dans WordPress (complexité maximale)

---

## 3. Application sur-mesure — Avantages

### Architecture adaptée au besoin

- **Séparation claire** : contenu éditorial (CMS headless) + données métier (base de données relationnelle)
- Chaque fonctionnalité est conçue spécifiquement pour le cas d'usage Prado
- Pas de "détournement" d'outils conçus pour autre chose

### Performance native

- Rendu côté serveur (SSR) pour le SEO + hydratation côté client pour l'interactivité
- Chargement instantané entre les pages (navigation SPA)
- Optimisation des images, lazy loading, infinite scroll natifs
- Score Lighthouse proche de 100/100 atteignable sans configuration additionnelle

### Sécurité maîtrisée

- Surface d'attaque minimale (pas de plugins tiers avec des failles connues)
- Authentification robuste avec Supabase Auth (Row Level Security, tokens JWT)
- Validation des données côté serveur sur chaque endpoint
- Conformité RGPD facilitée (contrôle total sur les données stockées, leur localisation et leur suppression)

### Expérience utilisateur supérieure

- Interface moderne et fluide (transitions, animations, skeleton loading)
- Mode sombre natif
- Responsive design optimisé par composant
- Formulaires intelligents avec validation en temps réel

### Évolutivité

- Ajout de fonctionnalités sans risque de casser l'existant
- Possibilité d'ajouter une application mobile (React Native / Flutter) connectée aux mêmes APIs
- Intégration possible avec n'importe quel service tiers (CRM, outil de reporting, etc.)
- Scaling automatique (hébergement serverless)

### Autonomie éditoriale préservée

- Le CMS headless (Prismic) offre une interface d'édition intuitive pour les contenus
- Le client peut modifier les textes, images, articles d'actualité en toute autonomie
- Prévisualisation en temps réel des modifications

---

## 4. Application sur-mesure — Inconvénients

### Courbe d'apprentissage

- L'interface d'administration est spécifique au projet (pas de "standard WordPress" connu)
- Formation initiale nécessaire pour les administrateurs
- Le CMS headless (Prismic) est moins connu que WordPress (mais tout aussi simple à utiliser)

### Coût initial plus visible

- Le développement sur-mesure affiche un coût initial plus élevé
- Nécessite des développeurs spécialisés pour les évolutions futures

### Dépendance technique

- Le client est dépendant de l'équipe de développement pour les fonctionnalités métier
- Les modifications structurelles (nouveau type de données, nouveau workflow) nécessitent un développeur

---

## 5. Complexité de développement par fonctionnalité

Ce tableau compare l'effort relatif de développement pour chaque bloc fonctionnel selon la solution choisie.

| Bloc fonctionnel | WordPress | App sur-mesure | Commentaire |
|-----------------|-----------|---------------|-------------|
| **Site vitrine** (pages, catalogue, blog, contact) | Effort faible | Effort faible | WordPress a un léger avantage (blog natif, plugins SEO) |
| **Authentification** (magic link, mot de passe, validation de compte) | Effort élevé | Effort faible | WP n'a pas d'auth prescripteur native → plugin custom obligatoire |
| **Espace prescripteur** (dashboard, gestion jeunes, inscriptions) | Effort très élevé | Effort modéré | Le plus gros écart : WP n'est pas conçu pour des dashboards métier front-end |
| **Panel admin** (stats, approbations, exports CSV) | Effort élevé | Effort modéré | Le back-office WP gère du contenu, pas des données relationnelles |
| **Emails & cron** (transactionnels, rappels J-2/J-1, newsletter RGPD) | Effort élevé | Effort faible | wp-cron est peu fiable, nécessite SMTP externe + plugins |

### Répartition de l'effort

```
Vitrine (WordPress avantagé) :  ~25% du projet
Fonctionnel métier (App avantagée) : ~75% du projet
```

> **Constat clé** : WordPress est compétitif uniquement sur la partie vitrine (25% du projet). Dès qu'on entre dans le fonctionnel métier, le développement custom sur WordPress est **significativement plus complexe et coûteux** car il faut contourner les limitations de la plateforme.

---

## 6. Coûts récurrents (hébergement & maintenance)

| Poste | WordPress | App sur-mesure |
|-------|-----------|---------------|
| Hébergement | Serveur PHP managé (mutualisé ou VPS) | Serverless (Vercel — gratuit ou quasi-gratuit à ce volume) |
| Base de données | MySQL inclus dans l'hébergement | Supabase (plan gratuit suffisant pour ce volume) |
| CMS | Intégré (WordPress lui-même) | Prismic (plan gratuit suffisant) |
| Licences plugins premium | Renouvellement annuel obligatoire (SEO, sécurité, formulaires, cache…) | Aucune — pas de plugins tiers |
| Maintenance sécurité | Critique : mises à jour core + thème + plugins régulières, pare-feu applicatif | Minimale : pas de surface d'attaque plugin |
| Maintenance compatibilité | Élevée : chaque mise à jour WP peut casser des plugins custom | Faible : stack maîtrisée, pas de dépendances fragiles |
| Coût total annuel (hors évolutions) | **Modéré à élevé** | **Faible** |

> L'application sur-mesure a un coût récurrent nettement inférieur grâce à l'absence de licences plugins, à l'hébergement serverless, et à une maintenance de sécurité réduite.

---

## 7. Récapitulatif par critère

| Critère | WordPress | App sur-mesure | Gagnant |
|---------|-----------|---------------|---------|
| Facilité de mise en place (vitrine) | ★★★★★ | ★★★☆☆ | WordPress |
| Facilité de mise en place (métier) | ★★☆☆☆ | ★★★★☆ | App sur-mesure |
| Gestion de contenu éditorial | ★★★★★ | ★★★★☆ | WordPress (léger) |
| Fonctionnalités métier (inscriptions, dashboards, workflows) | ★★☆☆☆ | ★★★★★ | **App sur-mesure** |
| Sécurité | ★★☆☆☆ | ★★★★★ | **App sur-mesure** |
| Performance | ★★★☆☆ | ★★★★★ | **App sur-mesure** |
| Coût récurrent (maintenance, hébergement) | ★★★☆☆ | ★★★★★ | **App sur-mesure** |
| Évolutivité | ★★☆☆☆ | ★★★★★ | **App sur-mesure** |
| Autonomie du client (contenu) | ★★★★★ | ★★★★☆ | WordPress (léger) |
| Expérience utilisateur | ★★★☆☆ | ★★★★★ | **App sur-mesure** |
| Conformité RGPD (données jeunes) | ★★☆☆☆ | ★★★★★ | **App sur-mesure** |

---

## 8. Recommandation

### WordPress est adapté si :
- Le projet se limite à un **site vitrine** avec un blog et un formulaire de contact
- Il n'y a **pas de gestion de données relationnelles** (jeunes, inscriptions, prescripteurs)
- Le budget est très contraint et les fonctionnalités métier ne sont pas prioritaires
- L'équipe interne souhaite gérer 100% du contenu sans développeur

### L'application sur-mesure est adaptée si :
- Le projet comporte des **fonctionnalités métier complexes** (c'est le cas de Prado)
- La sécurité des données est critique (données de mineurs, RGPD)
- On souhaite une **expérience utilisateur moderne** et performante
- L'évolutivité est importante (nouveaux workflows, application mobile future, intégrations)
- On cherche des **coûts récurrents maîtrisés** sur le moyen/long terme

### Pour Prado Itinéraires

Le projet Prado n'est pas un site vitrine. C'est une **plateforme applicative** avec :
- 3 niveaux d'accès (public, prescripteur, admin)
- Des workflows métier (inscription → validation → rappels automatiques)
- De la gestion de données relationnelles (jeunes liés à des prescripteurs, inscriptions liées à des actions)
- Des contraintes réglementaires fortes (données de mineurs)

**Faire ces fonctionnalités dans WordPress reviendrait à développer une application sur-mesure... à l'intérieur de WordPress**, en cumulant les inconvénients des deux approches (complexité du custom + lourdeur/insécurité de WordPress).

L'application sur-mesure est la solution la plus adaptée, la plus sûre et la plus économique à moyen terme pour ce type de projet.

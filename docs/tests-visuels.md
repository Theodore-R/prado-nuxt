# Tests visuels — Prado Itinéraires

> Document de recette visuelle exhaustif.  
> Chaque point doit etre verifie sur **3 viewports** : Desktop (1440px), Tablette (768px), Mobile (375px).  
> Navigateurs cibles : Chrome, Safari, Firefox.

---

## Palette de reference

| Token | Hex | Usage |
|-------|-----|-------|
| Orange Prado | `#FB6223` | Primary, boutons, liens, CTA, gradients |
| Bleu marine Prado | `#024266` | Accent, headers, footer, badges, gradients |
| Vert-sauge Itineraires | `#93C1AF` | Secondary, elements illustratifs, badges doux |
| Noir Prado | `#0D1F26` | Texte principal (theme clair), fond (theme sombre) |
| Blanc | `#FFFFFF` | Fond (theme clair), texte (theme sombre) |

**Couleurs supprimees** (ne doivent apparaitre NULLE PART) :
- Rose `#CF006C`
- Jaune `#FFD228`
- Violet `#C18ED8` / `#701C86`
- Ancien orange `#FB6223`
- Ancien teal `#004657`

---

## 0. Pre-requis

- [ ] `npm run dev` demarre sans erreur
- [ ] Aucune erreur console au chargement de la page d'accueil
- [ ] Aucune erreur 404 sur les assets (images, fonts, favicon)
- [ ] Le logo Prado Itineraires (vague orange + cercles vert-sauge) s'affiche dans le header/navbar
- [ ] Le favicon est a jour

---

## 1. Theme et couleurs globales

### 1.1 Theme clair (defaut)

- [ ] Au premier chargement (sans localStorage), le theme clair est actif
- [ ] Fond de page : blanc / gris tres clair
- [ ] Texte principal : noir/gris fonce (`#0D1F26`)
- [ ] Boutons primaires : fond orange `#FB6223`, texte blanc
- [ ] Liens : orange `#FB6223`
- [ ] Header/navbar : fond blanc ou leger, texte fonce
- [ ] Footer : fond bleu marine `#024266`, texte blanc/clair

### 1.2 Theme sombre

- [ ] Toggle theme fonctionne (bouton dans le header ou settings)
- [ ] Fond de page : noir/bleu tres fonce (`#0D1F26`)
- [ ] Texte principal : blanc
- [ ] Boutons primaires : fond orange `#FB6223`, texte blanc
- [ ] Les cartes et surfaces ont un fond legerement plus clair que le fond
- [ ] Contraste suffisant sur tous les textes (ratio >= 4.5:1)
- [ ] Le choix persiste apres rechargement de la page

### 1.3 Absence de couleurs obsoletes

- [ ] Aucun element rose visible
- [ ] Aucun element jaune visible
- [ ] Aucun element violet visible
- [ ] Les gradients utilisent orange → bleu marine (pas d'autres couleurs)

---

## 2. Homepage (`/`)

### 2.1 Section Hero

- [ ] Image hero plein ecran avec effet de scroll/expand
- [ ] Titre "L'innovation sociale au service des jeunes/des familles" (texte rotatif)
- [ ] Sous-titre "Prado Itineraires"
- [ ] Texte lisible par-dessus l'image (overlay ou ombre)
- [ ] Bouton CTA visible et cliquable
- [ ] Indication "Scrollez pour decouvrir" visible
- [ ] **Mobile** : texte redimensionne, pas de debordement horizontal

### 2.2 Section Programmes

- [ ] 3 programmes affiches (Foodtruck, Fresque, EduColab)
- [ ] Cartes avec image, titre, description
- [ ] Liens fonctionnels vers `/foodtruck`, `/fresque`, `/educolab`
- [ ] **Mobile** : cartes empilees verticalement

### 2.3 Section Missions

- [ ] Contenu Prismic affiche correctement
- [ ] Icones/illustrations visibles
- [ ] **Mobile** : mise en page adaptee

### 2.4 Section Chiffres d'impact

- [ ] Chiffres animes ou mis en evidence
- [ ] Couleurs conformes (orange pour les chiffres cles)
- [ ] **Mobile** : grille 2 colonnes ou pile

### 2.5 Section Comment ca marche (Etapes)

- [ ] Etapes numerotees clairement
- [ ] Progression visuelle (timeline, fleches, ou numerotation)
- [ ] **Mobile** : etapes empilees

### 2.6 Section Temoignages

- [ ] Carrousel ou grille de temoignages
- [ ] Photo/avatar, nom, citation
- [ ] Navigation entre temoignages (si carrousel)
- [ ] **Mobile** : un temoignage a la fois

### 2.7 Section FAQ

- [ ] Accordeons fonctionnels (clic pour ouvrir/fermer)
- [ ] Un seul ouvert a la fois (ou plusieurs, selon le design)
- [ ] Fleche/icone de rotation a l'ouverture
- [ ] **Mobile** : largeur pleine

### 2.8 Section Actualites (slider)

- [ ] Carrousel horizontal des 5 dernieres actualites
- [ ] Chaque carte : image, date, titre, extrait
- [ ] Fleches de navigation gauche/droite (desktop)
- [ ] Scroll snap fluide
- [ ] Liens fonctionnels vers `/actualites/[uid]`
- [ ] **Mobile** : cartes empilees ou scroll horizontal tactile
- [ ] **Vide** : si aucune actualite dans Prismic, la section ne s'affiche pas (ou message "Aucune actualite")

### 2.9 Section Newsletter

- [ ] Champ email + bouton "S'inscrire"
- [ ] Validation email cote client (format invalide = message d'erreur)
- [ ] Succes : message de confirmation ("Un email de confirmation vous a ete envoye")
- [ ] Double soumission : bouton desactive pendant l'envoi
- [ ] **Mobile** : champ + bouton empiles ou en ligne

### 2.10 Section Partenaires

- [ ] Logos des partenaires affiches
- [ ] Logos en couleur orange/monochrome (pas d'ancien jaune)
- [ ] **Mobile** : grille adaptee

### 2.11 Section En savoir plus

- [ ] Contenu Prismic affiche
- [ ] Liens fonctionnels

### 2.12 Section CTA Final

- [ ] Bouton d'action principal visible
- [ ] Fond colore ou gradient (orange → bleu marine)
- [ ] **Mobile** : bouton pleine largeur

---

## 3. Catalogue d'actions (`/actions`)

- [ ] Liste des actions a venir affichee en cartes
- [ ] Chaque carte : titre, date, lieu, categorie, places disponibles
- [ ] Filtres fonctionnels (categorie, date, recherche texte)
- [ ] Pagination ou scroll infini si beaucoup d'actions
- [ ] Clic sur une carte → page de detail (`/actions/[id]`)
- [ ] **Vide** : message "Aucune action disponible" si liste vide
- [ ] **Mobile** : cartes pleine largeur, filtres en accordeon ou modale

### 3.1 Detail d'une action (`/actions/[id]`)

- [ ] Titre, description, date, horaire, lieu
- [ ] Nombre de places (disponibles / total)
- [ ] Categorie avec badge colore
- [ ] Cout affiche si defini
- [ ] Bouton "S'inscrire" ou "Se connecter pour s'inscrire"
- [ ] **Mobile** : mise en page lineaire

---

## 4. Pages programmes

### 4.1 Foodtruck (`/foodtruck`)

- [ ] Contenu Prismic affiche (texte, images, slices)
- [ ] Images responsive
- [ ] **Mobile** : mise en page fluide

### 4.2 Fresque (`/fresque`)

- [ ] Contenu Prismic affiche
- [ ] **Mobile** : mise en page fluide

### 4.3 EduColab (`/educolab`)

- [ ] Contenu Prismic affiche
- [ ] **Mobile** : mise en page fluide

---

## 5. Actualites

### 5.1 Liste (`/actualites`)

- [ ] Liste d'articles avec image, date, titre, extrait
- [ ] Pagination si besoin
- [ ] **Mobile** : cartes empilees

### 5.2 Article (`/actualites/[uid]`)

- [ ] Contenu rich text Prismic bien formate (titres, paragraphes, images, liens)
- [ ] Images responsive avec lazy loading
- [ ] **Mobile** : images pleine largeur, texte lisible

---

## 6. Ressources et documents

### 6.1 Liste (`/ressources`)

- [ ] Documents listees avec titre, description
- [ ] **Mobile** : liste adaptee

### 6.2 Detail (`/ressources/[id]`)

- [ ] Contenu affiche correctement
- [ ] Telechargement de document si applicable

---

## 7. Contact (`/contact`)

- [ ] Formulaire : nom, email, sujet, message
- [ ] Validation cote client (champs obligatoires, format email)
- [ ] Bouton "Envoyer" desactive pendant l'envoi
- [ ] Succes : message de confirmation
- [ ] Erreur : message d'erreur clair
- [ ] Rate limiting : apres 5 envois rapides, message "Veuillez patienter"
- [ ] **Mobile** : formulaire pleine largeur

---

## 8. Pages legales

### 8.1 Mentions legales (`/mentions-legales`)

- [ ] Texte complet affiche
- [ ] Mise en forme correcte (titres, paragraphes)

### 8.2 Politique de confidentialite (`/politique-confidentialite`)

- [ ] Texte complet affiche
- [ ] Sections RGPD couvertes

---

## 9. Bandeau cookies

- [ ] Apparait au premier chargement (pas de cookie consent en localStorage)
- [ ] Boutons "Accepter" et "Refuser" visibles
- [ ] "Accepter" → bandeau disparait, GA4 + Clarity charges
- [ ] "Refuser" → bandeau disparait, GA4 + Clarity NON charges
- [ ] Le choix persiste apres rechargement
- [ ] **Mobile** : bandeau adapte, boutons accessibles

---

## 10. Connexion (`/connexion`)

- [ ] Formulaire email + mot de passe
- [ ] Lien "Mot de passe oublie"
- [ ] Lien "Creer un compte" / "S'inscrire"
- [ ] Erreur d'authentification : message clair ("Email ou mot de passe incorrect")
- [ ] Redirection vers `/espace` apres connexion reussie
- [ ] **Mobile** : formulaire centre, pleine largeur

---

## 11. Espace prescripteur

> Necessite un compte prescripteur valide (approuve par admin).

### 11.1 Dashboard (`/espace`)

- [ ] Message de bienvenue avec nom du prescripteur
- [ ] Widget onboarding si profil incomplet (progression visible)
- [ ] Cartes resume : nombre de jeunes, inscriptions recentes, actions a venir
- [ ] **Filtre par annee** : selecteur d'annee visible sur les inscriptions recentes
- [ ] Changer l'annee filtre les donnees affichees
- [ ] Liens rapides vers les sections principales
- [ ] **Mobile** : cartes empilees

### 11.2 Onboarding

- [ ] Panel lateral ou modal avec la checklist
- [ ] 5 etapes maximum (pas de sante, pas d'identite)
- [ ] Progression visuelle (barre ou cercle de pourcentage)
- [ ] Chaque etape cliquable → action correspondante
- [ ] A 100% : message de felicitations (sans confetti)
- [ ] **Mobile** : panel plein ecran ou modal

### 11.3 Liste des jeunes (`/espace/jeunes`)

- [ ] Tableau ou liste de cartes avec : nom, prenom, date de naissance, situation
- [ ] Recherche par nom
- [ ] Bouton "Ajouter un jeune"
- [ ] Formulaire d'ajout : prenom, nom, date de naissance, **sexe** (select), **code postal**, **QPV** (checkbox), **situation** (select), **accompagnement au titre de** (multi-checkbox), notes
- [ ] PAS de champs adresse, ville, sante, identite
- [ ] Export CSV fonctionnel
- [ ] **Mobile** : tableau scrollable horizontalement ou cartes empilees

### 11.4 Fiche jeune (`/espace/jeunes/[id]`)

- [ ] Informations personnelles affichees : prenom, nom, date de naissance, age calcule
- [ ] **Sexe** : affiche "Homme" ou "Femme"
- [ ] **Code postal** : affiche
- [ ] **QPV** : badge "QPV" si coche
- [ ] **Situation** : affiche en clair ("Sans emploi", "Scolarise ordinaire", etc.)
- [ ] **Accompagnement au titre de** : liste des types selectionnes (ASE, PJJ, Mission locale, etc.)
- [ ] Notes : champ texte editable
- [ ] Edition inline : clic sur un champ pour le modifier
- [ ] PAS d'onglet sante
- [ ] PAS d'onglet famille
- [ ] PAS de badge "identite verifiee"
- [ ] PAS de bouton "Verifier l'identite"
- [ ] PAS de champ adresse/ville
- [ ] Historique des inscriptions du jeune visible
- [ ] Bouton "Inscrire a une action"
- [ ] **Mobile** : sections empilees, edition tactile facile

### 11.5 Inscription a une action (`/espace/actions`)

- [ ] Liste des actions disponibles
- [ ] Bouton "Inscrire" sur chaque action

#### Flux d'inscription individuelle

- [ ] Selection du jeune a inscrire
- [ ] **Mode de participation** : radio "Avec accompagnateur" / "En autonomie"
  - [ ] Si accompagnateur → champ "Nom de l'accompagnateur" visible
  - [ ] Si autonomie → champs "Personne d'urgence : nom" et "telephone" visibles
- [ ] **Attestation de responsabilite** : checkbox obligatoire avec le texte legal complet
- [ ] Le bouton "Confirmer" est desactive tant que l'attestation n'est pas cochee
- [ ] Succes : message de confirmation + redirection

#### Inscription groupee

- [ ] Composant `InscriptionGroupee` accessible (bouton "Inscription groupee" ou similaire)
- [ ] Liste des jeunes du prescripteur avec checkboxes
- [ ] Toggle "Selectionner tout"
- [ ] Option accompagnateur pour le groupe
- [ ] Bouton "Inscrire X jeunes"
- [ ] Succes : message recapitulatif
- [ ] Email de confirmation envoye (verifier en base ou logs)

### 11.6 Suivi inscriptions (`/espace/inscriptions`)

- [ ] Tableau des inscriptions avec : jeune, action, date, statut
- [ ] **Filtre par annee** : selecteur d'annee dans la toolbar
- [ ] Changer l'annee filtre les inscriptions affichees
- [ ] Possibilite d'annuler une inscription (si applicable)
- [ ] **Mobile** : tableau scrollable ou cartes

### 11.7 Parametres prescripteur (`/espace/parametres`)

- [ ] Onglets : Profil, Notifications, Securite, Compte
- [ ] Modification du profil (nom, telephone, structure)
- [ ] Changement de mot de passe
- [ ] Suppression de compte
- [ ] Export des donnees (RGPD)
- [ ] **Mobile** : onglets en dropdown ou scroll horizontal

---

## 12. Administration

> Necessite un compte admin.

### 12.1 Dashboard admin (`/admin`)

- [ ] Vue d'ensemble : prescripteurs en attente, inscriptions recentes, actions a venir
- [ ] Acces rapide aux sections principales
- [ ] **Mobile** : cartes empilees

### 12.2 Navigation admin (sidebar)

- [ ] Liens visibles vers toutes les sections :
  - Dashboard
  - Prescripteurs
  - Jeunes
  - Inscriptions
  - Actions
  - Contacts
  - Newsletter
  - Structures (organismes)
  - **Etablissements** (nouveau)
  - **Statistiques** (nouveau)
  - **Budget** (nouveau)
  - Parametres
- [ ] Icones coherentes
- [ ] Section active surlignee
- [ ] **Mobile** : sidebar en drawer ou menu hamburger

### 12.3 Prescripteurs (`/admin/prescripteurs`)

- [ ] Tableau avec : nom, email, structure, statut (en attente / approuve / refuse)
- [ ] Actions : approuver, refuser, voir details
- [ ] Filtre par statut
- [ ] **Mobile** : tableau scrollable

### 12.4 Jeunes (`/admin/jeunes`)

- [ ] Tableau avec tous les jeunes de toutes les structures
- [ ] Colonnes : nom, prenom, structure, situation, sexe
- [ ] Recherche et filtres
- [ ] **Mobile** : tableau scrollable

### 12.5 Inscriptions (`/admin/inscriptions`)

- [ ] Tableau de toutes les inscriptions
- [ ] Colonnes : jeune, action, prescripteur, date, statut de presence
- [ ] Filtre par action, par date
- [ ] **Mobile** : tableau scrollable

### 12.6 Actions (`/admin/actions`)

- [ ] Tableau avec : titre, date, categorie, places, inscrits, **cout**
- [ ] Icone/badge si action recurrente
- [ ] Bouton "Nouvelle action"
- [ ] **Formulaire de creation** :
  - [ ] Titre, description, categorie, date, horaire, places max
  - [ ] **Cout** (champ euros avec 2 decimales)
  - [ ] **Etablissement d'accueil** (select peuple depuis l'API)
  - [ ] **Action recurrente** (toggle) :
    - [ ] Si active → frequence (hebdomadaire/bihebdomadaire/mensuel) + date debut + date fin
    - [ ] Preview du nombre de dates generees
- [ ] **Edition** : memes champs que la creation
- [ ] Suppression avec confirmation
- [ ] **Emargement** (composant `Emargement`) :
  - [ ] Accessible depuis une action (bouton "Emargement" ou "Pointer les presences")
  - [ ] Liste des inscrits a cette action
  - [ ] Toggle present/absent pour chaque inscrit
  - [ ] Bouton "Enregistrer" pour sauvegarder en batch
  - [ ] Nombre de presents / total affiche
  - [ ] Succes : message de confirmation
- [ ] **Rapport** (composant `RapportAction`) :
  - [ ] Accessible depuis une action (bouton "Rapport")
  - [ ] Affiche : nom de l'action, date(s), lieu, cout
  - [ ] Stats de presence : inscrits, presents, absents, taux de presence
  - [ ] Tableau des participants avec statut
  - [ ] Bouton "Envoyer par email" → champ destinataires → envoi
- [ ] **Mobile** : formulaires en modal plein ecran

### 12.7 Contacts (`/admin/contacts`)

- [ ] Tableau des messages du formulaire de contact
- [ ] Statut lu/non lu
- [ ] Detail du message
- [ ] **Mobile** : tableau scrollable

### 12.8 Newsletter (`/admin/newsletter`)

- [ ] Liste des abonnes avec statut (confirme / en attente)
- [ ] Export des abonnes
- [ ] Sync Mailchimp (bouton + statut)
- [ ] **Mobile** : tableau scrollable

### 12.9 Structures / Organismes (`/admin/structures`)

- [ ] Tableau avec : nom, **type**, **ville**, nombre de prescripteurs, **badge Prado**
- [ ] Formulaire d'ajout/edition :
  - [ ] Nom
  - [ ] **Type** (champ texte)
  - [ ] **Code postal**
  - [ ] **Ville**
  - [ ] **Est Prado** (checkbox) → affiche un badge sur la ligne
- [ ] Suppression avec confirmation
- [ ] **Mobile** : tableau scrollable

### 12.10 Etablissements (`/admin/etablissements`) — NOUVEAU

- [ ] Tableau avec : nom, adresse, code postal, ville
- [ ] Bouton "Ajouter un etablissement"
- [ ] Formulaire d'ajout : nom (obligatoire), adresse, code postal, ville
- [ ] Edition en modal
- [ ] Suppression avec confirmation (verifier le message si l'etablissement est lie a des actions)
- [ ] Export CSV
- [ ] **Mobile** : tableau scrollable

### 12.11 Statistiques (`/admin/statistiques`) — NOUVEAU

- [ ] **Selecteur d'annee** en haut de page
- [ ] Changer l'annee rafraichit les 4 blocs

#### Bloc Profils & Situations

- [ ] Nombre total de jeunes inscrits dans l'annee
- [ ] Age median
- [ ] Repartition par sexe (barres horizontales : Homme / Femme)
- [ ] Repartition par situation (barres : Sans emploi, Scolarise ordinaire, etc.)
- [ ] Les barres ont des couleurs conformes a la charte
- [ ] Les pourcentages sont affiches

#### Bloc Provenances

- [ ] Repartition par structure (barres horizontales)
- [ ] Repartition par code postal (barres)
- [ ] Repartition par type d'accompagnement (barres)

#### Bloc Actions

- [ ] Total d'actions dans l'annee
- [ ] Total d'inscrits
- [ ] Taux de participation (presents / inscrits en %)
- [ ] Taux de fidelisation (jeunes avec 2+ inscriptions en %)
- [ ] Repartition par categorie (barres)

#### Bloc Budget

- [ ] Budget total (en euros)
- [ ] Cout moyen par action
- [ ] Ventilation par etablissement (barres)

- [ ] **Donnees vides** : chaque bloc gere l'absence de donnees ("Aucune donnee pour cette annee")
- [ ] **Mobile** : blocs empiles, barres lisibles

### 12.12 Budget (`/admin/budget`) — NOUVEAU

- [ ] Page dediee au budget (plus detaillee que le bloc stats)
- [ ] Selecteur d'annee
- [ ] StatsBudget affiche en grand format
- [ ] Acces reserve admin uniquement
- [ ] **Mobile** : adapte

### 12.13 Parametres admin (`/admin/parametres`)

- [ ] Onglets : Email, Contact, Newsletter, Prismic, **Analytics**
- [ ] **Onglet Analytics** :
  - [ ] Section Google Analytics 4 : toggle activer/desactiver + champ ID GA4
  - [ ] Section Microsoft Clarity : toggle activer/desactiver + champ ID Clarity
  - [ ] Bouton sauvegarder
  - [ ] Succes : message de confirmation
- [ ] PAS d'onglet Veriff (supprime)
- [ ] Onglet Newsletter : config Mailchimp (toggle, cles, test connexion, sync)
- [ ] **Mobile** : onglets en dropdown

---

## 13. Accessibilite (basique)

### 13.1 Navigation clavier

- [ ] Tab : parcourt tous les elements interactifs dans l'ordre logique
- [ ] Enter/Space : active les boutons et liens
- [ ] Escape : ferme les modals et dropdowns
- [ ] Focus visible : outline claire sur l'element actif (pas de `outline: none` sans remplacement)
- [ ] Skip to content : lien invisible au premier Tab (si implemente)

### 13.2 Contraste

- [ ] Texte principal sur fond clair : ratio >= 4.5:1
- [ ] Texte blanc sur fond orange `#FB6223` : ratio ~3.1:1 (acceptable pour gros texte, ajouter ombre ou fond plus fonce pour petit texte)
- [ ] Texte blanc sur fond bleu `#024266` : ratio >= 10:1 (excellent)
- [ ] Texte sur fond vert-sauge `#93C1AF` : verifier le ratio selon la taille

### 13.3 Lecteur d'ecran

- [ ] Images : attribut `alt` pertinent (pas "image", pas vide sauf decoratif)
- [ ] Formulaires : labels associes aux inputs (`<label for="...">`)
- [ ] Tableaux admin : `<th>` avec scope
- [ ] Boutons d'icone : `aria-label` present
- [ ] Modals : `role="dialog"` + `aria-modal="true"` + focus trap

### 13.4 Animations

- [ ] `prefers-reduced-motion` : les animations sont reduites ou desactivees
- [ ] Pas d'animation clignotante ou stroboscopique

---

## 14. Responsive — Tests specifiques

### 14.1 Header / Navbar

- [ ] **Desktop** : logo + liens de navigation + bouton connexion
- [ ] **Mobile** : logo + hamburger → menu drawer/overlay
- [ ] Menu mobile : tous les liens accessibles
- [ ] Fermeture du menu : clic exterieur ou bouton fermer

### 14.2 Footer

- [ ] **Desktop** : colonnes (liens, contact, reseaux)
- [ ] **Mobile** : colonnes empilees
- [ ] Liens fonctionnels

### 14.3 Tableaux admin

- [ ] **Desktop** : tableau complet visible
- [ ] **Tablette** : colonnes moins prioritaires masquees ou scroll horizontal
- [ ] **Mobile** : scroll horizontal avec indicateur visuel OU transformation en cartes

### 14.4 Formulaires

- [ ] **Desktop** : champs en grille (2 colonnes si pertinent)
- [ ] **Mobile** : champs pleine largeur, empiles
- [ ] Clavier mobile : le type d'input correspond (email → clavier email, tel → clavier numerique)
- [ ] Pas de zoom force sur iOS (font-size >= 16px sur les inputs)

### 14.5 Modals

- [ ] **Desktop** : centree, taille raisonnable
- [ ] **Mobile** : plein ecran ou presque, scrollable si contenu long
- [ ] Fond assombri + fermeture au clic exterieur

---

## 15. Performance visuelle

- [ ] Temps de chargement initial < 3s (sur connexion rapide)
- [ ] Pas de layout shift visible (CLS) au chargement
- [ ] Images lazy-loaded (pas de chargement de toutes les images d'un coup)
- [ ] Skeleton loaders ou spinners pendant le chargement des donnees API
- [ ] Pas de flash de theme sombre puis clair (ou inversement) au chargement

---

## 16. Flux critiques end-to-end

> Parcours complets a tester de bout en bout.

### 16.1 Inscription prescripteur → Approbation → Connexion

1. [ ] Aller sur `/connexion` → "Creer un compte"
2. [ ] Remplir le formulaire (nom, email, structure, mot de passe)
3. [ ] Recevoir l'email de confirmation
4. [ ] Cliquer le lien → email confirme
5. [ ] Se connecter → message "Votre compte est en attente de validation"
6. [ ] Admin approuve le prescripteur dans `/admin/prescripteurs`
7. [ ] Se reconnecter → acces a `/espace`

### 16.2 Ajouter un jeune → L'inscrire → Pointer sa presence

1. [ ] Dans `/espace/jeunes` → "Ajouter un jeune"
2. [ ] Remplir : prenom, nom, date de naissance, sexe, code postal, QPV, situation, accompagnement
3. [ ] Sauvegarder → jeune apparait dans la liste
4. [ ] Aller dans `/espace/actions` → choisir une action → "Inscrire"
5. [ ] Choisir le jeune, mode de participation, attestation → confirmer
6. [ ] Admin : aller dans `/admin/actions` → action → Emargement
7. [ ] Pointer le jeune comme present → sauvegarder

### 16.3 Creer une action recurrente → Voir les stats

1. [ ] Admin : `/admin/actions` → "Action recurrente"
2. [ ] Remplir : titre, categorie, frequence hebdomadaire, dates, places, cout, etablissement
3. [ ] Sauvegarder → les actions apparaissent dans la liste
4. [ ] Inscrire des jeunes (via prescripteur)
5. [ ] Pointer les presences
6. [ ] Aller dans `/admin/statistiques` → verifier que les chiffres sont coherents

### 16.4 Inscription groupee

1. [ ] Prescripteur : avoir au moins 3 jeunes
2. [ ] `/espace/actions` → action → "Inscription groupee"
3. [ ] Cocher 3 jeunes → "Inscrire 3 jeunes"
4. [ ] Succes : message + email recapitulatif envoye

### 16.5 Rapport d'action

1. [ ] Admin : `/admin/actions` → action avec des inscrits et presences pointees
2. [ ] Cliquer "Rapport"
3. [ ] Verifier : stats correctes, liste des participants, taux de presence
4. [ ] "Envoyer par email" → saisir un email → envoyer
5. [ ] Verifier la reception de l'email

### 16.6 Newsletter

1. [ ] Homepage → section Newsletter → entrer un email → "S'inscrire"
2. [ ] Recevoir l'email de confirmation
3. [ ] Cliquer le lien → confirme
4. [ ] Admin : `/admin/newsletter` → l'abonne apparait comme "confirme"
5. [ ] Sync Mailchimp → verifier que le contact est dans la liste Mailchimp

---

## 17. Checklist de non-regression

> Verifier que les fonctionnalites existantes n'ont pas ete cassees.

- [ ] Connexion / deconnexion fonctionne
- [ ] Magic link fonctionne
- [ ] Mot de passe oublie fonctionne
- [ ] CRUD jeunes (ajouter, modifier, supprimer)
- [ ] CRUD actions (admin)
- [ ] CRUD structures (admin)
- [ ] Inscription individuelle a une action
- [ ] Formulaire de contact
- [ ] Newsletter (inscription + confirmation)
- [ ] Emails de rappel J-1/J-2 (cron)
- [ ] Export CSV (jeunes, inscriptions)
- [ ] Recherche dans les tableaux
- [ ] Pagination dans les tableaux
- [ ] Page Prismic dynamique (`/[...slug]`)
- [ ] Slice simulator (`/slice-simulator`)

---

## Signature

| Testeur | Date | Viewports testes | Navigateurs testes | Resultat |
|---------|------|------------------|--------------------|----------|
| | | | | |

# Prado Itinéraires — Questions pour le client

## Questions bloquantes (à poser en premier)

### 1. Roadmap & priorités
On a identifié plusieurs blocs : site vitrine, espace prescripteur, panel admin, emails automatiques, newsletter, RGPD. **Dans quel ordre on livre ?** Est-ce qu'on part sur un MVP avec l'espace prescripteur d'abord, ou le site public est prioritaire ?

### 2. Gestion des places
Certaines actions ont un nombre de places limité. **Qui définit le nombre de places max par action ?** C'est vous en admin ? C'est fixé à l'avance ? Et quand c'est complet, on bloque les inscriptions ou on affiche juste "complet" ?

### 3. Liste des structures partenaires
À l'inscription, le prescripteur choisit sa structure (association, établissement scolaire, etc.). **Vous avez une liste des structures partenaires ?** Elle évolue souvent ? Il faut pouvoir en ajouter depuis l'admin ?

---

## Questions fonctionnelles importantes

### 4. Workflow de validation des prescripteurs
Quand un prescripteur s'inscrit, il passe en statut "en attente". **Qui valide ? Comment vous êtes notifiés ?** Un email à chaque nouvelle inscription ? Un récap quotidien ? Et si vous refusez, le prescripteur reçoit un message ?

### 5. Emails automatiques — contenu et timing
On prévoit des emails : confirmation d'inscription, rappel J-2, rappel J-1. **Vous voulez valider les textes de ces emails ?** Et l'email de bienvenue pour les nouveaux prescripteurs, il dit quoi exactement ?

### 6. Données des jeunes — niveau de détail
Pour chaque jeune inscrit, on stocke quoi exactement ? **Nom, prénom, date de naissance, adresse — c'est suffisant ? Vous avez besoin d'autres champs** (situation scolaire, référent social, commentaires) ?

### 7. Exports — format et contenu
L'admin peut exporter les données (inscriptions, contacts, newsletter). **Vous avez besoin de quels exports exactement ? CSV suffit ? Quelles colonnes dans chaque export ?**

---

## Questions UX / contenu

### 8. Blog / Actualités
On prévoit une section actualités. **Qui rédige les articles ? À quelle fréquence ?** C'est une personne de votre équipe ou un prestataire externe ?

### 9. Homepage — contenu définitif
La page d'accueil comporte une dizaine de sections (héro, programmes, impact, témoignages, FAQ, partenaires…). **Vous avez le contenu définitif (textes, chiffres, témoignages, logos partenaires) ou c'est à créer ?**

### 10. Documents téléchargeables
Il est prévu une section documents/PDF. **Vous avez déjà ces documents ? Combien environ ? Qui les met à jour ?**

---

## Questions réglementaires

### 11. RGPD — DPO et mentions légales
On gère des données de mineurs, c'est sensible. **Vous avez un DPO (délégué à la protection des données) ? Les mentions légales et la politique de confidentialité sont rédigées ou c'est à nous de fournir un modèle ?**

### 12. Consentement cookies
On utilise un outil d'analyse anonyme (Clarity). **Vous voulez un bandeau cookies classique (accepter/refuser) ou juste une mention informative ?**

---

## Questions techniques (à formuler simplement)

### 13. Nom de domaine & hébergement
**Vous avez déjà un nom de domaine ?** On héberge sur une infrastructure moderne (serverless), il n'y a rien à gérer de votre côté.

### 14. Accès email pour l'envoi
Les emails (confirmations, rappels) partent avec quelle adresse ? **noreply@prado-itineraires.fr ? contact@... ?** Vous avez un domaine email configuré ?

### 15. Analytics
**Vous voulez suivre la fréquentation du site ?** On peut intégrer un outil d'analyse respectueux de la vie privée. Vous avez un compte Google Analytics existant ?

---

> Les 5 premières questions sont les plus critiques — sans réponse, on ne peut pas avancer sereinement. Le reste peut se clarifier au fil du développement.

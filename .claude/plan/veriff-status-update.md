# Plan : Mise à jour du statut de vérification Veriff

## Problème

Après que l'utilisateur complète la vérification d'identité via Veriff, rien ne change visuellement dans la fiche jeune. Le badge reste sur "Non vérifiée".

## Analyse de la cause racine

Le flux actuel a un **chaînon manquant** entre le webhook et le frontend :

```
1. User clique "Vérifier"       → iframe Veriff s'ouvre        ✅
2. User complète la vérification → status = 'submitted'         ✅
3. Veriff envoie webhook         → identity_verified = true     ✅
4. Frontend rafraîchit les données → ???                        ❌ MANQUANT
```

Le composable `useVeriff` écoute les événements client (SUBMITTED, FINISHED) mais ne déclenche **aucun rafraîchissement** des données du jeune stockées dans `useAuth`. Le composable `useAuth` charge les jeunes une seule fois au login.

## Solution

### Approche : Polling post-soumission + rafraîchissement des données

Après l'événement SUBMITTED/FINISHED de Veriff :
1. Créer un endpoint léger pour vérifier le statut
2. Poller ce endpoint toutes les 5s pendant 2 min max
3. Quand `identity_verified = true`, rafraîchir les données jeune et afficher un toast

### Étape 1 : Endpoint de statut vérification

**Fichier** : `server/api/jeunes/[id]/verification-status.get.ts` (nouveau)

- Authentification requise
- Vérifie la propriété du jeune (ownership)
- Retourne `{ identityVerified: boolean }`
- Utilise le admin client pour bypass RLS

### Étape 2 : Ajouter le polling dans `useVeriff`

**Fichier** : `composables/useVeriff.ts` (modifier)

- Ajouter un callback optionnel `onVerified` au composable
- Après SUBMITTED : démarrer un polling (`setInterval` 5s, max 24 tentatives = 2 min)
- Quand `identityVerified === true` : arrêter le polling, appeler `onVerified()`
- Nettoyer l'interval dans `onUnmounted`

### Étape 3 : Connecter le polling au rafraîchissement des données

**Fichier** : `pages/espace/jeunes/[id].vue` (modifier)

- Passer un callback `onVerified` à `useVeriff` qui appelle `refreshData()` de `useAuth`
- Afficher un toast de succès quand la vérification est confirmée

### Fichiers impactés

| Fichier | Opération | Description |
|---------|-----------|-------------|
| `server/api/jeunes/[id]/verification-status.get.ts` | Créer | Endpoint léger pour checker `identity_verified` |
| `composables/useVeriff.ts` | Modifier | Ajouter polling post-soumission + callback onVerified |
| `pages/espace/jeunes/[id].vue` | Modifier | Connecter onVerified → refreshData + toast |

### Risques

| Risque | Mitigation |
|--------|------------|
| Webhook Veriff retardé > 2 min | Le polling s'arrête, mais le prochain chargement de page montrera le bon statut |
| Requêtes excessives | Max 24 requêtes (2 min), endpoint léger (1 champ) |
| Race condition (refresh pendant polling) | Le polling vérifie un boolean, pas de side effects |

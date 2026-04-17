---
type: concept
updated: 2026-04-17
---

# Flux d'authentification prescripteur

Parcours email-first : l'utilisateur saisit d'abord son email, la plateforme détermine s'il s'agit d'un nouveau ou d'un existant.

## Parcours

```
Email → check existence
  ├─ nouveau  → formulaire inscription (prénom, nom, structure, fonction, mot de passe)
  │             → signUp Supabase → POST /api/complete-profile
  │             → prescripteur.status = pending
  │             → équipe Prado notifiée
  │             → validation manuelle
  │                 ├─ approved → accès complet
  │                 └─ rejected → accès bloqué
  └─ existant → mot de passe OU magic link → session
```

## Méthodes d'auth supportées

- **Email + mot de passe** (6 caractères min).
- **Magic link** (OTP via email, Supabase Auth).
- **Réinitialisation** de mot de passe par email.

Pas de FranceConnect en V1 (évolution potentielle V2).

## États `status` côté `prescripteurs`

| Statut | Accès dashboard | Ajout de jeune | Inscription action |
|---|---|---|---|
| `pending` | Lecture seule | ❌ bloqué | ❌ bloqué |
| `approved` | Complet | ✅ | ✅ |
| `rejected` | Bloqué (message d'erreur) | — | — |

## Rôle `admin`

Champ `role` sur la même table (`prescripteur` | `admin`). **Jamais** auto-attribué : attribution uniquement par l'équipe technique (modification directe côté DB ou via Service Role).

## Sécurité

- Mots de passe hashés via Supabase Auth (bcrypt).
- Rate limiting sur endpoints login (Cloudflare + Supabase).
- Brute-force : blocage temporaire après tentatives échouées.
- Sessions : JWT avec expiration et refresh automatique.
- Protection CSRF sur les mutations, CORS limité au domaine prod.

## Middleware Nuxt

- `auth.ts` — redirige les routes protégées si pas de session.
- `admin.ts` — redirige si utilisateur non admin.
- `requireAdmin` (utilitaire serveur) — vérifie le rôle côté API.

## Voir aussi

- [[concepts/rls-isolation]] — ce qui se passe **après** l'auth.
- [[entities/utilisateurs]] — description fonctionnelle des rôles.

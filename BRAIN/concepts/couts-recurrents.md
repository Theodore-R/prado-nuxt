---
type: concept
updated: 2026-04-17
---

# Coûts récurrents (à la charge du client)

Tous les comptes des services tiers sont **au nom de l'Association Le Prado**. Facturation directe fournisseur → client. Théodore configure puis transfère les accès.

## Tableau des coûts mensuels

| Service | Au lancement | À maturité | Détail |
|---|---|---|---|
| **Supabase** Pro | **25 €** | 25 € + qq € | Plan Pro **requis en prod** (plan free met en pause après 7j d'inactivité). 8 Go, 100k users, sauvegardes quot. Au-delà : +0,125 €/Go |
| **Vercel** | 0 € | 20 € | Plan free suffisant au lancement (100 Go bande passante). Pro = 1 To |
| **Prismic** | 0 € | 7 € | Starter gratuit (1 utilisateur). Starter payant = 3 utilisateurs |
| **Resend** | 0 € | 20 € | Gratuit jusqu'à 3000 emails/mois. Pro = 50k/mois |
| **Mailchimp** | 0 € | 13 € | Gratuit jusqu'à 500 contacts. Essentials ~13 € (500–2500) |
| **Cloudflare** | 0 € | 0 € | Plan free suffisant (DDoS, WAF, CDN, SSL). Pro = 20 € si règles WAF avancées |
| **Microsoft Clarity** | 0 € | 0 € | 100 % gratuit, sans limite |
| **Domaine** | 0 € | 0 € | Sous-domaine `itineraires.le-prado.fr` (DNS Prado existant) |
| **Total** | **~25 €/mois** | **~65–85 €/mois** |

## Phasage

```
Lancement (~10 presc, ~50 jeunes)       →  25 €/mois
Croissance (~50 presc, ~300 jeunes)      →  25–52 €/mois
Maturité (~200 presc, ~1000+ jeunes)     →  65–85 €/mois
```

## HDS — économie réalisée

L'abandon des données de santé ([[concepts/hds-historique|voir page HDS]]) élimine **~30–50 €/mois** d'hébergement HDS qui étaient prévus.

## Ce qui n'est **pas** inclus

- Veriff (retiré V1) — aurait coûté ~1 €/vérification, soit ~50 €/an pour 50 jeunes.
- Prestation DPO dédiée (retirée, dispositif mutualisé Fondation).

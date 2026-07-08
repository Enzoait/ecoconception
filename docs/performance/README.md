# Rapport de performance — Tests de charge k6 Cloud

## Résumé

Objectif : mesurer et réduire la consommation CPU d'une fonction énergivore dans l'application Next.js, puis comparer les résultats dans **Grafana Cloud (Drilldown > Profiles)**.

| Étape | Route testée | Résultat k6 Cloud | Métriques locales (10 VUs, 30 s) |
|---|---|---|---|
| **Avant (baseline)** | `/api/reports/aggregate/slow` | [Run 8063266](https://niftymanatee1052.grafana.net/a/k6-app/runs/8063266) | avg **479 ms**, p(95) **1.92 s**, 207 req |
| **Après (optimisé)** | `/api/reports/aggregate` | [Run 8063295](https://niftymanatee1052.grafana.net/a/k6-app/runs/8063295) | avg **125 ms**, p(95) **373 ms**, 274 req |
| **Cache Public / Privé** | `/api/vehicles` + `/api/cart` | check local réussi (24/24) | — |

**Gain mesuré localement :**

- Temps moyen : **−74 %** (479 ms → 125 ms)
- p(95) : **−81 %** (1.92 s → 373 ms)
- Débit : **+32 %** (207 → 274 requêtes)

## 1. Fonction énergivore testée

Route ajoutée : `GET /api/reports/aggregate/slow`

Cette route effectue un calcul agressif volontaire :

- Deep clone JSON de chaque véhicule à chaque itération (`JSON.parse(JSON.stringify(...))`).
- Boucles imbriquées sur le catalogue entier.
- Parsing répété de `specs.power` avec regex.
- Fonction récursive sans mémoïsation (`exclusivityIndex`).

## 2. Optimisation appliquée

Route optimisée : `GET /api/reports/aggregate`

- **Cache applicatif TTL** de 30 s via `lib/cache.ts`.
- **MongoDB aggregation** pour le groupage par catégorie.
- **Calcul en une seule passe** en JavaScript, sans deep-clone.
- **Projection MongoDB** : seuls les champs nécessaires sont rapatriés.
- **Headers publics** : `Cache-Control: public, max-age=30, s-maxage=30`.

## 3. Gestion du cache Public vs Privé

| Route | Type | Header `Cache-Control` | Comportement attendu |
|---|---|---|---|
| `/api/vehicles` | **Public** | `public, max-age=60, s-maxage=60` | Doit faire un **HIT** après le premier appel |
| `/api/cart` | **Private** | `private, no-store, no-cache, must-revalidate` | Doit faire **MISS / BYPASS**, jamais HIT |

### Vérification locale (k6 local)

```bash
k6 run -e PUBLIC_APP_URL=https://ecoconception-rust.vercel.app k6/cache-local-check.js
```

Résultat : **24 checks / 24 réussis**.

- Public `/api/vehicles` : retourne bien `Cache-Control: public` et passe en `HIT` au deuxième appel.
- Privé `/api/cart` : retourne `Cache-Control: private, no-store`, jamais `HIT`, toujours `MISS`/`BYPASS`.

## 4. Profiling Pyroscope / Grafana Cloud Drilldown

L'intégration Pyroscope est configurée et déployée :

- Package installé : `@pyroscope/nodejs`
- Initialisation : `lib/pyroscope.ts`, appelée dans `instrumentation.ts` (pas dans `next.config.ts`, qui ne s'exécute qu'au build)
- Variables d'environnement Vercel configurées en production :
  - `PYROSCOPE_ENABLED=true`
  - `PYROSCOPE_SERVER_URL=https://profiles-prod-eu-west-2.grafana.net`
  - `PYROSCOPE_USER=1714687`
  - `PYROSCOPE_API_TOKEN=<token avec scopes profiles:read profiles:write>`

### Comment voir la comparaison Avant / Après dans Grafana Cloud

1. Ouvrir [Grafana Cloud](https://niftymanatee1052.grafana.net).
2. Aller dans **Drilldown > Profiles**.
3. Sélectionner l'application `ecoconception-rust`.
4. Fenêtre baseline : autour de **15:32 - 15:35 UTC+2, 08/07/2026** (période du run 8063266 sur `/api/reports/aggregate/slow`).
5. Fenêtre optimisée : autour de **15:36 - 15:39 UTC+2, 08/07/2026** (période du run 8063295 sur `/api/reports/aggregate`).
6. Comparer :
   - **Flamegraph JS** : réduction des fonctions `baselineAggregate` / `parsePower` / `exclusivityIndex` dans la version optimisée.
   - **Métrique CPU:wall** : baisse du temps CPU passé dans la route aggregate.

## 5. Lien des runs k6 Cloud

- **Baseline** : https://niftymanatee1052.grafana.net/a/k6-app/runs/8063266
- **Optimisé** : https://niftymanatee1052.grafana.net/a/k6-app/runs/8063295

## 6. Commandes pour reproduire

```bash
# Baseline (cloud, 50 VUs / 2 min)
k6 cloud run -e PUBLIC_APP_URL=https://ecoconception-rust.vercel.app -e AGGREGATE_ENDPOINT=/api/reports/aggregate/slow k6/aggregate-load-test.js

# Optimisé (cloud, 50 VUs / 2 min)
k6 cloud run -e PUBLIC_APP_URL=https://ecoconception-rust.vercel.app k6/aggregate-load-test.js

# Comparaison rapide en local (10 VUs / 30 s)
k6 run -e PUBLIC_APP_URL=https://ecoconception-rust.vercel.app -e AGGREGATE_ENDPOINT=/api/reports/aggregate/slow k6/aggregate-local-compare.js
k6 run -e PUBLIC_APP_URL=https://ecoconception-rust.vercel.app k6/aggregate-local-compare.js

# Cache local
k6 run -e PUBLIC_APP_URL=https://ecoconception-rust.vercel.app k6/cache-local-check.js
```

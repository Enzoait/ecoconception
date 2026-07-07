# Tests de charge k6 Cloud

## Prérequis

- k6 CLI installé : <https://grafana.com/docs/k6/latest/set-up/install-k6/>
- Authentification k6 Cloud : `k6 login cloud --token $K6_CLOUD_TOKEN`
- Variables d'environnement :
  - `PUBLIC_APP_URL` : URL de production/preview Vercel (ex. `https://mon-app.vercel.app`)
  - `K6_CLOUD_PROJECT_ID` : identifiant du projet k6 Cloud (défaut : `8021352`)
  - `K6_CLOUD_TOKEN` : token d'API k6 Cloud (utilisé par `k6 login cloud`)

## Test 1 : charge CPU optimisée sur `/api/reports/aggregate`

```bash
k6 cloud run -e PUBLIC_APP_URL=https://mon-app.vercel.app k6/aggregate-load-test.js
```

Lance 50 VUs pendant 2 minutes sur la route agrégée optimisée. Objectifs :

- p(95) < 800 ms
- Taux d'erreur < 1 %

## Test 1b : charge CPU baseline sur `/api/reports/aggregate/slow`

```bash
k6 cloud run -e PUBLIC_APP_URL=https://mon-app.vercel.app -e AGGREGATE_ENDPOINT=/api/reports/aggregate/slow k6/aggregate-load-test.js
```

Mêmes paramètres, mais cible le chemin volontairement gourmand. Cela permet de comparer Avant/Après sans redéployer.

## Test 2 : état du cache Public vs Privé

```bash
k6 cloud run -e PUBLIC_APP_URL=https://mon-app.vercel.app k6/cache-state-test.js
```

Vérifie :

- `/api/vehicles` : header `Cache-Control: public` et un `HIT` après le premier appel.
- `/api/cart` : header `Cache-Control: private, no-store` et jamais de `HIT` (PASS/MISS/BYPASS).

## Workflow Avant / Après (même déploiement)

1. Lancer `k6/aggregate-load-test.js` avec `AGGREGATE_ENDPOINT=/api/reports/aggregate/slow` → **Run A (baseline)**.
2. Lancer `k6/aggregate-load-test.js` avec `AGGREGATE_ENDPOINT=/api/reports/aggregate` → **Run B (optimisé)**.
3. Comparer les deux runs dans Grafana Cloud Drilldown > Profiles.

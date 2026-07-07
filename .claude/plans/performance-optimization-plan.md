# Plan : Tests de charge k6 Cloud + optimisation CPU + preuve Grafana Cloud

## Objectif

Ajouter une fonction publique gourmande en CPU, la stresser avec **k6 Cloud**, l'optimiser concrètement, puis relancer exactement le même test pour mesurer le gain. Valider via **Grafana Cloud Drilldown > Profiles** (flamegraph JS + CPU:wall). Enfin, démontrer la maîtrise du cache : route **Public = HIT**, route **Private = PASS/MISS**.

## Hypothèses & prérequis confirmés

- URL de production/preview Vercel à fournir par l'utilisateur avant implémentation.
- Projet k6 Cloud existant : `projectID: 8021352` (déjà présent dans `script.js`).
- Grafana Cloud + Pyroscope déjà configurés ; tokens présents dans `.env`.

## 1. Fonction énergivore à ajouter

### Nouvelle route : `app/api/reports/aggregate/route.ts`

- Endpoint public `GET /api/reports/aggregate`.
- Charge tout le catalogue depuis MongoDB.
- Calcule des statistiques complexes (valeur totale, répartition par catégorie, percentiles de prix, corrélations factice prix/puissance) avec un algorithitme **volontairement inefficient** :
  - Boucles imbriquées sur la liste des véhicules.
  - `JSON.parse(JSON.stringify(vehicle))` à chaque itération (gros JSON).
  - Conversion de specs.power en entier par regex coûteuse.
  - Calcul récursif d'un indice "exclusivité" sans mémoïsation.
- Retourne un gros payload JSON.

Cette route est CPU-bound et apparaîtra clairement dans le flamegraph Pyroscope.

## 2. Optimisation à appliquer

### Version initiale (Baseline)

- Algorithme naïf O(n²), deep-clone JSON, parsing répété.

### Version optimisée

- **Cache applicatif** : ajouter un cache LRU en mémoire (Map TTL) de 30 s pour `/api/reports/aggregate` ; le catalogue public est stable et lis intensivement.
- **Refactoring** : calcul en une seule passe (`for ... of`), sans deep-clone.
- **MongoDB aggregation** : déléguer le groupage par catégorie et le tri au moteur MongoDB ; ne rapatrier que les champs nécessaires (`brand`, `price`, `category`, `specs.power`).
- **Remplacement de librairie lourde** : aucune librairie lourde ajoutée ; on élimine le coût de `JSON.parse(JSON.stringify(...))` et les regex imbriquées.
- **Header cache public** : `Cache-Control: public, max-age=30, s-maxage=30` pour bénéficier du cache CDN/Edge.

## 3. Scripts k6 Cloud

### Fichiers créés

- `k6/aggregate-load-test.js` : test de charge ciblant `/api/reports/aggregate`.
  - Mêmes options avant/après : 50 VUs, 2 min, seuils p(95)<800 ms et taux d'erreur < 1 %.
  - Vérifie le statut HTTP 200 et la présence du champ `totalValue`.
- `k6/cache-state-test.js` : test cache public vs privé.
  - `/api/vehicles` : attend un header `x-vercel-cache: HIT` après le premier appel.
  - `/api/cart` : attend un `x-vercel-cache: MISS` ou `BYPASS` (jamais `HIT`) car les données utilisateur ne doivent pas être servies par le cache.
- `k6/README.md` : commandes `k6 cloud run` et `k6 run --cloud`.

### Déroulement

1. Déployer la version **baseline**.
2. Lancer `k6 cloud run k6/aggregate-load-test.js` → run A.
3. Déployer la version **optimisée**.
4. Relancer exactement le même script k6 → run B.

## 4. Preuve Grafana Cloud

- Ouvrir Grafana Cloud → Drilldown → Profiles.
- Comparer la période du run A et du run B.
- Capturer :
  - Flamegraph JS : réduction de la hauteur/largeur de la fonction `aggregateStats`.
  - Métrique **CPU:wall** : baisse du temps CPU passé dans la route.
- Ces captures seront ajoutées dans le rapport final (fichiers images dans `docs/performance/`).

## 5. Gestion de l'état : Public HIT / Private PASS-MISS

### Route publique `/api/vehicles`

- Ajouter `Cache-Control: public, max-age=60, s-maxage=60`.
- k6 vérifie `x-vercel-cache: HIT` au deuxième appel (miss attendu au premier).

### Route privée `/api/cart`

- Ajouter explicitement `Cache-Control: private, no-store, must-revalidate`.
- k6 vérifie que le header `x-vercel-cache` vaut `MISS` ou `BYPASS` (jamais `HIT`).
- La route reste protégée par cookie `luxe_auth` ; un appel non authentifié retourne 401.

## 6. Fichiers modifiés / créés

| Fichier | Action | Raison |
|---|---|---|
| `app/api/reports/aggregate/route.ts` | Créer | Fonction CPU-bound baseline + optimisée |
| `app/api/vehicles/route.ts` | Modifier | Cache-Control public pour HIT |
| `app/api/cart/route.ts` | Modifier | Cache-Control private/no-store pour PASS/MISS |
| `lib/cache.ts` | Créer | Helper cache LRU TTL réutilisable |
| `k6/aggregate-load-test.js` | Créer | Test de charge reproductible k6 Cloud |
| `k6/cache-state-test.js` | Créer | Validation cache public/privé |
| `k6/README.md` | Créer | Documentation d'exécution |
| `docs/performance/README.md` | Créer | Procédure + captures Avant/Apres |
| `package.json` | Modifier | Ajouter `test:load` et éventuellement `lru-cache` |
| `.env.example` | Modifier | Documenter `K6_CLOUD_TOKEN`, `PUBLIC_APP_URL` |

## 7. Livrables

- Code optimisé et déployé.
- Deux runs k6 Cloud avec IDs de run.
- Captures Grafana Cloud Avant/Apres.
- Résultat du test cache HIT vs PASS/MISS.

## Question ouverte avant démarrage

**URL de production/preview Vercel à cibler** : merci de fournir l'URL publique pour que les scripts k6 pointent sur le bon déploiement.

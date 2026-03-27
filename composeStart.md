# From the repo root fishStudio, use:

```
docker compose build
docker compose up -d
```

docker system prune -a --volumes

docker builder prune -a



# If you want to rebuild without old cache:

docker compose build --no-cache
docker compose up -d
To check running services:

docker compose ps
To watch logs:

docker compose logs -f
To watch one service:

docker compose logs -f product-service
docker compose logs -f api-gateway
docker compose logs -f meilisearch
To stop everything:

docker compose down
To stop and remove volumes too:

docker compose down -v
Recommended test flow:

Build:
docker compose build
Start:
docker compose up -d
Verify:
docker compose ps
docker compose logs -f meilisearch
docker compose logs -f product-service
docker compose logs -f api-gateway
Open:
app/gateway: http://localhost
meilisearch: http://localhost:7700
Important:

Make sure .env.prod exists before docker compose up.
Inside .env.prod, MEILISEARCH_HOST should be:
MEILISEARCH_HOST=http://meilisearch:7700
If you want, I can next give you a quick “expected env checklist” for Compose so you can avoid startup failures on the first run.



meili_data is just a persistent volume for the Meilisearch container. It isn’t referenced anywhere in the code or build scripts, and you only need it if you want Meilisearch to keep its indexes between container restarts. When you run docker compose up, the getmeili/meilisearch:latest image will automatically initialize /meili_data inside the container and store its data there; if the host directory doesn’t exist yet, Docker will create it for you. You only need to keep the volume entry if you want search indexes to survive a restart (the image doesn’t rebuild them on every start), otherwise you can drop the volume and let Meilisearch use its internal storage.




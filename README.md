# Moview frontend

## Local setup

```bash
npm install
```

Cognito/AppSync configuration:
copy `.env.example` to `.env.local` and set these values from the `moview-api` stack outputs:

```bash
VITE_COGNITO_USER_POOL_ID=<MoviewUserPoolId>
VITE_COGNITO_CLIENT_ID=<MoviewUserPoolClientId>
VITE_APPSYNC_GRAPHQL_URL=<MoviewGraphQLApiUrl>
```

Run the development server locally:

```bash
npm run dev
```

Run the development server directly on the local network:

```bash
npm run dev -- --host 0.0.0.0
```

## Docker Compose development server

The Compose service keeps the Vite development server running when the SSH
session closes. It binds only to the server's `192.168.1.124` LAN address.

Install the Docker Compose plugin if `docker compose version` is unavailable:

```bash
sudo apt update
sudo apt install docker-compose-v2
```

If your user cannot access the Docker socket, add it to the `docker` group and
then sign out and back in:

```bash
sudo usermod -aG docker "$USER"
```

Build and start the server in the background:

```bash
docker compose up -d --build
```

Open the site from another machine on the same network:

```text
http://192.168.1.124:5173
```

Inspect and control the service:

```bash
docker compose ps
docker compose logs -f frontend
docker compose restart frontend
docker compose stop frontend
docker compose start frontend
docker compose down
```

Stopping log output with `Ctrl+C` does not stop the container. Source files are
mounted into the container, so Vite hot reload continues to work. If package
dependencies change, rebuild the image and recreate the dependency volume:

```bash
docker compose down -v
docker compose up -d --build
```

If the server's LAN address changes, update the host side of the `ports` mapping
in `compose.yaml`.

---

From the frontend directory:

cd /home/travis/workspace/moview
docker compose restart frontend

Check status:

docker compose ps

View logs:

docker compose logs -f frontend

Use Ctrl+C to stop watching logs; the container keeps running.

If you changed Dockerfile.dev, compose.yaml, or dependencies:

docker compose up -d --build

If package.json or package-lock.json changed and dependencies seem stale:

docker compose down -v
docker compose up -d --build

The last option recreates the generated node_modules volume. It does not delete your source code.

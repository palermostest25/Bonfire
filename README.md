![Watch parties for you and them](public/assets/banner.png)

# Private peer-to-peer watch parties for two.

## How it works & Web RTC

It runs entirely peer-to-peer using WebRTC.  
Because WebRTC is peer-to-peer, the two browsers must exchange connection details (SDP offers and answers) to find each other. Bonfire's server briefly holds those details so the two browsers can find each other.

## Privacy

Signaling is entirely ephemeral, and once the connection is established, all traffic goes directly between the two browsers.  
No data is stored anywhere except for your nickname, which you enter at the start, before joining a call.

## Screens

![Join Screen](public/screenshots/join.png)

![Details Screen](public/screenshots/code.png)

![Call Screen](public/screenshots/call.png)

## Experience

Experience Bonfire [here.](https://usebonfire.vercel.app/)

## Activities

| Activity | Description |
|----------|-------------|
| **YouTube** | Watch YouTube videos together, in sync. |
| **Screen Share** | Share your screen with the room. |
| **Spades of Streaming** | Browse and watch movies together on Spades of Streaming, my streaming service. |
| **Whiteboard** | Doodle and sketch together in real time. |
| **Photobooth** | Cut yourselves out and drop into the same background, almost like you're there together. |
| **Study** | Study together using a synced Pomodoro timer. |
| **Reminds Me of You** | Send them a song that reminds you of them. Built by [niyikes](https://github.com/niyikes/reminds-me-of-you). |
| **Wordle** | Pick secret words for each other and see who can crack the other's one first. |

## AI Usage

- debugging
- css
- prototyping video calls
- photobooth
- whiteboard bugs
- help with chimes
- wordle animations

Made with ❤️ by Ary<br>
Love to the point of creation

## Self-hosting

Bonfire runs as one Docker image, `ghcr.io/palermostest25/bonfire:latest`, built for amd64 and arm64 on every push to `main`. It serves the app and its own signaling endpoint. There's no database and nothing to configure.

> [!IMPORTANT]
> Bonfire must be served over **HTTPS**. Browsers block the camera and mic on plain `http://` (except `localhost`).

### Option 1: Cloudflare Tunnel or your own reverse proxy

Use this if you already have a tunnel or reverse proxy.

```sh
curl -O https://raw.githubusercontent.com/palermostest25/Bonfire/main/docker-compose.cloudflare.yml
docker compose -f docker-compose.cloudflare.yml up -d
```

Then, in Cloudflare, add a published application route for your domain pointing to `http://<host-ip>:3080`. If port `3080` is taken, change it in the compose file.

### Option 2: Caddy (standalone)

Caddy gets and renews the HTTPS certificate for your domain automatically. Point your domain's DNS at the host, and make sure ports 80 and 443 are reachable.

```sh
curl -O https://raw.githubusercontent.com/palermostest25/Bonfire/main/docker-compose.caddy.yml
echo "DOMAIN=bonfire.example.com" > .env
docker compose -f docker-compose.caddy.yml up -d
```

### Updating

```sh
docker compose -f <compose-file> pull
docker compose -f <compose-file> up -d
```

### Healthcheck

`GET /healthz` returns `200 ok`. The image includes a Docker healthcheck, so `docker ps` shows the container as `healthy`.

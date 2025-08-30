<p align="center">
  <img width="200" height="200" alt="Moon" src="https://github.com/user-attachments/assets/e38843c0-22dd-4dbc-985e-eab77277acc4" />
</p>

<h1 align="center">MoonCode API</h1>
<p align="center">The API for the MoonCode app<br/>
<a href="https://api.mooncode.cc">api.mooncode.cc</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.0.1-yellow">  
  <img src="https://img.shields.io/badge/LICENSE-MIT-yellow">
</p>

## Description

This project is the API used to power the other main packages in the monorepo: [dashboard](../dashboard) and [vscode-extension](../vscode-extension).
It is built on top of [Nestjs](https://nestjs.com/) and powered by [trpc](https://trpc.io/).

## Project setup

To run the API, you need to first clone the repository

```bash
git clone https://github.com/Friedrich482/mooncode-monorepo.git
```

Then `cd` in the API

```bash
cd apps/api
```

Then install dependencies

```bash
npm install
```

Before continuing you'll need some environment variables: `JWT_TOKEN` and `DATABASE_URL`.

### Environment variables

- `NODE_ENV`:

  ```bash
  NODE_ENV=production
  ```

- `DATABASE_URL`, you can use:

  ```bash
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mooncode"
  ```

  [compose.yaml](./compose.yaml)

  (Local database set up by docker compose as a docker volume. If you don't have docker installed, follow that link to the installation: [Docker](https://docs.docker.com/get-started/get-docker/))

- `JWT_TOKEN`: Generate an SSL 64-character hexadecimal string.

  ```bash
  openssl rand -hex 32
  ```

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: you get them when you create credentials in the Google Cloud Console
- `GOOGLE_REDIRECT_URI`:

  ```bash
  GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
  ```

## Compile and run the project

Compile :

```bash
npm run build
```

Then start:

```bash
npm run start:prod
```

## Deployment

The API is currently deployed on [api.mooncode.cc](https://api.mooncode.cc).

## Containerization

To dockerize the application, you need to place yourself at the root of the monorepo, then

```bash
docker build -t mooncode-api -f apps/api/Dockerfile --progress=plain .
```

And to run a container called `mooncode-api-container` :

```bash
docker run -p 3000:3000 --name mooncode-api-container --env-file apps/api/.env mooncode-api:latest
```

## License

[MIT](/LICENSE) License &copy; 2025

<p align="center">
  <img width="200" height="200" alt="Moon" src="https://github.com/user-attachments/assets/e38843c0-22dd-4dbc-985e-eab77277acc4" />
</p>

<h1 align="center">MoonCode Website</h1>
<p align="center">The main website for the MoonCode app<br/>
<a href="https://mooncode.cc">mooncode.cc</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.0.1-yellow">  
  <img src="https://img.shields.io/badge/LICENSE-MIT-yellow">
</p>

## Description

This project is the website (marketing site) of the MoonCode project.
It is built on top of [Nextjs](https://nextjs.org/).

## Project setup

To run the website, you need to first clone the repository

```bash
git clone https://github.com/Friedrich482/mooncode-monorepo.git
```

Then `cd` in the `web` folder

```bash
cd apps/web
```

Then install dependencies

```bash
npm install
```

### Development

Run

```bash
npm run dev
```

and open `http://localhost:3001`

### Production

To build for production, build with:

```bash
npm run build
```

and start the built app with:

```bash
npm run start
```

## Deployment

The website is currently deployed on [mooncode.cc](https://mooncode.cc).

## Containerization

To dockerize the application, you need to place yourself at the root of the monorepo, then

```bash
docker build -t mooncode-web -f apps/web/Dockerfile --progress=plain .
```

And to run a container called `mooncode-web-container` :

```bash
docker run -d -p 3002:8080 --name mooncode-web-container mooncode-web
```

## License

[MIT](/LICENSE) License &copy; 2026

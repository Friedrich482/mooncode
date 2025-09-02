<p align="center">
  <img width="200" height="200" alt="Moon" src="https://github.com/user-attachments/assets/e38843c0-22dd-4dbc-985e-eab77277acc4" />
</p>

<h1 align="center">MoonCode Dashboard</h1>
<p align="center">The (local) dashboard for the MoonCode app<br/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.0.1-yellow">  
  <img src="https://img.shields.io/badge/LICENSE-MIT-yellow">
</p>

## Description

This project is the dashboard used to display analytical data locally. It is served by the [vscode-extension](../vscode-extension) on `http://localhost:4208` (or any near available port). Built on top of [Vite](https://vite.dev/) and powered by [trpc](https://trpc.io/).

## Project setup

To run the dashboard, you need to first clone the repository:

```bash
git clone https://github.com/Friedrich482/mooncode-monorepo.git
```

Then `cd` in the dashboard:

```bash
cd apps/dashboard
```

Then install dependencies:

```bash
npm install
```

### Development

Before continuing you'll need some environment variables: `VITE_API_URL`, `VITE_LOGIN_URL` and `VITE_REGISTER_URL`.
Create a `.env.development` :

```bash
VITE_API_URL="http://localhost:3000/trpc"
VITE_LOGIN_URL="http://localhost:3000/trpc/auth.signInUser"
VITE_REGISTER_URL="http://localhost:3000/trpc/auth.registerUser"
VITE_AUTH_GOOGLE_URL="http://localhost:3000/auth/google"
VITE_LOGOUT_URL="http://localhost:3000/trpc/auth.logOut"
```

So to properly run the dashboard in development, the [API](../api) must be also running on `http://localhost:3000`. Then run

```bash
npm run dev
```

and open `http://localhost:4208` (or the near available port).

### Production

To build for production:
Create a `.env.production` with the same variables as in development and adapt them depending of your API:

```bash
VITE_API_URL=...
VITE_LOGIN_URL=...
VITE_REGISTER_URL=...
```

Then build with:

```bash
npm run build
```

## License

[MIT](/LICENSE) License &copy; 2025

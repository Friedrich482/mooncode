# MoonCode

 <p align="center">
  <img width="200" height="200" alt="Moon" src="https://github.com/user-attachments/assets/e38843c0-22dd-4dbc-985e-eab77277acc4" />
</p>

<p align="center">An application that tracks and monitors you coding time with a detailled summary<br/>
<a href="">link_to_website</a> (coming soon)
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.0.1-yellow">  
  <img src="https://img.shields.io/badge/LICENSE-MIT-yellow">
</p>

## Description

This project is the monorepo for MoonCode. This is an application to track and get a detailled summary about your coding time, languages, files across any period.

## Features 🚀

- Summary of coding time per day, week, month, year,... and any custom period
- Support for most languages/files extensions
- Breakdown of coding activity per project
- Local dashboard to visualize your data, with extensive filters for a more detailed summary
- All parts (vscode-extension, api, dashboard) of the project can be self-hosted
- Extension Works offline 🔌

### Apps and Packages

- [`api`](./apps/api): a [Nestjs](https://nestjs.com/) application that powers the `extension` and the `dashboard`
- [`dashboard`](./apps/dashboard): a [Vite](https://vite.dev/) application served locally by the extension to visualize the data
- [`vscode extension`](./apps/vscode-extension): the VSCode extension that collects the data
- [`web`](./apps/web): a [Nextjs](https://nextjs.org/) application that is the web site of the project (coming soon)
- [`@repo/common`](./packages/common): all functions, constants and utils shared by the three parts of the project
- [`@repo/trpc`](./packages/trpc): the package that shares trpc types across the project
- [`@repo/ui`](./packages/ui): ui components shared between `dashboard` and `web`

### Useful links

- The API is deployed on [api.mooncode.cc](https://api.mooncode.cc)
- The extension: [https://marketplace.visualstudio.com/items?itemName=Friedrich482.mooncode](https://marketplace.visualstudio.com/items?itemName=Friedrich482.mooncode)
- The dashboard is served by the extension on [http://localhost:4208](http://localhost:4208) or any near available port

### Develop

To start the dev server of all apps at the same time, run

```
cd mooncode
turbo dev # or npm run dev
```

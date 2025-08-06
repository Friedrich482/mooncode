<p align="center">
<img width="128" height="128" alt="moon" src="https://github.com/user-attachments/assets/12d40455-d3f5-4356-842c-6139ee56f456" />

<h1 align="center">MoonCode</h1>
</p>
<p align="center">
MoonCode is an extension that tracks your coding time (like WakaTime) and gives you a detailed summary about all your coding statistics. With MoonCode, developers get the full history of their coding activity.
<a href="https://marketplace.visualstudio.com/items?itemName=Friedrich482.mooncode">https://marketplace.visualstudio.com/items?itemName=Friedrich482.mooncode</a>  
</p>
<p align="center">
  <img src="https://img.shields.io/badge/version-0.0.21-yellow" alt="Extension version 0.0.21">  
  <img src="https://img.shields.io/badge/LICENSE-MIT-yellow" alt="MIT License">
</p>

**⚠️ MoonCode is still in development so breaking changes may happen. But any feedback is welcomed !**

## Features 🚀

- Summary of coding time per day, week, month, year,... and any custom period
- Support for most languages/files extensions
- Breakdown of coding activity per project
- Local dashboard to visualize your data, with extensive filters for a more detailed summary
- All parts (vscode-extension, api, dashboard) of the project can be self-hosted
- Works offline 🔌

## Demo 🖥️

[Screencast from 2025-07-14 15-11-24.webm](https://github.com/user-attachments/assets/a0f58fcb-2983-4760-8bb5-e4b186e97fd8)

## Installation

Look for the extension `MoonCode` on the VSCode marketplace then install it. You'll be prompted to login and when doing so, the extension will automatically start tracking your statistics. To open the dashboard, click on the button displaying the time in your status bar.

## Extension Settings

- General commands
  - `MoonCode.login`: opens the prompt that allows you to login
  - `MoonCode.openDashboard`: opens the dashboard
- Debugging commands (devtools) ⚠️
  - `MoonCode.showCurrentLanguagesData`: show the current languages being tracked in the extension
  - `MoonCode.showCurrentFilesData`: show the current files being tracked in the extension
  - `MoonCode.showInitialFilesData`: show the languages the extension started tracking with when it was first opened
  - `MoonCode.showInitialFilesData`: show the files the extension started tracking when it was started
  - `MoonCode.showGlobalStateData`: show the data being locally stored by the extension

## Release Notes

### 0.0.1

Initial release of MoonCode

### 0.0.2

Fix: activation command

### 0.0.3

Fix: Missing `express` dependency

### 0.0.4

Fix: Copy dashboard build in extension files

### 0.0.5

Chore:

- `README.md` and `CHANGELOG.md` improved
- Reduced the `MAX_IDLE_TIME` constant

## License

[MIT](/LICENSE) License &copy; 2025

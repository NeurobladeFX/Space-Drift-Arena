# Itch.io Publishing Guide for Space Drift Arena

## 1. Prepare Your Game Files

1.  **Locate your project folder**: `e:\Space Drift Arena`
2.  **Verify `index.html`**: Ensure `index.html` is in the root of the folder. Itch.io requires this to start the game.
3.  **Create the ZIP file**:
    *   Select all the following files/folders:
        *   `index.html`
        *   `js/` (folder)
        *   `styles/` (folder)
        *   `assets/` (folder)
        *   `favicon.svg` (if used)
    *   Right-click -> Send to -> Compressed (zipped) folder.
    *   Name it `Space-Drift-Arena-itch.zip`.

> [!IMPORTANT]
> Do NOT include `node_modules`, `server/`, `.git`, or `.vscode` access in the public web build zip. The server code runs separately on Render.

## 2. Publish on Itch.io

1.  **Create a New Project**: Go to [itch.io/game/new](https://itch.io/game/new).
2.  **Title**: Space Drift Arena
3.  **Kind of project**: Choose **HTML** (You have a ZIP file to be played in the browser).
4.  **Pricing**: $0 or Donate.
5.  **Uploads**: Upload your `Space-Drift-Arena-itch.zip` file.
    *   Check **This file will be played in the browser**.
6.  **Embed Options**:
    *   **Dimensions**: 1280 x 720 (or your preferred resolution).
    *   **Mobile Friendly**: Check this if you want it to work on phones (Orientation: Landscape).
    *   **SharedArrayBuffer**: **Do NOT** enable this unless you are using specific high-performance threading (unlikely for this project).
7.  **Details**: Add your description, controls, and screenshots.
8.  **Save & View**: Click "Save & View page".
9.  **Draft to Public**: When ready, change Visibility from *Draft* to *Public*.

## 3. Multiplayer Server Note

Your game connects to: `wss://space-drift-arena.onrender.com` (Production)
*   Ensure your Render server is deployed and running the latest `server.js` code.
*   If you change the server URL, update `js/main.js` line 39 before zipping.

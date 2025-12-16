# Space Drift Arena - Publishing Guide

## Preparing Your Game for Itch.io

### Files to Include in Your ZIP Archive

When publishing to itch.io, you need to create a ZIP file containing only the necessary files for the web build:

1. `index.html` - The main entry point for your game
2. `js/` folder - Contains all JavaScript files
3. `styles/` folder - Contains CSS files
4. `assets/` folder - Contains all game assets (images, sounds, etc.)
5. `favicon.svg` - Game icon (optional)

**Important**: Do NOT include:
- `node_modules/` - These are server-side dependencies
- `server/` - This contains the server code that runs separately
- `.git/` - Version control files
- Any development or configuration files

### Creating the ZIP File

1. Select the following files and folders in your project directory:
   - `index.html`
   - `js/`
   - `styles/`
   - `assets/`
   - `favicon.svg`

2. Right-click and choose "Send to" → "Compressed (zipped) folder"

3. Name the file `Space-Drift-Arena-itchio.zip`

### Uploading to Itch.io

1. Go to [https://itch.io/game/new](https://itch.io/game/new)
2. Fill in the game details:
   - Title: Space Drift Arena
   - Project URL: space-drift-arena (or your preferred URL)
   - Kind of project: HTML
3. Upload your ZIP file (`Space-Drift-Arena-itchio.zip`)
4. In the "Embed options" section:
   - Check "This file will be played in the browser"
   - Set dimensions to 1280x720 (recommended)
   - Orientation: Landscape
   - Do NOT enable SharedArrayBuffer unless specifically needed
5. Add a description, screenshots, and any other details
6. Click "Save & view page"
7. Change visibility from Draft to Public when ready

## Server Deployment

Your game connects to a WebSocket server for multiplayer functionality:
- Production server: `wss://space-drift-arena.onrender.com`
- Local development: `ws://localhost:3000`

Ensure your server is deployed and running before publishing. The server code is in the `server/` directory and needs to be deployed separately to a hosting service like Render.com.

### Deploying the Server to Render.com

1. Create an account at [https://render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the build command to: `npm install`
5. Set the start command to: `npm start`
6. Set the environment variable:
   - Key: `NODE_ENV`
   - Value: `production`
7. Deploy the service

## Testing Your Published Game

After publishing:

1. Visit your game's page on itch.io
2. Click the "Play" button to launch the game in the browser
3. Test both single-player and multiplayer modes
4. Verify that all assets load correctly
5. Check that the connection to the server works properly

## Troubleshooting

### Common Issues

1. **Game doesn't load**: Make sure all required files are included in the ZIP
2. **Multiplayer doesn't work**: Verify the server is running and accessible
3. **Assets missing**: Check that all files in the `assets/` folder are included
4. **JavaScript errors**: Open browser developer tools (F12) to check for errors

### Updating Your Game

To update your game on itch.io:

1. Make your changes locally
2. Create a new ZIP file with the updated files
3. Go to your game's edit page on itch.io
4. Upload the new ZIP file
5. Click "Save"

Remember to test your updates thoroughly before publishing!
# Space Drift Arena - itch.io Publishing Guide

This guide will help you publish Space Drift Arena on itch.io.

## Files to Include in Your ZIP Archive

For your game to work properly on itch.io, you need to include the following files in your ZIP archive:

```
index.html
styles/
  └── main.css
js/
  ├── config.js
  ├── main.js
  ├── Player.js
  ├── BotAI.js
  ├── Camera.js
  ├── Map.js
  ├── Input.js
  ├── UI.js
  ├── Multiplayer.js
  ├── Shop.js
  ├── Matchmaker.js
  ├── Projectile.js
  ├── physics.js
  ├── WeaponPickup.js
  ├── SoundManager.js
  └── assets/
      ├── characters/
      ├── weapons/
      └── sounds/
assets/
  ├── characters/
  ├── weapons/
  └── sounds/
```

**Important Notes:**
- Include all JavaScript files in the `js/` directory
- Include all CSS files in the `styles/` directory
- Include all asset files in the `assets/` directory
- Do NOT include the `server/` directory (that's for your server deployment)
- Do NOT include any `.md` files except this guide if you want to keep it for reference
- Do NOT include any `node_modules/` directories
- Do NOT include any development files or test scripts

## Uploading to itch.io

1. **Create a ZIP archive** containing only the files listed above
2. **Log in to your itch.io account**
3. **Click "Upload new project"**
4. **Fill in the project details:**
   - Project title: Space Drift Arena
   - Project URL: space-drift-arena (or your preferred slug)
   - Classification: HTML5 game
   - Upload the ZIP file you created
5. **In the "Embed options" section:**
   - Kind of project: HTML
   - HTML file: index.html
   - Leave other options as default unless you have specific requirements
6. **Click "Save" and then "View page" to test your game**

## Server Deployment

For multiplayer functionality, you'll need to deploy the server component separately:

1. Deploy the `server/` directory to a hosting provider that supports Node.js (like Render, Heroku, etc.)
2. Make sure to set the appropriate environment variables:
   - `PORT` (usually set automatically by the hosting provider)
   - `REDIS_URL` (if using Redis for production)
3. Update the server URL in `js/main.js` if needed:
   ```javascript
   const matchmakerUrl = isLocal ? 'ws://localhost:3000' : 'wss://your-server-url.com';
   ```

## Testing Your Deployment

After uploading to itch.io:

1. Visit your game page
2. Click the "Run game" button
3. Test both single-player and multiplayer modes
4. For multiplayer testing, you'll need at least two browser tabs or devices

## Troubleshooting

**Common Issues:**

1. **Game doesn't load**: Make sure all required files are included in the ZIP archive
2. **Multiplayer doesn't work**: Verify that your server is deployed and accessible
3. **Assets not loading**: Check browser console for 404 errors and ensure file paths are correct
4. **Audio issues**: Some browsers require user interaction before playing audio

**Browser Console**: Press F12 to open developer tools and check the console for any error messages.

If you encounter any issues, check the browser's developer console for error messages, which can help identify missing files or configuration problems.
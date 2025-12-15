# Space Drift Arena - Deployment Guide

## 🚀 Deployment Options

### Option 1: GitHub Pages (Recommended for Free Hosting)
1. Create a GitHub repository for your game
2. Push your game files to the repository
3. Enable GitHub Pages in repository settings
4. Set source to "main" branch
5. Your game will be live at `https://username.github.io/repository-name`

### Option 2: itch.io (Great for Indie Games)
1. Create an account at https://itch.io
2. Click "Upload a new project"
3. Select "HTML" as the project type
4. Upload all game files
5. Set "index.html" as the launch file
6. Publish your game

### Option 3: Netlify (Professional Free Tier)
1. Sign up at https://netlify.com
2. Drag and drop your game folder to deploy
3. Or connect to your GitHub repository for automatic deployments
4. Customize your domain or use the provided subdomain

## 📦 Files to Include for Deployment
```
├── index.html
├── favicon.ico
├── favicon.svg
├── styles/
│   ├── main.css
│   └── hud-items.css
├── js/
│   ├── main.js
│   ├── Player.js
│   ├── BotAI.js
│   ├── Camera.js
│   ├── Input.js
│   ├── Map.js
│   ├── Matchmaker.js
│   ├── Multiplayer.js
│   ├── Projectile.js
│   ├── Shop.js
│   ├── SoundManager.js
│   ├── UI.js
│   ├── WeaponPickup.js
│   ├── config.js
│   ├── physics.js
│   └── PeerJS library (CDN linked in index.html)
├── assets/
│   ├── characters/
│   ├── ui/
│   ├── weapons/
│   └── sounds/
└── server/ (optional - only needed for matchmaking)
```

## ⚙️ Server Setup (For Multiplayer Matchmaking)

### Requirements:
- Node.js v14+
- npm or yarn

### Setup Steps:
1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. The server will run on port 3000 by default

### Environment Variables:
- `PORT` - Server port (default: 3000)
- `REDIS_URL` - Redis connection URL (optional, for production)

## 🔧 Configuration for Production

### Update PeerJS Configuration in `index.html`:
```html
<!-- For production, use a proper PeerJS server -->
<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>
```

### Update Matchmaking Server URL in `js/main.js`:
```javascript
// Change to your deployed server URL
this.matchmaker = new Matchmaker('wss://your-server-url.com', this.multiplayer, this.ui);
```

## 🎥 Streaming/Live Development Setup

### For Twitch/YouTube Live Coding:
1. Use OBS Studio or Streamlabs OBS
2. Add your browser source pointing to your local development server
3. Recommended resolution: 1920x1080
4. Set FPS to 60 for smooth gameplay

### VS Code Live Server Extension:
1. Install "Live Server" extension by Ritwick Dey
2. Right-click on `index.html` and select "Open with Live Server"
3. Your game will open in the browser at `http://127.0.0.1:5500`

### Chrome Extension - "Go Live":
If you're using a specific "Go Live" Chrome extension:
1. Install the extension from Chrome Web Store
2. Open your game in the browser
3. Click the extension icon to start broadcasting
4. Share the provided link with your audience

## 🔍 Testing Checklist Before Deployment

### Single Player:
- [ ] Physics movement works correctly
- [ ] All weapons function properly
- [ ] Weapon pickups spawn and are collectible
- [ ] Bots behave as expected
- [ ] Health/regen system works
- [ ] Match timer counts down
- [ ] Win/lose conditions work

### Multiplayer:
- [ ] Room hosting works
- [ ] Room joining works with full peer ID
- [ ] Player synchronization is smooth
- [ ] Remote players render correctly
- [ ] Projectiles appear for all players
- [ ] Damage/kill tracking works
- [ ] Match timer syncs between players

### UI/UX:
- [ ] All menu screens are accessible
- [ ] Shop system works correctly
- [ ] Profile/stats update properly
- [ ] Controls are responsive
- [ ] HUD displays correctly
- [ ] Mobile responsiveness (if applicable)

### Performance:
- [ ] Game runs at 60 FPS on target devices
- [ ] Memory usage is stable
- [ ] No console errors
- [ ] Assets load without issues
- [ ] Network bandwidth is reasonable (<30 KB/s per player)

## 🆘 Troubleshooting Common Issues

### Multiplayer Connection Problems:
1. Ensure both players are using the FULL peer ID (36 characters)
2. Check that the matchmaking server is running
3. Verify firewall settings aren't blocking WebRTC
4. Try different browsers (Chrome/Firefox recommended)

### Asset Loading Issues:
1. Check that all file paths are correct
2. Verify image formats are supported (PNG/WebP recommended)
3. Ensure all assets are included in deployment
4. Check browser console for 404 errors

### Performance Problems:
1. Reduce number of simultaneous particles
2. Optimize collision detection with spatial hashing
3. Implement object pooling for projectiles
4. Use requestAnimationFrame for game loop

## 📈 Post-Launch Monitoring

### Analytics Setup:
1. Google Analytics for web traffic
2. Custom event tracking for game actions
3. Error reporting with Sentry or similar services
4. Performance monitoring with Web Vitals

### Community Building:
1. Create a Discord server for player community
2. Set up social media accounts
3. Engage with players through forums/reddit
4. Collect feedback for future updates

## 🎉 Congratulations!

Your game is now ready for deployment and live streaming! Remember to:

1. Test thoroughly before going live
2. Monitor player feedback
3. Plan regular content updates
4. Engage with your community
5. Have fun sharing your creation with the world!

Happy coding and happy streaming! 🚀
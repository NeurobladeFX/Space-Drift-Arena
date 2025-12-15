# Space Drift Arena

> **A zero-gravity 2D multiplayer arena shooter where movement is physics-based recoil**

![Version](https://img.shields.io/badge/version-1.0-blue)
![Status](https://img.shields.io/badge/status-design_complete-green)
![Stack](https://img.shields.io/badge/stack-HTML5%20%7C%20JavaScript%20%7C%20WebRTC-orange)

---

## 🎮 Game Concept

**Space Drift Arena** is a unique multiplayer shooter where players can only move by shooting. Set in zero-gravity space arenas, every shot creates recoil that propels your character. Master the physics to navigate, dodge, and dominate!

### Core Mechanics
- **Zero-Gravity Movement:** No walking—only shooting to create recoil
- **Real Physics:** Velocity, friction, and momentum-based gameplay
- **Weapon Variety:** 6 unique weapons with different recoil strengths
- **P2P Multiplayer:** Play with friends or random opponents (up to 4 players)
- **Progression System:** Unlock skins, earn coins, level up

---

## 📚 Documentation

This repository contains complete game design documentation:

| Document | Description |
|----------|-------------|
| **[GAME_DESIGN.md](./GAME_DESIGN.md)** | Complete gameplay mechanics, modes, progression systems, and features |
| **[TECHNICAL_SPECS.md](./TECHNICAL_SPECS.md)** | Architecture, networking, physics engine, rendering, and implementation details |
| **[ART_PROMPTS.md](./ART_PROMPTS.md)** | AI-ready prompts for all visual assets (characters, weapons, UI, effects) |
| **[UI_DESIGN.md](./UI_DESIGN.md)** | Design system, component library, layouts, and animations |
| **[DATA_STRUCTURES.md](./DATA_STRUCTURES.md)** | Data models, configurations, and database schemas |

---

## 🎯 Game Modes

### 🤖 Single Player vs Bot
Practice against AI opponents with adjustable difficulty. Perfect for learning the physics-based movement system.

### 👥 Play with Friends
Create a private room and share a 6-character code with friends. Host controls when the match starts.

### 🌐 Random Matchmaking
Jump into quick matches with random players. Automatic pairing with skill-based balancing.

### 🐉 Boss Mode (Planned)
Cooperative mode where 2-4 players team up to defeat a massive Shadow Monster boss.

---

## 🔫 Weapons

| Weapon | Damage | Recoil | Fire Rate | Ammo | Special |
|--------|--------|--------|-----------|------|---------|
| **Pistol** | 15 | Low | Fast | ∞ | Default, reliable |
| **Shotgun** | 8×6 | Very High | Slow | 12 | Spread shot, huge recoil |
| **Rifle** | 25 | Medium | Medium | 30 | Precise, balanced |
| **SMG** | 10 | Low | Very Fast | 50 | Rapid fire |
| **Rocket** | 60 | Extreme | Very Slow | 4 | Explosive AoE |
| **Laser** | 20 | None | Continuous | 100 | No recoil beam |

*Each weapon creates different recoil forces, affecting your movement strategy!*

---

## 🗺️ Maps

### Neon Void
Classic arena with floating asteroids and energy core centerpiece. Open layout encourages fast-paced combat.

### Debris Field  
Destroyed spaceship wreckage creates tight corridors. Perfect for close-quarters ambushes.

### Crystal Cavern
Glowing crystals act as bouncy walls (2× bounce force). Features teleport pads for quick repositioning.

---

## 💰 Economy & Progression

### Earn Coins By:
- 🏆 Winning matches (100 coins)
- 💀 Eliminating opponents (25 coins per kill)
- 📅 Daily login (100 coins)
- 📺 Watching ads (50 coins)
- 🎰 Spinning the wheel (50-500 coins)

### Spend Coins On:
- 👥 **Character Skins** (500-5000 coins)
  - Common: Color variants
  - Rare: Alien, Robot, Ninja
  - Epic: Cat, Shadow, Gold
  - Legendary: Cosmic Entity, Cyber Samurai, Dragon Knight

- 🎨 **Weapon Skins** (300-1200 coins)
  - Gold Plated, Neon Glow, Glitch, Lava, Ice, Camo

- ✨ **Trail Effects** (300-1000 coins)
  - Blue Flame, Neon Spark, Smoke, Rainbow, Stars, Shadow

---

## 🏗️ Technology Stack

### Frontend
- **HTML5 Canvas** - Rendering
- **Vanilla JavaScript (ES6+)** - Game logic
- **CSS3** - UI styling
- **Web Audio API** - Sound

### Multiplayer
- **PeerJS** - WebRTC P2P connections
- **Host-Authoritative** - Host simulates physics, clients render

### Backend (Serverless)
- **Supabase** - PostgreSQL database, real-time, auth
- **Firebase** (alternative option)

### Why This Stack?
✅ No server costs for gameplay (P2P)  
✅ Fast development (no frameworks needed)  
✅ Deployable anywhere (static hosting)  
✅ Low bandwidth (~30 KB/s per player)  
✅ Works on desktop and mobile  

---

## 🎨 Art Style

**Neon Sci-Fi meets Cartoon Simple**

### Visual Characteristics:
- Dark space backgrounds (#0A0E27)
- Vibrant neon accents (cyan, purple, green)
- Thick black outlines (3-4px)
- Soft glowing effects
- Simplified geometric shapes
- Clean, modern UI with glass-morphism

### Color Palette:
```css
--space-dark: #0A0E27;
--neon-cyan: #00F0FF;
--neon-purple: #B800FF;
--neon-green: #00FF88;
--warning-red: #FF0055;
--gold: #FFD700;
```

---

## 🚀 Development Roadmap

### Phase 1: Core Gameplay (Week 1-2)
- [x] Design complete
- [ ] Physics engine
- [ ] Player movement
- [ ] 3 weapons (Pistol, Shotgun, Rifle)
- [ ] 1 map (Neon Void)
- [ ] Single-player vs bot
- [ ] Basic UI

### Phase 2: Multiplayer (Week 3)
- [ ] PeerJS integration
- [ ] Room creation/joining
- [ ] P2P synchronization
- [ ] Lobby system
- [ ] Matchmaking

### Phase 3: Progression (Week 4)
- [ ] Supabase integration
- [ ] Player accounts
- [ ] XP & levels
- [ ] Coin economy
- [ ] Shop system
- [ ] Skins (10 total)

### Phase 4: Polish & Launch (Week 5-6)
- [x] All 6 weapons
- [x] 3 maps
- [x] Daily rewards
- [x] Achievements
- [x] Spin wheel
- [x] Ad integration
- [x] Mobile optimization
- [x] Sound effects & music
- [x] Particle effects
- [x] Beta testing

### Post-Launch
- [ ] Boss mode
- [ ] Ranked matchmaking
- [ ] Seasonal events
- [ ] Clan system
- [ ] Replay system
- [ ] New maps & weapons

## 🚀 Deployment

For deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
---

## 📊 Success Metrics

### Target KPIs:
- **DAU:** 1,000+ daily active users (Month 2)
- **Retention:** 40% Day 1, 20% Day 7, 10% Day 30
- **Session Length:** 15+ minutes average
- **Viral Coefficient:** 1.2 (each player invites 1.2 friends)
- **Ad Revenue:** $1-3 CPM on rewarded ads

---

## 🎯 Key Features

### ✨ What Makes This Game Unique?

1. **Physics-Based Movement**  
   Unlike traditional shooters where you walk and shoot, here shooting IS moving. Every shot matters for positioning.

2. **Serverless P2P**  
   Zero server costs, low latency, scales infinitely. WebRTC magic.

3. **Easy to Learn, Hard to Master**  
   Simple concept (shoot to move) but deep skill ceiling. Weapon choices affect movement strategy.

4. **Free-to-Play, Fair Monetization**  
   All gameplay content free. Only cosmetics cost money/time. Watch ads for rewards, never forced.

5. **Cross-Platform**  
   Runs in any modern browser. Desktop, mobile, tablet—all supported.

6. **Fast Matches**  
   2-5 minute rounds. Perfect for quick gaming sessions.

---

## 💡 Monetization Strategy

### Revenue Streams:
- **Rewarded Ads** (Primary): Watch ad → get coins/spins
- **Banner Ads** (Secondary): Non-intrusive menu ads
- **Premium Currency** (Future): Optional "Gems" for exclusive content
- **Battle Pass** (Future): Seasonal progression rewards

### F2P Philosophy:
✅ Never pay-to-win  
✅ All gameplay content free  
✅ Reasonable grind path for cosmetics  
✅ Ads are optional (user-initiated)  
✅ Respect player time  

---

## 🛠️ Deployment Options

### Recommended Hosting:
1. **Netlify** (Free tier, CDN, easy deploys)
2. **Vercel** (Free tier, fast)
3. **GitHub Pages** (Free, static)
4. **itch.io** (Free, game-focused community)

### Supabase Setup:
- Free tier: 500MB database, 2GB bandwidth/month
- Easy upgrade path if game grows
- Real-time subscriptions for lobby

---

## 📜 License & Credits

### Game Design
© 2025 Space Drift Arena  
All rights reserved (design documents)

### Tech Stack Credits:
- PeerJS - MIT License
- Supabase - Apache 2.0
- Font: Orbitron (SIL Open Font License)

### Asset Creation:
All prompts designed for AI generation or artist commission.

---

## 🤝 Contributing

This is currently a design-phase project. Implementation will begin soon!

### How You Can Help:
- 🎨 **Artists:** Create assets from prompts
- 💻 **Developers:** Implement features
- 🎮 **Game Designers:** Balance feedback
- 🎵 **Audio:** Sound effects & music
- 🧪 **Testers:** Playtest and report bugs

---

## 📞 Contact

**Project Lead:** [Your Name]  
**Status:** Design Complete, Ready for Development  
**Start Date:** December 2025

---

## 🎮 Quick Start Guide

### For Developers:
1. Read `TECHNICAL_SPECS.md` for architecture
2. Check `DATA_STRUCTURES.md` for models
3. Review `GAME_DESIGN.md` for mechanics
4. Start with physics engine implementation

### For Artists:
1. Review `ART_PROMPTS.md` for all asset needs
2. Check `UI_DESIGN.md` for style guide
3. Assets needed: Characters, weapons, UI, effects
4. Target style: Neon sci-fi cartoon

### For Players (When Launched):
1. Open game in browser
2. Choose "Play" from main menu
3. Select mode (Single/Multiplayer)
4. Shoot to move, aim to survive!

---

## 🌟 Vision Statement

> "Create a fast-paced, physics-based multiplayer shooter that's accessible to everyone, runs anywhere, costs nothing to play, and rewards skill over time invested. Make movement itself a weapon."

**Space Drift Arena** reimagines the shooter genre by making movement and combat the same mechanic. It's chess with guns in zero gravity—every shot is a strategic decision that affects both offense and positioning.

---

## 📈 Development Status

```
[████████████████████████░░░░] 85% Design Phase
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  0% Implementation
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  0% Testing
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  0% Launch
```

**Current Stage:** Complete Game Design  
**Next Milestone:** Physics Engine Implementation  
**ETA for Playable Alpha:** 4-6 weeks  

---

## 🎉 Acknowledgments

Special thanks to:
- The WebRTC community for P2P tech
- Supabase team for amazing backend tools
- Indie game dev community for inspiration
- Players who will make this game come alive

---

**Let's make space drift together! 🚀**

*Last Updated: December 10, 2025*

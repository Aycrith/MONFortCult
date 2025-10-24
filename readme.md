# MONFortCult - Interactive Landing Page

A sophisticated Next.js 13+ landing page featuring immersive 3D WebGL scenes, parallax animations, and multi-scene interactive experiences with mountain landscapes.

## 🎯 Project Overview

MONFortCult is an interactive landing page that combines:
- **3D WebGL Rendering**: Real-time 3D mountain scenes and landscapes
- **Parallax Animations**: Multi-layered scrolling effects with smooth transitions
- **Multi-Scene Experience**: Mountain, Island, Ship, Globe, and Forest scenes
- **Performance Optimized**: Asset optimization for 4K displays with comprehensive monitoring
- **Interactive UI**: Scroll-driven animations with menu system and overlays

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation & Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main landing page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── scenes/            # Scene components (Mountain, Globe, Ship, Forest)
│   ├── overlays/          # UI overlays and information panels
│   ├── PersistentBackground.tsx    # WebGL canvas management
│   ├── MasterScrollContainer.tsx   # Scroll event coordination
│   └── DebugPanel.tsx     # Development debugging tools
├── context/               # React contexts (Menu, MountainScene)
├── hooks/                 # Custom hooks for monitoring and capture
└── lib/                   # Utilities and helpers

public/assets/
├── 3dmodel/               # GLB models for scenes
├── atmosphere/            # 200+ atmospheric texture frames
├── clouds/                # Cloud animation frames
├── globe/                 # Globe textures
├── mountains/             # Mountain assets (PNG and 3D models)
├── Scenes/                # Scene-specific assets
└── backgrounds/           # Background imagery
```

## 🎨 Key Features

### Interactive Scenes
- **Mountain Scene**: Parallax mountain with dynamic lighting
- **Island Scene**: Water and landscape interactions
- **Ship Scene**: Animated maritime vessel with ocean effects
- **Globe Scene**: 3D rotating world map with clouds
- **Forest Scene**: Atmospheric forest background with depth effects

### Technical Features
- Real-time WebGL rendering with Three.js optimization
- Smooth scroll-driven animations
- Performance monitoring and profiling tools
- Debug panel for development
- Responsive design supporting multiple screen sizes
- 4K asset optimization

### Component System
- Reusable React components with TypeScript
- Context-based state management
- Custom hooks for performance monitoring
- Tailwind CSS for styling

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint checks
```

## 📦 Dependencies

- **Next.js 13+**: React framework
- **React 18+**: UI library
- **Three.js**: 3D graphics
- **Tailwind CSS**: Utility-first CSS
- **TypeScript**: Type safety

## 🔗 Remote Repository

- **GitHub**: [Aycrith/MONFortCult](https://github.com/Aycrith/MONFortCult)
- **Repository URL**: https://github.com/Aycrith/MONFortCult.git

## 📋 Git Commit History

### Initial Setup
- **Commit**: Initial commit with complete project structure (552 files)
- **Changes**: Full asset library, components, configuration

### Latest Updates
- **Commit**: feat: Component refinements and scene optimization
- **Changes**: Optimized CloudOverlay, GlobeScene, ShipScene components
- **Impact**: Improved animations, reduced bundle size, better performance

## 🚀 Deployment

### Vercel (Recommended)
The easiest way to deploy is using [Vercel Platform](https://vercel.com):

```bash
# Deploy from CLI
vercel deploy

# Or connect your GitHub repository in Vercel dashboard
```

### Netlify
This project includes `netlify.toml` configuration for Netlify deployment:

```bash
netlify deploy
```

### Docker
Create a Dockerfile for containerized deployment in production environments.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Three.js Documentation](https://threejs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Created by Aycrith

---

**Last Updated**: October 23, 2025
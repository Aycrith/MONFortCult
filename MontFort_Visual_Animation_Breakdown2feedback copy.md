Comprehensive Visual Breakdown: Mont-Fort.com Landing Page
Core Architectural Principles for the Coding Agent

The agent's previous attempts failed because they misinterpreted the fundamental design. The following principles MUST be adhered to for a successful recreation:

    The Persistent Canvas: The primary user experience is a single, continuous, full-screen animated canvas. The background is never just a solid color (except for specific transitional moments and the footer). It is a living, breathing environment, likely rendered with WebGL or a seamlessly looped, high-resolution video sequence. The agent must create this canvas as the base layer (z-index: 0) upon which all other content is overlaid.

    Scroll-Driven Animation ("Scrubbing"): Most major animations are directly and proportionally linked to the user's scrollbar position. This is not a series of timed, one-off animations (e.g., "animate for 2 seconds"). If the user scrolls down 10% of a section, the animation advances 10%. If they scroll back up, the animation reverses perfectly. This creates a tactile, interactive, "scrubbable" experience.

    Cinematic Layering: All UI elements (text, logos, navigation) exist on layers above the Persistent Canvas. They must be designed to float over the dynamic background. This requires careful consideration of legibility, often using subtle glows, drop shadows, or high-contrast colors.

    Seamless Transitions: The experience is not a slideshow. Transitions between different background canvases (e.g., Mountain to Ship, Ship to Globe) must be smooth, animated crossfades. There should be no hard cuts or jarring changes.

Scene 1: The Hero View (Timestamp: 00:00 - 00:03)

    Visual Goal: Establish a dark, cinematic, immense, and living mountain environment that immediately immerses the user.

    CRITICAL FAILURE ANALYSIS: The agent's attempt in Screenshot 1 is a good starting point but may lack the subtle, continuous motion required. This scene is not static.

Layer-by-Layer Breakdown:

    Layer 0: The Animated Canvas (Background)

        Skybox: A deep, textured, navy blue (#0d1a2e approximate). It is NOT pure black. The sky contains multiple layers of very dark, soft-edged clouds that drift slowly and independently from right to left, creating a parallax effect and giving the sky profound depth. This motion must be continuous and subtle.

        Mountain Geometry: A photorealistic, sharply detailed 3D model of a snow-covered mountain range. The peaks are jagged and complex.

        Lighting & Shading: The scene is lit dramatically from a single, unseen source (like a full moon or very early dawn). This creates extremely bright, almost white, highlights on the snow-facing surfaces and deep, dark blue/navy shadows in the crevices. This high-contrast lighting is essential for the cinematic feel.

    Layer 1: The UI Overlay (Foreground)

        Header (Top): Fixed position.

            Navigation Links (Left): "MONTFORT GROUP", "MONTFORT TRADING", etc. The font is a thin, sans-serif, colored a crisp off-white/light grey. "MONTFORT GROUP" has a solid, thin, light-blue underline to signify it is the active page.

            Menu & Controls (Right): "NEWS" with a blue notification dot, a standard three-line hamburger "MENU" icon. A full menu panel is visible with buttons: "DAWN", "DUSK", "NIGHT", "+ SNOW OFF", "S. CINEMATIC TOUR". These UI elements must be perfectly aligned and spaced.

        Central Branding:

            Logo: A geometric pattern of 37 small, solid white dots arranged in a hexagon-like shape. It sits perfectly centered horizontally above the text.

            Title: The word "MONTFORT" in a clean, elegant, uppercase sans-serif font. The letter-spacing is very wide to create an airy, premium feel. The color is solid white.

        Footer Prompts (Bottom):

            Scroll Text (Center): "SCROLL DOWN TO DISCOVER" in a small, white, uppercase font.

            Compass Icon (Left): A small, circular, dark icon with a white "N" and a needle, reinforcing a theme of navigation and discovery.

Scene 2: The Scroll-Driven Morph (Timestamp: 00:03 - 00:18)

    Visual Goal: A seamless, magical, scroll-driven transformation of both text and scenery, demonstrating the interconnectedness of the Montfort divisions.

    CRITICAL FAILURE ANALYSIS: The agent's output (Screenshots 2 & 3) is a complete failure. It incorrectly removed the entire animated canvas, replacing it with a stark white background. This breaks the core principle of the design. The mountain canvas MUST remain visible and animate throughout this entire sequence.

Animation & Interaction Breakdown (Executed as one fluid, scroll-linked sequence):

    Trigger: User begins scrolling down the page.

    Element 1: The Persistent Canvas (Layer 0)

        Action: The dark mountain canvas remains full-screen. It does not fade or disappear.

        As the user scrolls, the 3D mountain model begins a slow, smooth rotation and tilt. The camera appears to be orbiting leftwards and slightly upwards, revealing new facets of the peaks.

        Simultaneously, thin, vertical, ethereal beams of white light animate from the top of the viewport downwards, "scanning" the mountain surface. Their appearance and position are also tied to the scroll progress.

    Element 2: The Central Text (Layer 1)

        Action: As the canvas animates, the text overlay animates concurrently.

        Sequence:

            "MONTFORT" pans left. "TRADING" pans in from the right. The text has a very subtle white outer glow to ensure it "pops" against the detailed background.

            As scroll continues, "TRADING" pans left and out, and "CAPITAL" pans in from the right.

            As scroll continues, "CAPITAL" pans left and out, and "MARITIME" pans in from the right.

    Climax: The Scenery Morph

        Trigger: This complex transformation is timed to execute as the "MONTFORT MARITIME" text becomes perfectly centered.

        Execution (All effects happen simultaneously via crossfading):

            Texture Morph: The snow texture on the 3D mountain model smoothly dissolves (crossfades) to a green/brown rocky island texture.

            Environment Morph: The dark mist and clouds at the mountain's base animate downwards while fading their opacity, revealing a realistic, animated water surface beneath. The reflections in the water should begin to show the rocky island and the new sky.

            Skybox Morph: The dark navy blue skybox crossfades into a bright, overcast daylight skybox.

        Final State: The scene settles on a photorealistic view of a rocky island in the ocean. A new, white, wave-themed logo fades in to the left of the "MONTFORT MARITIME" text.

Scene 3 & 4: Informational Sections & The Ship (Timestamp: 00:18 - 00:50)

    Visual Goal: Transition from the immersive hero to a clean informational section, and then re-immerse the user in another cinematic, scroll-driven canvas.

    CRITICAL FAILURE ANALYSIS: The agent's attempts are completely incorrect. Screenshot 4 uses a plain, static dark blue background, missing the entire animated ship sequence. Screenshot 5 uses a static, four-box layout on a white background, which is a total deviation from the fluid, full-screen design of the target video.

Step-by-Step Visual Experience:

    Transition to "Who We Are":

        As the user scrolls past the island view, the entire island canvas performs a smooth fade-to-white. The background becomes a solid, clean white (#FFFFFF).

        The "Who We Are" and "What We Do" text sections fade in sequentially on this clean white background. The layout is simple, centered, and typographic.

    Transition to "The Ship" Section:

        Trigger: As the user scrolls past the "What We Do" text.

        Execution: The solid white background must crossfade to a solid, deep black (#000000). Then, a new animated canvas fades in from black.

        New Canvas (Layer 0): This canvas is a dark, dramatic, and stormy cloudscape. The clouds are thick, multi-layered, and moving, creating a sense of urgency and scale.

        Ship Animation (Layer 0.5): A large, photorealistic cargo ship is the focal point. Its position is 100% controlled by the scrollbar. At the start of the section, it is positioned at the top-right. As the user scrolls down, it travels diagonally across the screen toward the bottom-left.

        Text Overlay (Layer 1): The division taglines ("OPERATING EFFICIENTLY...") fade in and out sequentially over the moving ship and clouds. The timing of these fades is also tied to scroll progress. For instance:

            Scroll Position 0-25%: "Montfort Trading" text is at full opacity.

            Scroll Position 25-50%: "Trading" text fades out as "Montfort Capital" text fades in.

            ...and so on for all four divisions.

        Exit Animation: As the user scrolls past the final tagline, the ship continues its path and fades into the dark clouds at the bottom of the screen. The entire canvas then smoothly fades out.

Scene 5, 6, 7: Globe, Forest, and Footer (Timestamp: 00:50 onwards)

    Visual Goal: Continue the journey through different thematic environments, ending on a clean, functional footer.

Step-by-Step Visual Experience:

    The Globe Section:

        Transition: Following the ship scene, a new animated canvas of the Earth from space fades in.

        Canvas (Layer 0): A realistic 3D globe, focused on Europe/MENA. It has a subtle, slow rotation. A semi-transparent, animated cloud layer drifts over the planet's surface.

        UI Overlay (Layer 1): The "ESTABLISHED IN THE WORLD'S..." text block fades in over the globe. Glowing white dots and their corresponding city labels animate onto the map.

    The Sustainability (Forest) Section:

        Transition: The globe view performs a zoom-and-fade transition into the next canvas.

        Canvas (Layer 0): A lush, green forest scene, rendered with a shallow depth of field (the background is soft and blurry). The key features are dynamic: animated light rays ("god rays") shining through the canopy and shimmering dust motes/particles floating in the air. This creates a serene, organic atmosphere.

        UI Overlay (Layer 1): All text content ("Ethics," "Sustainable Energy Solutions," etc.) fades in sequentially on scroll, overlaid on the forest background. The interactive ESG tabs (Environmental, Social, Governance) have a clear active state and animate the fading in/out of their respective icon sets upon clicking. The section concludes with the three-photo strip fading/sliding into view.

    The Footer Section:

        Transition: As the user scrolls past the final sustainability content, the animated forest canvas must perform a final, clean fade-to-white.

        Final State: The page resolves to a static, solid white background. The footer content (sitemap, addresses, copyright) is displayed in a clean, multi-column layout with no background animation. This provides a clear, functional end to the immersive journey.
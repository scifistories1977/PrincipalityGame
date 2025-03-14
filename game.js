// Phaser.js-based space exploration game with a starmap, clickable regions, and a return button

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: {
        preload: preload,
        create: create,
        resize: resizeScene
    }
};

const game = new Phaser.Game(config);
let background, warpOverlay, returnButton;
let locations = {}; // Stores clickable locations
let currentWorld = 'starmap';

const worlds = {
    'starmap': 'assets/starmap.png',   // The new starmap
    'firentis_space': 'assets/firentis_space.png', // Firentis Territory
    'astor_region': 'assets/astor_region.png', // Astor Territory
    'neutral_zone': 'assets/neutral_zone.png',  // Neutral Space
    'jungle_world': 'assets/jungle_world.png', // Jungle Planet
    'asteroid_field': 'assets/asteroid_field.png' // Asteroid Belt
};

function preload() {
    console.log("Loading images...");
    for (let key in worlds) {
        this.load.image(key, worlds[key]); // Load all backgrounds
    }
}

function create() {
    console.log("Creating scene...");

    // Add initial background (Starmap)
    background = this.add.image(game.config.width / 2, game.config.height / 2, 'starmap');
    background.setOrigin(0.5, 0.5).setDisplaySize(game.config.width, game.config.height);

    // Warp effect overlay (Ensures it starts at full screen size)
    warpOverlay = this.add.rectangle(0, 0, game.config.width, game.config.height, 0xffffff);
    warpOverlay.setOrigin(0, 0).setAlpha(0); // Start invisible

    // Add clickable locations if in the starmap
    addStarmapLocations(this);

    // Create the "Return to Starmap" button (Initially hidden)
    returnButton = this.add.text(game.config.width / 2, game.config.height - 50, "Return to Starmap", {
        fontSize: '24px',
        fill: '#fff',
        backgroundColor: '#222',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive().setVisible(false); // Initially hidden

    returnButton.on('pointerdown', () => {
        playWarpEffect('starmap'); // Go back to the starmap
    });

    // Ensure warp effect updates when the window resizes
    window.addEventListener('resize', resizeScene);
}

function addStarmapLocations(scene) {
    console.log("Adding starmap locations...");

    // Define clickable regions on the starmap based on new map coordinates
    locations['firentis_space'] = scene.add.circle(600, 400, 40, 0xff0000, 0.5); // Firentis Space (Red)
    locations['astor_region'] = scene.add.circle(1200, 500, 40, 0x0000ff, 0.5); // Astor Region (Blue)
    locations['neutral_zone'] = scene.add.circle(900, 700, 40, 0x00ff00, 0.5); // Neutral Zone (Green)
    locations['jungle_world'] = scene.add.circle(1100, 300, 40, 0xffff00, 0.5); // Jungle Planet (Yellow)
    locations['asteroid_field'] = scene.add.circle(700, 600, 40, 0xaaaaaa, 0.5); // Asteroid Belt (Gray)

    // Enable clicking on each location
    for (let key in locations) {
        let loc = locations[key];
        loc.setInteractive(); // Make clickable
        loc.on('pointerdown', () => {
            console.log(`Traveling to ${key}...`);
            playWarpEffect(key);
        });
    }
}

function playWarpEffect(targetWorld) {
    console.log(`Initiating warp jump to ${targetWorld}...`);

    // Hide starmap circles when traveling
    for (let key in locations) {
        locations[key].setVisible(false);
    }

    // Ensure warp overlay covers the entire screen before starting animation
    resizeWarpEffect();

    // Animate white flash effect for the warp transition
    game.scene.scenes[0].tweens.add({
        targets: warpOverlay,
        alpha: { from: 0, to: 1 }, // Bright white flash
        duration: 500, // Flash in
        onComplete: function () {
            switchWorld(targetWorld); // Change location while screen is still white
            fadeBack(); // Start fading back
        }
    });
}

function switchWorld(targetWorld) {
    if (!worlds[targetWorld]) {
        console.error(`Error: Image for ${targetWorld} not found!`);
        return;
    }

    console.log(`Switching world to: ${targetWorld}`);

    background.setTexture(targetWorld); // Change background

    // Show or hide the return button based on location
    returnButton.setVisible(targetWorld !== 'starmap');

    // Show circles again if returning to starmap
    if (targetWorld === 'starmap') {
        for (let key in locations) {
            locations[key].setVisible(true);
        }
    }

    resizeScene();
}

function fadeBack() {
    game.scene.scenes[0].tweens.add({
        targets: warpOverlay,
        alpha: { from: 1, to: 0 }, // Fade back out
        duration: 500, // Smooth transition
    });
}

function resizeScene() {
    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight;
    game.scale.resize(newWidth, newHeight);

    if (background) {
        background.setPosition(newWidth / 2, newHeight / 2);
        background.setDisplaySize(newWidth, newHeight);
    }

    resizeWarpEffect();

    if (returnButton) {
        returnButton.setPosition(newWidth / 2, newHeight - 50); // Keep at bottom center
    }

    // Resize clickable areas if applicable
    for (let key in locations) {
        if (locations[key]) {
            locations[key].setPosition(locations[key].x, locations[key].y);
        }
    }
}

// 🔥 New function: Resizes the warp effect when the window size changes
function resizeWarpEffect() {
    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight;

    if (warpOverlay) {
        warpOverlay.setPosition(0, 0); // Set to top-left for full coverage
        warpOverlay.width = newWidth;
        warpOverlay.height = newHeight;
    }
}

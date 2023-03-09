
// USES:
// NTS_UTIL
// NTS_LOADER
// NTS_INPUT
// NTS_ANIM
// NTS_FULLSCREEN
// NTS_WORLD_C
// NTS_BROWSER

// USED IN:
// -

// LICENSE: MIT
// Copyright (c) 2016 by Mike Linkovich
// Untypescript 2023 by Kearnan Kelly

"use strict";

class NTS_APP_C {

    constructor() {
        this.loader_1 = NTS_LOADER;
        this.input = NTS_INPUT;
        this.anim = NTS_ANIM;
        this.fullscreen = NTS_FULLSCREEN;
        this.WORLD = NTS_WORLD_C;

        // circa 2016
        this.CONFIGS = {
            mobile: {blades: 20000, depth: 50.0, antialias: false},
            laptop: {blades: 40000, depth: 65.0, antialias: false},
            desktop: {blades: 84000, depth: 85.0, antialias: true},
            desktop2: {blades: 250000, depth: 125.0, antialias: true},
            gamerig: {blades: 500000, depth: 175.0, antialias: true}
        };

        // DOM element containing canvas
        this.container = NTS_UTIL.getElemById('app_canvas_container');

        // Will be set correctly later
        this.displayWidth = 640;
        this.displayHeight = 480;
        this.assets;
        this.world;
        this.isFullscreen = this.fullscreen.is();
    }

    // Call this when HTML page elements are loaded & ready
    run() {

        if (!NTS_UTIL.getElemById('app_canvas_container')) {
            console.error("app_canvas_container element not found in page");
            return false;
        }

        if (!NTS_UTIL.detectWebGL()) {
            NTS_UTIL.getElemById('loading_text').textContent = "WebGL unavailable.";
            return false;
        }

        this.resize();
        this.loadAssets();
        this.configUI();
        window.addEventListener('resize', this.resize, false);

        return true;
    }

    // Configuration UI input handlers
    configUI() {
        // Select a config roughly based on device type
        let cfgDevice = NTS_BROWSER.isMobile.any ? 'mobile' : 'desktop';
        let cfg = this.CONFIGS[cfgDevice];

        let sel = NTS_UTIL.getElemById('sel_devicepower');
        sel.value = cfgDevice;

        let inp_blades = NTS_UTIL.getElemById('inp_blades');
        inp_blades.value = cfg.blades.toString();

        let inp_depth = NTS_UTIL.getElemById('inp_depth');
        inp_depth.value = cfg.depth.toString();

        NTS_UTIL.getElemById('chk_antialias').checked = cfg.antialias;
        NTS_UTIL.getElemById('chk_fullscreen').checked = false;

        NTS_UTIL.getElemById('chk_fullscreen').onchange = function () {
            this.fullscreen.toggle(NTS_UTIL.getElemById('app_container'));
        };

        sel.onchange = (e) => {
            let cfg = this.CONFIGS[sel.value];
            let b = cfg.blades.toString();
            let d = cfg.depth.toString();
            inp_blades.value = b;
            inp_depth.value = d;
            NTS_UTIL.getElemById('txt_blades').textContent = b;
            NTS_UTIL.getElemById('txt_depth').textContent = d;
            NTS_UTIL.getElemById('chk_antialias').checked = cfg.antialias;
        };

        NTS_UTIL.getElemById('txt_blades').textContent = cfg.blades.toString();
        NTS_UTIL.getElemById('txt_depth').textContent = cfg.depth.toString();

        inp_blades.onchange = function (e) {
            NTS_UTIL.getElemById('txt_blades').textContent = inp_blades.value;
        };

        inp_depth.onchange = function (e) {
            NTS_UTIL.getElemById('txt_depth').textContent = inp_depth.value;
        };
    }

    startItUp() {

        this.anim.fadeOut(NTS_UTIL.getElemById('loading_block'), 80, () => {

            NTS_UTIL.getElemById('loading_block').style.display = 'none';
            NTS_UTIL.getElemById('app_ui_container').style.backgroundColor = 'transparent';

            if (!this.isFullscreen) {
                NTS_UTIL.getElemById('title_bar').style.display = 'block';
            }

            NTS_UTIL.getElemById('btn_fullscreen').onclick = () => {
                this.fullscreen.toggle(NTS_UTIL.getElemById('app_container'));
            };

            NTS_UTIL.getElemById('btn_restart').onclick = () => {
                document.location.reload();
            };

            this.start();
        });
    }

    // TODO this should be in its own file
    loadAssets() {

        let onAssetsDone = function () {
            //console.log('onAssetsDone called or, have we, as \'twere with a defeated joy loaded all assets');
        };

        let onAssetsProgress = function (p) {
            //console.log('onAssetsProgress');
            let pct = Math.floor(p * 90);
            NTS_UTIL.getElemById('loading_bar').style.width = pct + '%';
        }.bind(this);

        let onAssetsError = function (e) {
            console.error('onAssetsError');
            NTS_UTIL.getElemById('loading_text').textContent = e;
        }.bind(this);

        let onAssetsLoaded = function (assets) {
            //console.log('onAssetsLoaded');
            this.assets = assets;
            
            NTS_UTIL.getElemById('loading_bar').style.width = '100%';
            NTS_UTIL.getElemById('loading_text').innerHTML = "&nbsp;";
            NTS_UTIL.getElemById('loading_bar_outer').style.visibility = 'hidden';
            NTS_UTIL.getElemById('config_block').style.visibility = 'visible';

            NTS_UTIL.getElemById('btn_start').onclick = () => {
                this.startItUp();
            };
            
            NTS_UTIL.getElemById('btn_start').disabled = false;
            
            // for autostart
            //this.startItUp();

        }.bind(this);

        this.loader_1.load({
            text: [
                {name: 'grass.vert', url: 'shader/grass.vert.glsl'},
                {name: 'grass.frag', url: 'shader/grass.frag.glsl'},
                {name: 'terrain.vert', url: 'shader/terrain.vert.glsl'},
                {name: 'terrain.frag', url: 'shader/terrain.frag.glsl'},
                {name: 'water.vert', url: 'shader/water.vert.glsl'},
                {name: 'water.frag', url: 'shader/water.frag.glsl'}
            ],
            images: [
                {name: 'heightmap', url: 'data/heightmap.jpg'},
                {name: 'noise', url: 'data/noise.jpg'}
            ],
            textures: [
                {name: 'grass', url: 'data/grass.jpg'},
                {name: 'terrain1', url: 'data/terrain1.jpg'},
                {name: 'terrain2', url: 'data/terrain2.jpg'},
                {name: 'skydome', url: 'data/skydome.jpg'},
                {name: 'skyenv', url: 'data/skyenv.jpg'}
            ]
        }, onAssetsLoaded, onAssetsProgress, onAssetsError, onAssetsDone);
    }

    // All stuff loaded, setup event handlers & start the app...
    start() {

        // music
        if (NTS_UTIL.getElemById('chk_audio').checked) {
            let au = NTS_UTIL.getElemById('chopin');
            au.loop = true;
            au.play();
        }

        // input
        this.input.init();

        // Get detail settings from UI inputs
        let numGrassBlades = +(NTS_UTIL.getElemById('inp_blades').value);
        let grassPatchRadius = +(NTS_UTIL.getElemById('inp_depth').value);
        let antialias = !!(NTS_UTIL.getElemById('chk_antialias').checked);

        // Create an instance of the world
        this.world = new this.WORLD(this.assets, numGrassBlades, grassPatchRadius, this.displayWidth, this.displayHeight, antialias);

        // Start our animation loop
        this.doFrame();
    }

    doFrame() {
        // keep animation loop running
        this.world.doFrame();
        requestAnimationFrame(this.doFrame.bind(this));
    }

    // Handle window resize events
    // resize = () => {} for the bind
    resize = () => {
        this.displayWidth = this.container.clientWidth;
        this.displayHeight = this.container.clientHeight;

        if (this.world) {
            this.world.resize(this.displayWidth, this.displayHeight);
        } else {
            let canvas = NTS_UTIL.getElemById('app_canvas');
            canvas.width = this.displayWidth;
            canvas.height = this.displayHeight;
        }

        // Seems to be a good place to check for fullscreen toggle.
        let fs = this.fullscreen.is();

        if (fs !== this.isFullscreen) {
            // Show/hide the UI when switching windowed/FS mode.
            NTS_UTIL.getElemById('title_bar').style.display = fs ? 'none' : 'block';
            this.isFullscreen = fs;
        }
    }

    //  Return public interface
    //    return {
    //        run: run
    //    };

}
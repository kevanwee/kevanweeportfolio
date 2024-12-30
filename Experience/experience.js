import * as THREE from "three";

import Sizes from "./Utils/sizes.js";
import Time from "./Utils/time.js";
import Resources from "./Utils/resources.js";
import assets from "./Utils/assets.js";

import Camera from "./camera.js";
import Theme from "./World/theme.js"
import Renderer from "./renderer.js";
import Preloader from "./preloader.js";

import World from "./World/world.js";
import Controls from "./World/controls.js";

export default class Experience {
    static instance;
    constructor(canvas) {
        if(Experience.instance) {
            return Experience.instance;
        }
        Experience.instance = this;
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.time = new Time();
        this.sizes = new Sizes(); 
        this.camera = new Camera();
        this.renderer = new Renderer();
        this.resources = new Resources(assets);
        this.theme = new Theme();
        this.world = new World();
        this.preloader = new Preloader();

        this.preloader.on("enablecontrols", ()=>{
            this.controls = new Controls();
            console.log("experience control call is working");
        });

        this.time.on("update", ()=>{
            this.update();
        })

        this.sizes.on("resize", ()=>{
            this.resize();
        })

    }

    update(){

        this.camera.update();
        this.world.update();
        this.renderer.update();
    }

    resize(){
        this.camera.resize();
        this.world.resize();
        this.renderer.resize();
    }
}
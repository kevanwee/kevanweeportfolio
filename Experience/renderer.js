import * as THREE from "three";
import Experience from "./experience.js";

export default class Renderer {
    constructor() {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.camera = this.experience.camera;

        this.setRenderer();
    }

    setRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });

        // Enable physically accurate lighting
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding; // Ensure correct color space
        this.renderer.toneMapping = THREE.CineonToneMapping; // Set tone mapping for realistic output
        this.renderer.toneMappingExposure = 1.75; // Adjust exposure level
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows

        // Set background color (similar to Blender default)
        this.renderer.setClearColor(0xeeeeee, 1); // Light grey background (adjust as needed)

        // Set the renderer size and pixel ratio for responsiveness
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(this.sizes.pixelRatio);
    }

    resize() {
        // Update renderer size on window resize
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(this.sizes.pixelRatio);

        // Ensure camera aspect ratio is updated on resize
        this.camera.perspectiveCamera.aspect = this.sizes.width / this.sizes.height;
        this.camera.perspectiveCamera.updateProjectionMatrix();
    }

    update() {
        // console.log("Renderer update called");
        // Render the scene with the current camera
        this.renderer.setViewport(0,0, this.sizes.width, this.sizes.height);
        this.renderer.render(this.scene, this.camera.orthographicCamera);
        
        // Second Screen
        // this.renderer.setScissorTest(true);
        // this.renderer.setViewport(
        //     this.sizes.width - this.sizes.width/3,
        //     this.sizes.height - this.sizes.height/3,
        //     this.sizes.width / 3,
        //     this.sizes.height / 3
        // );

        // this.renderer.setScissor(
        //     this.sizes.width - this.sizes.width/3,
        //     this.sizes.height - this.sizes.height/3,
        //     this.sizes.width / 3,
        //     this.sizes.height / 3
        // );

        // this.renderer.render(this.scene, this.camera.perspectiveCamera);

        // this.renderer.setScissorTest(false);


    }
}

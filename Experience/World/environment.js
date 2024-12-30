import * as THREE from "three";
import Experience from "../experience.js";
import GSAP from "gsap";
import GUI from 'lil-gui';

export default class Environment {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;

        // this.gui = new GUI({container: document.querySelector(".hero-main")});
        // this.obj = {
        //     colorObj: {r:0, g:0, b:0},
        //     intensity: 3,  
        // }

        this.setSunlight();
        //this.setGUI();
        this.setAmbientLight();
        this.setHemisphereLight();
    }

    // setGUI(){
    //     this.gui.addColor(this.obj, "colorObj").onChange(()=>{
    //         this.sunLight.color.copy(this.obj.colorObj);
    //         this.ambientLight.color.copy(this.obj.colorObj);
    //         console.log(this.obj.colorObj);
    //     });

    //     this.gui.add(this.obj, "intensity", 0, 10).onChange(()=>{
    //         this.sunLight.intensity = this.obj.intensity;
    //         this.ambientLight.intensity = this.obj.intensity;
    //     });
    // }

    // Set up sunlight (directional light)
    setSunlight() {


        this.sunLight = new THREE.DirectionalLight("#ffffff", 3);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.camera.far = 20;
        this.sunLight.shadow.mapSize.set(2048, 2048);
        this.sunLight.shadow.normalBias = 0.05;
        this.sunLight.position.set(-1.5, 9, 3); // Adjust the position to your scene's needs
        this.scene.add(this.sunLight);

        // Create a small marker to visualize the light's position (box)
        // const markerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1); // Small cube as marker
        // const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color for visibility
        // const marker = new THREE.Mesh(markerGeometry, markerMaterial);

        // // Set the marker's position to the light's position
        // marker.position.copy(this.sunLight.position);

        // // Apply a rotation to the marker for better visualization
        // marker.rotation.x = Math.PI / 4;  // Rotate by 45 degrees around the X-axis
        // marker.rotation.y = Math.PI / 4;  // Rotate by 45 degrees around the Y-axis

        // // Add the marker to the scene
        // this.scene.add(marker);
    }

    // Set up ambient light (soft lighting)
    setAmbientLight() {
        this.ambientLight = new THREE.AmbientLight("#ffffff", 1); // Soft ambient light
        this.scene.add(this.ambientLight);

    }

    // Set up hemisphere light (simulates natural sky and ground lighting)
    setHemisphereLight() {
        this.hemisphereLight = new THREE.HemisphereLight(0x606060, 0x404040, 5); // Simulates natural environment light
        this.scene.add(this.hemisphereLight);
    }

    switchTheme(theme) {
        if (theme === "dark") {
            GSAP.to(this.sunLight.color, {
                r: 0.27254901960784313,
                g: 0.23137254901960785,
                b: 0.9862745098039216,
            });
            GSAP.to(this.ambientLight.color, {
                r: 0.27254901960784313,
                g: 0.23137254901960785,
                b: 0.9862745098039216,
            });
            GSAP.to(this.sunLight, {
                intensity: 0.98,
            });
            GSAP.to(this.ambientLight, {
                intensity: 0.98,
            });

            GSAP.to(this.hemisphereLight, {
                intensity: 0,
            });

            if (this.experience.world.room.displayLight) {
                this.experience.world.room.displayLight.intensity = 0.6; // Adjust intensity as needed
            }           
    
            if (this.experience.world.room.rgbLight) {
                this.experience.world.room.rgbLight.intensity = 1; // Adjust intensity as needed
            }
    
        } else { // If theme is not dark, it defaults to "light"
            GSAP.to(this.sunLight.color, {
                r: 255 / 255,
                g: 255 / 255,
                b: 255 / 255,
            });
    
            GSAP.to(this.ambientLight.color, {
                r: 255 / 255,
                g: 255 / 255,
                b: 255 / 255,
            });
    
            GSAP.to(this.sunLight, {
                intensity: 3,
            });
            GSAP.to(this.ambientLight, {
                intensity: 1,
            });

            GSAP.to(this.hemisphereLight, {
                intensity: 3,
            });

            if (this.experience.world.room.displayLight) {
                this.experience.world.room.displayLight.intensity = 0; // Adjust intensity as needed
            }     
    
            if (this.experience.world.room.rgbLight) {
                this.experience.world.room.rgbLight.intensity = 0; // Adjust intensity as needed
            }
        }
    }
    
}

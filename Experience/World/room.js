import * as THREE from "three";
import Experience from "../experience.js";
import GSAP from "gsap";

export default class Room {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.room = this.resources.items.room;
    this.actualRoom = this.room.scene;
    this.roomChildren = {};

    this.lerp = {
      current: 0,
      target: 0,
      ease: 0.1,
    };

    this.setModel();
    //this.setAnimation(); //Shifting this to trigger after rescale
    this.onMouseMove();

    //console.log(this.roomChildren);
  }

  setModel() {

    this.actualRoom.children.forEach((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
      //console.log(child.name);

      if (child.name === 'shelf' || child.name === 'cuupboard1' || child.name === 'cupboard2'|| child.name === 'cupboard3') {
        child.castShadow = false;
      }

      if (child.name === "Glass") {
        child.material = new THREE.MeshPhysicalMaterial();
        child.material.roughness = 0;
        child.material.color.set(0xffffff);
        child.material.ior = 3;
        child.material.transmission = 1;
        child.material.opacity = 1;
      }

      if (child.name === "LAPTOP_SCREEN") {
        this.resources.items.tvscreen.flipY = false;
        child.material = new THREE.MeshBasicMaterial({
          map: this.resources.items.tvscreen,
        });
      }

      if (child.name === "TV_SCREEN") {
        this.resources.items.tvscreen.flipY = false;
        child.material = new THREE.MeshBasicMaterial({
          map: this.resources.items.tvscreen,
        });
      }

      // if (child.name === "Ipad1") {
      //   child.material = new THREE.MeshBasicMaterial({
      //     map: this.resources.items.tvscreen,
      //   });
      // }

      if (child.name === "shelf") {
        this.displayLight = new THREE.PointLight(0xffffff, 0, 0.75);
        this.displayLight.position.set(26.26, 58.3, 13.1);
        this.actualRoom.add(this.displayLight);
        //console.log(this.displayLight.position);
      }


      if (child.name === "Keychron_K8_Pro002") {
        child.children.forEach(part => {
          if (part.name === "RGB001") {
            part.material = new THREE.MeshStandardMaterial({
              emissive: new THREE.Color(0xff0000), // Base emissive color
              emissiveIntensity: 100, // Emission intensity
            });
      
            // Create a PointLight to enhance the RGB effect
            this.rgbLight = new THREE.PointLight(0xff0000, 0, 0.5); // red light with high intensity
            this.rgbLight.position.set(21.66, 25, 0.92); // Position the light near the RGB part
            this.actualRoom.add(this.rgbLight);
      
            // Animate the emissive color to create a rainbow effect
            const rainbowColors = [
              0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x8b00ff,
            ];
      
            let colorIndex = 0;
            setInterval(() => {
              colorIndex = (colorIndex + 1) % rainbowColors.length;
              part.material.emissive.setHex(rainbowColors[colorIndex]);
              this.actualRoom.children[24].color.setHex(rainbowColors[colorIndex]); // Sync light color with emissive material
            }, 200); // Change color every 200ms
          }
        });
      }

      if (child.name === "tail") {
        child.castShadow = false;
        child.receiveShadow = false;
      }


      this.roomChildren[child.name.toLowerCase()] = child;

      child.scale.set(0, 0, 0);

      if (child.name === "Intro") {
          child.scale.set(0.3, 0.3, 0.3);
          child.position.set(0, 30, 0);
          child.rotation.y = Math.PI / 4;
      }
      
      
    });

    this.scene.add(this.actualRoom);
    //console.log(this.actualRoom);
    this.actualRoom.scale.set(-0.04, 0.04, -0.04);
  }

  setAnimation() {
    this.mixer = new THREE.AnimationMixer(this.actualRoom);

    // console.log("Animations loaded:", this.room.animations);
    // console.log("AnimationClip 0 targets:", this.room.animations[0].tracks.map(track => track.name));

    if (!this.room.animations || this.room.animations.length === 0) {
      console.error("No animations found in room.animations.");
      return;
    }

    this.tail = this.mixer.clipAction(this.room.animations[0]); //Dont get why this isnt working T^T
    this.tail.play();

    this.chair = this.mixer.clipAction(this.room.animations[1]);
    this.chair.play();
  }

  onMouseMove() {
    window.addEventListener("mousemove", (e) => {
      this.rotation =
        ((e.clientX - window.innerWidth / 2) * 2) / window.innerWidth;
      //console.log(e.clientX, this.rotation);
      this.lerp.target = this.rotation * 0.05;
      //console.log(this.lerp.current);
    });
  }

  resize() {}

  update() {
    this.lerp.current = GSAP.utils.interpolate(
      this.lerp.current,
      this.lerp.target,
      this.lerp.ease
    );

    if (this.actualRoom) {
      //console.log(this.actualRoom);
      this.actualRoom.rotation.y = this.lerp.current;
    } else {
      //console.error("this.actualRoom is undefined");
    }

    if (this.mixer) {
      this.mixer.update(this.time.delta * 0.0009); // Use delta here
    }
  }
}

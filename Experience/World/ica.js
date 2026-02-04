import * as THREE from "three";
import Experience from "../experience.js";
import GSAP from "gsap";

export default class Ica {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.camera = this.experience.camera;
    this.time = this.experience.time;
    this.resources = this.experience.resources;

    this.cursor = { x: 0, y: 0 };
    this.position = new THREE.Vector3(0, 0, 0);
    this.target = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.dragScale = new THREE.Vector2(2.0, 3.0); // Expand drag range (X, Y)
    this.dragOffset = new THREE.Vector2(0, 0); // Optional offset for drag space
    this.isHidden = false;
    this.isDespawning = false;
    this.despawnTween = null;
    this.canDrag = false;
    this.tooltipEl = null;
    this.tooltipVisible = false;
    this.tooltipScreenOffset = new THREE.Vector2(0, -12);
    // Position Ica in screen space - far in front, separate from world
    this.spawnPosition = new THREE.Vector3(-0.3 , 0, 5.0);
    this.basePosition = this.spawnPosition.clone();
    this.isDragging = false;
    this.isGrabbed = false;
    
    // Use a plane far in front for screen-space interaction
    this.raycaster = new THREE.Raycaster();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -5.0);
    this.planeIntersect = new THREE.Vector3();

    // Enable dragging after the initial intro finishes
    if (this.experience.preloader) {
      this.experience.preloader.on("enablecontrols", () => {
        this.canDrag = true;
        this.setTooltipVisible(true);
      });
    }
    
    this.mixer = null;
    this.animations = {};
    this.textureLoader = new THREE.TextureLoader();

    const icaResource = this.resources.items.ica || null;
    this.model = icaResource?.scene || icaResource || null;
    this.animationsSource = null;
    
    this.debugSphere = null;

    if (this.model) {
      this.setupModel(this.model);
      this.checkForAnimations();
    } else {
      this.resources.on("ready", () => {
        const readyResource = this.resources.items.ica || null;
        this.model = readyResource?.scene || readyResource || null;
        if (this.model) {
          this.setupModel(this.model);
          this.checkForAnimations();
        } else {
          console.error("Ica GLB missing after resources ready.");
        }
      });
    }

    this.setEvents();
  }

  setupModel(model) {
    console.log("Ica GLB loaded:", model);
    
    model.visible = true;
    
    // Load textures with callback to ensure they're loaded
    const baseUrl = import.meta.env.BASE_URL;
    const bodyColorTexture = this.textureLoader.load(
      `${baseUrl}Ica/Textures/Servant_HyacineServant_00_Body_Color.png`,
      (texture) => console.log("Body texture loaded successfully")
    );
    const eyeColorTexture = this.textureLoader.load(
      `${baseUrl}Ica/Textures/Servant_HyacineServant_00_Eye_Color_1.png`,
      (texture) => console.log("Eye texture 1 loaded successfully")
    );
    const eyeColorTexture2 = this.textureLoader.load(
      `${baseUrl}Ica/Textures/Servant_HyacineServant_00_Eye_Color_2.png`,
      (texture) => console.log("Eye texture 2 loaded successfully")
    );
    
    bodyColorTexture.flipY = false;
    eyeColorTexture.flipY = false;
    eyeColorTexture2.flipY = false;
    bodyColorTexture.colorSpace = THREE.SRGBColorSpace;
    eyeColorTexture.colorSpace = THREE.SRGBColorSpace;
    eyeColorTexture2.colorSpace = THREE.SRGBColorSpace;
    
    // Store textures for later use
    this.eyeTexture1 = eyeColorTexture;
    this.eyeTexture2 = eyeColorTexture2;
    
    console.log("🔍 Analyzing all meshes in model:");
    const allMeshNames = [];
    model.traverse((child) => {
      if (child.isMesh) {
        allMeshNames.push(child.name);
      }
    });
    console.log("📝 All mesh names found:", allMeshNames);
    
    model.traverse((child) => {
      if (child.isMesh) {
        console.log("Mesh:", child.name, "Current material:", child.material);
        
        child.castShadow = false;
        child.receiveShadow = false;
        child.frustumCulled = false;
        child.renderOrder = 999;
        child.visible = true;

        // Replace with new materials that use the textures
        const meshNameLower = child.name.toLowerCase();
        const isEye = meshNameLower.includes('eye') || 
                      meshNameLower.includes('pupil') || 
                      meshNameLower.includes('iris') ||
                      meshNameLower.includes('face') ||
                      child.name === 'Eye' ||
                      child.name.includes('Eye');
        
        console.log(`🔍 Checking mesh: "${child.name}" - isEye: ${isEye}`);
        
        if (isEye) {
          // Special emissive material for eyes to make them bright and visible
          child.material = new THREE.MeshBasicMaterial({
            map: eyeColorTexture,
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            alphaTest: 0.1
          });
          child.renderOrder = 1000; // Render eyes on top
          // Store reference to eye meshes for texture switching
          if (!this.eyeMeshes) this.eyeMeshes = [];
          this.eyeMeshes.push(child);
          console.log("Applied BASIC EYE material to", child.name);
        } else {
          child.material = new THREE.MeshStandardMaterial({
            map: bodyColorTexture,
            color: 0xcccccc,
            side: THREE.DoubleSide,
            transparent: false,
            opacity: 1,
            roughness: 0.9,
            metalness: 0.05,
            emissive: 0x000000,
            emissiveIntensity: 0
          });
          console.log("Applied body material to", child.name);
        }
        
        console.log("Applied", isEye ? "EYE" : "body", "material to", child.name);
      }
    });

    const bounds = new THREE.Box3();
    const tempBox = new THREE.Box3();
    let hasMesh = false;

    model.updateWorldMatrix(true, true);
    model.traverse((child) => {
      if (child.isMesh && child.geometry) {
        if (!child.geometry.boundingBox) {
          child.geometry.computeBoundingBox();
        }
        tempBox.copy(child.geometry.boundingBox);
        tempBox.applyMatrix4(child.matrixWorld);
        bounds.union(tempBox);
        hasMesh = true;
      }
    });

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    if (hasMesh) {
      bounds.getSize(size);
      bounds.getCenter(center);
    }

    if (hasMesh && size.y > 0) {
      const desiredHeight = this.sizes.frustrum * 0.2;
      const scale = desiredHeight / size.y;
      model.scale.setScalar(scale);
    } else {
      model.scale.setScalar(0.35);
    }

    this.spawnScale = model.scale.clone();

    if (hasMesh) {
      model.position.sub(center);
    }
    model.position.add(this.basePosition);
    this.position.copy(this.basePosition);

    console.log("Ica bounds:", { hasMesh, size, center, scale: model.scale });

    this.scene.add(model);
    this.createTooltip();
    this.setTooltipVisible(false);
  }

  checkForAnimations() {
    // Check if FBX animations have loaded
    const fbxResource = this.resources.items.icaAnimations;
    
    if (fbxResource && fbxResource.animations && fbxResource.animations.length > 0) {
      console.log("🎬 FBX animations found! Total clips:", fbxResource.animations.length);
      
      this.mixer = new THREE.AnimationMixer(this.model);
      
      fbxResource.animations.forEach((clip, index) => {
        this.animations[clip.name] = this.mixer.clipAction(clip);
        console.log(`✅ Animation ${index + 1}:`, clip.name);
        console.log(`   Duration: ${clip.duration} seconds`);
        console.log(`   Tracks: ${clip.tracks.length}`);
        
        // Analyze track types and keyframes
        const trackTypes = {};
        clip.tracks.forEach(track => {
          const type = track.name.split('.')[1]; // position, quaternion, scale, etc.
          if (!trackTypes[type]) trackTypes[type] = 0;
          trackTypes[type]++;
          
          // Log first few keyframe times for position tracks to see timing
          if (type === 'position' && track.times.length > 0) {
            console.log(`   ${track.name}: ${track.times.length} keyframes`);
            console.log(`      Keyframe times (first 10): [${track.times.slice(0, 10).join(', ')}]`);
          }
        });
        console.log(`   Track types:`, trackTypes);
      });
      
      console.log("📋 All animation names:", Object.keys(this.animations));
      
      // Play fly-in once, then loop flapping
      if (this.animations['Idle'] || this.animations['idle'] || this.animations['mixamo.com']) {
        const anim = this.animations['Idle'] || this.animations['idle'] || this.animations['mixamo.com'];
        const clip = fbxResource.animations[0];
        
        // Create a modified clip for just the flapping portion
        const flapStartTime = 1.5;
        const flapEndTime = 2.5;
        
        // Play full animation once first
        anim.setLoop(THREE.LoopOnce);
        anim.clampWhenFinished = false;
        anim.play();
        
        console.log('▶️ Playing fly-in animation (0-1.5s), then will loop flapping (1.5-2.5s)');
        
        // When fly-in completes, loop the flapping portion
        this.mixer.addEventListener('finished', (e) => {
          console.log('🔁 Fly-in complete, now looping flapping portion');
          
          // Reset and set to loop mode
          anim.stop();
          anim.setLoop(THREE.LoopRepeat);
          anim.time = flapStartTime;
          anim.setEffectiveTimeScale(1);
          anim.setEffectiveWeight(1);
          anim.play();
          
          // Manually restrict loop to flapping range
          this.flapLoopRange = { start: flapStartTime, end: flapEndTime, action: anim };
        });
      } else if (Object.keys(this.animations).length > 0) {
        const firstAnim = Object.values(this.animations)[0];
        const clip = fbxResource.animations[0];
        
        const flapStartTime = 1.5;
        const flapEndTime = 2.5;
        
        firstAnim.setLoop(THREE.LoopOnce);
        firstAnim.clampWhenFinished = false;
        firstAnim.play();
        
        console.log('▶️ Playing first available animation:', Object.keys(this.animations)[0]);
        
        this.mixer.addEventListener('finished', (e) => {
          firstAnim.stop();
          firstAnim.setLoop(THREE.LoopRepeat);
          firstAnim.time = flapStartTime;
          firstAnim.play();
          
          this.flapLoopRange = { start: flapStartTime, end: flapEndTime, action: firstAnim };
        });
      }
    } else {
      console.log('⏳ Waiting for FBX animations to load...');
      if (!fbxResource) {
        this.resources.on("ready", () => {
          this.checkForAnimations();
        });
      }
    }
  }

  setEvents() {
    window.addEventListener("pointermove", (event) => {
      this.cursor.x = (event.clientX / this.sizes.width) * 2 - 1;
      this.cursor.y = -(event.clientY / this.sizes.height) * 2 + 1;
    });

    window.addEventListener("pointerdown", (event) => {
      if (this.isHidden || !this.canDrag) {
        return;
      }
      // Use raycasting to check if clicking on the plane near Ica
      this.raycaster.setFromCamera(
        new THREE.Vector2(this.cursor.x, this.cursor.y),
        this.camera.orthographicCamera
      );
      
      const intersects = this.raycaster.ray.intersectPlane(this.plane, new THREE.Vector3());
      
      if (intersects) {
        this.isDragging = true;
        this.isGrabbed = true;
        this.setTooltipVisible(false);
        // Store the offset from Ica's position to where we clicked
        const cursorWorldX = intersects.x * this.dragScale.x + this.dragOffset.x;
        const cursorWorldY = intersects.y * this.dragScale.y + this.dragOffset.y;
        const anchorX = this.model ? this.model.position.x : this.position.x;
        const anchorY = this.model ? this.model.position.y : this.position.y;
        this.grabOffset = new THREE.Vector2(
          anchorX - cursorWorldX,
          anchorY - cursorWorldY
        );
        // Change eye texture to Eye_Color_2
        if (this.eyeMeshes && this.eyeTexture2) {
          this.eyeMeshes.forEach(eyeMesh => {
            eyeMesh.material.map = this.eyeTexture2;
            eyeMesh.material.needsUpdate = true;
          });
        }
        console.log('✅ Grabbed Ica! Drag in screen space!');
      }
    });

    window.addEventListener("pointerup", () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.isGrabbed = false;
        // Update base position to where Ica was dropped
        this.basePosition.x = this.position.x;
        this.basePosition.y = this.position.y;
        this.velocity.set(0, 0, 0); // Reset velocity
        // Change eye texture back to Eye_Color_1
        if (this.eyeMeshes && this.eyeTexture1) {
          this.eyeMeshes.forEach(eyeMesh => {
            eyeMesh.material.map = this.eyeTexture1;
            eyeMesh.material.needsUpdate = true;
          });
        }
        console.log('Released Ica!');
      }
    });
    
    // Respawn button event listener
    const respawnButton = document.querySelector(".respawn-ica-button");
    if (respawnButton) {
      respawnButton.addEventListener("click", () => this.respawn());
    }
  }

  setRespawnButtonVisible(isVisible) {
    const respawnButton = document.querySelector(".respawn-ica-button");
    if (!respawnButton) return;
    respawnButton.style.opacity = isVisible ? "1" : "0";
    respawnButton.style.pointerEvents = isVisible ? "auto" : "none";
  }

  createTooltip() {
    if (this.tooltipEl) return;
    const tooltip = document.createElement("div");
    tooltip.className = "ica-tooltip";
    tooltip.innerHTML = `
      <div class="ica-tooltip-title">Ica</div>
      <div class="ica-tooltip-divider"></div>
      <div class="ica-tooltip-body">“Click below me to move me around!”</div>
    `;
    document.body.appendChild(tooltip);
    this.tooltipEl = tooltip;
  }

  setTooltipVisible(isVisible) {
    if (!this.tooltipEl) return;
    this.tooltipVisible = isVisible;
    this.tooltipEl.style.opacity = isVisible ? "1" : "0";
    this.tooltipEl.style.pointerEvents = "none";
  }
  
  respawn() {
    // Reset to original position
    this.basePosition.copy(this.spawnPosition);
    this.position.copy(this.spawnPosition);
    this.velocity.set(0, 0, 0);
    this.isDragging = false;
    this.isGrabbed = false;
    this.isHidden = false;
    this.isDespawning = false;
    if (this.despawnTween) {
      this.despawnTween.kill();
      this.despawnTween = null;
    }

    if (this.model) {
      this.model.visible = true;
      if (this.spawnScale) {
        this.model.scale.copy(this.spawnScale);
      }
    }
    if (this.debugSphere) {
      this.debugSphere.visible = true;
    }
    this.setRespawnButtonVisible(true);
    if (this.canDrag) {
      this.setTooltipVisible(true);
    }

    // Reset eye texture
    if (this.eyeMeshes && this.eyeTexture1) {
      this.eyeMeshes.forEach(eyeMesh => {
        eyeMesh.material.map = this.eyeTexture1;
        eyeMesh.material.needsUpdate = true;
      });
    }

    // Replay the fly-in animation
    if (this.mixer && this.animations) {
      const anim = this.animations['Idle'] || this.animations['idle'] || this.animations['mixamo.com'] || Object.values(this.animations)[0];

      if (anim) {
        const flapStartTime = 1.5;
        const flapEndTime = 2.5;

        anim.stop();
        anim.reset();

        // Play fly-in once
        anim.setLoop(THREE.LoopOnce);
        anim.clampWhenFinished = false;
        anim.time = 0;
        anim.play();

        console.log('▶️ Replaying fly-in animation');

        const onFinished = () => {
          console.log('🔁 Fly-in complete, now looping flapping portion');

          anim.stop();
          anim.setLoop(THREE.LoopRepeat);
          anim.time = flapStartTime;
          anim.setEffectiveTimeScale(1);
          anim.setEffectiveWeight(1);
          anim.play();

          this.flapLoopRange = { start: flapStartTime, end: flapEndTime, action: anim };
          this.mixer.removeEventListener('finished', onFinished);
        };

        this.mixer.addEventListener('finished', onFinished);
      }
    }

    console.log('🔄 Ica respawned at original location!');
  }

  despawn() {
    this.isDragging = false;
    this.isGrabbed = false;
    this.velocity.set(0, 0, 0);
    this.flapLoopRange = null;
    this.isDespawning = true;
    this.setTooltipVisible(false);

    if (this.despawnTween) {
      this.despawnTween.kill();
      this.despawnTween = null;
    }

    if (!this.model) {
      this.isHidden = true;
      this.isDespawning = false;
      if (this.debugSphere) {
        this.debugSphere.visible = false;
      }
      this.setRespawnButtonVisible(false);
      return;
    }

    // Natural fly-out: drift up/right and slightly shrink
    const targetY = this.basePosition.y + 18;
    const targetX = this.basePosition.x + 6;

    this.despawnTween = GSAP.to(this.basePosition, {
      x: targetX,
      y: targetY,
      duration: 0.9,
      ease: "power2.in",
      onComplete: () => {
        this.isHidden = true;
        this.isDespawning = false;
        this.model.visible = false;
        if (this.debugSphere) {
          this.debugSphere.visible = false;
        }
        this.setRespawnButtonVisible(false);
        this.despawnTween = null;
      },
    });

    if (this.spawnScale) {
      GSAP.to(this.model.scale, {
        x: this.spawnScale.x * 0.85,
        y: this.spawnScale.y * 0.85,
        z: this.spawnScale.z * 0.85,
        duration: 0.9,
        ease: "power2.in",
      });
    }
  }

  update() {
    if (!this.model) {
      return;
    }
    
    // Update animations
    if (this.mixer) {
      this.mixer.update(this.time.delta * 0.001);
      
      // Ping-pong loop for smooth flapping
      if (this.flapLoopRange) {
        const action = this.flapLoopRange.action;
        const start = this.flapLoopRange.start;
        const end = this.flapLoopRange.end;
        const buffer = 0.15; // Buffer to prevent exact boundary hits
        
        // If we've reached the end, reverse direction
        if (action.time >= end - buffer && action.timeScale > 0) {
          action.timeScale = -1;
          action.time = end - buffer;
        }
        // If we've reached the start (going backward), reverse to forward
        else if (action.time <= start + buffer && action.timeScale < 0) {
          action.timeScale = 1;
          action.time = start + buffer;
        }
      }
    }

    // Update plane to Ica's overlay Z position (fixed at 5.0)
    this.plane.constant = -5.0;
    
    // Use raycasting to get cursor position in screen space
    this.raycaster.setFromCamera(
      new THREE.Vector2(this.cursor.x, this.cursor.y),
      this.camera.orthographicCamera
    );
    
    const intersects = this.raycaster.ray.intersectPlane(this.plane, this.planeIntersect);

    if (this.isDragging) {
      if (intersects) {
        // Move Ica with the cursor, maintaining grab offset
        const targetX = this.planeIntersect.x * this.dragScale.x + this.dragOffset.x + this.grabOffset.x;
        const targetY = this.planeIntersect.y * this.dragScale.y + this.dragOffset.y + this.grabOffset.y;
        
        // Smooth interpolation for natural movement
        this.position.x = GSAP.utils.interpolate(this.position.x, targetX, 0.25);
        this.position.y = GSAP.utils.interpolate(this.position.y, targetY, 0.25);
        this.position.z = 5.0; // Always stay on overlay plane
        
        // Calculate velocity for rotation
        this.velocity.x = (targetX - this.position.x) * 0.5;
        this.velocity.y = (targetY - this.position.y) * 0.5;
      }
    } else {
      // Stay at base position (not dragging)
      this.position.x = this.basePosition.x;
      this.position.y = this.basePosition.y;
      this.position.z = 5.0;
      this.velocity.set(0, 0, 0);
    }

    // No boundary restrictions - Ica can be dragged anywhere
    // (Boundary checks removed to allow unrestricted movement)

    // Gentle floating animation (reduced when grabbed)
    const floatIntensity = this.isDragging ? 0.01 : 0.04;
    const floatY = Math.sin(this.time.elapsed * 0.001) * floatIntensity;
    
    // Rotation based on velocity (more dramatic when grabbed)
    const rotationMultiplier = this.isDragging ? 8 : 4;
    this.model.rotation.y = GSAP.utils.interpolate(
      this.model.rotation.y,
      -this.velocity.x * rotationMultiplier,
      0.15
    );
    this.model.rotation.z = GSAP.utils.interpolate(
      this.model.rotation.z,
      this.velocity.x * 3,
      0.15
    );

    this.model.position.set(this.position.x, this.position.y + floatY, this.position.z);

    if (this.tooltipEl && this.tooltipVisible && this.model.visible && !this.isHidden) {
      this.tooltipEl.style.left = "50%";
      this.tooltipEl.style.top = "55%";
    }
    
    // Update debug sphere position to match click detection point
    if (this.debugSphere) {
      const debugX = (this.model ? this.model.position.x : this.position.x) + 0.125;
      const debugY = (this.model ? this.model.position.y : this.position.y) + 5.0;
      const debugZ = this.model ? this.model.position.z : this.position.z;
      this.debugSphere.position.set(debugX, debugY, debugZ);
    }
  }
}

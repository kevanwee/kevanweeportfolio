import * as THREE from "three";
import Experience from "../experience.js";
import GSAP from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";

import ASScroll from "@ashthornton/asscroll";

export default class Controls {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.camera = this.experience.camera;
    this.room = this.experience.world.room.actualRoom;
    this.room.children.forEach(child=>{
      if (child.type === "PointLight") {
        this.pointLight = child;
      }
    });
    
    this.circleFirst = this.experience.world.floor.circleFirst;
    this.circleSecond = this.experience.world.floor.circleSecond;
    this.circleThird = this.experience.world.floor.circleThird;

    GSAP.registerPlugin(ScrollTrigger);

    console.log("Test");
    console.log(document.querySelector(".page"));
    document.querySelector(".page").style.overflow = "visible";
    console.log(document.querySelector(".page"));

    this.setSmoothScroll();
    this.setScrollTrigger();

    // this.setPath();
    // this.onWheel();
  }

    setupASScroll() {
      // https://github.com/ashthornton/asscroll
      const asscroll = new ASScroll({
          ease: 0.1,
          disableRaf: true,
      });

      GSAP.ticker.add(asscroll.update);

      ScrollTrigger.defaults({
          scroller: asscroll.containerElement,
      });

      ScrollTrigger.scrollerProxy(asscroll.containerElement, {
          scrollTop(value) {
              if (arguments.length) {
                  asscroll.currentPos = value;
                  return;
              } 
              return asscroll.currentPos;
          },
          getBoundingClientRect() {
              return {
                  top: 0,
                  left: 0,
                  width: window.innerWidth,
                  height: window.innerHeight,
              };
          },
          fixedMarkers: true,
      });

      asscroll.on("update", ScrollTrigger.update);
      ScrollTrigger.addEventListener("refresh", asscroll.resize);

      requestAnimationFrame(() => {
          asscroll.enable({
              newScrollElements: document.querySelectorAll(
                  ".gsap-marker-start, .gsap-marker-end, [asscroll]"
              ),
          });
      });
      return asscroll;
  }

  setSmoothScroll() {
      this.asscroll = this.setupASScroll();
  }

  setScrollTrigger() {
    // Create gsap.matchMedia instance
    let mm = GSAP.matchMedia();

    // Desktop
    mm.add(
      "(min-width: 969px)", () => {
        // Setup for desktop
        console.log("fired desktop");

        // First section
        this.firstMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".first-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          }
        });

        this.firstMoveTimeline.to(this.room.position, {
          x: () => {

            return this.sizes.width * 0.0017;
          }
        });

        // Second section

        this.secondMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".second-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          }
        });

        this.secondMoveTimeline.to(this.room.position, {
          x: () => {

            return 0.6;
          },    

          z:() => {
            return this.sizes.height * 0.0032;
          }
        }, "same");

        this.secondMoveTimeline.to(this.room.scale, {
          x: -0.11,
          y: 0.11,
          z: -0.11,

        }, "same");

        // Third section

        this.thirdMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".third-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          }
        });

        this.thirdMoveTimeline.to(this.camera.orthographicCamera.position, {
          x: () => {
            return -4.75;
          },

          y:() => {
            return 8.5;
          }
        });

        // Fourth section

        this.fourthMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".fourth-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          }
        });

        this.fourthMoveTimeline.to(this.camera.orthographicCamera.position, {
          x: () => {
            return 4.25;
          },

          y:() => {
            return 1;
          }
        });

      }

      
      
    );

    // Mobile
    mm.add(
      "(max-width: 968px)", () => {
        // Setup for mobile
        console.log("fired mobile");
        this.mobiletimeline = new GSAP.timeline();
            this.mobiletimeline
              .to(this.room.scale, {
                x: () => {
                  return -0.02;
                },    

                y: () => {
                  return 0.02;
                },
      
                z:() => {
                  return -0.02;
                }
              }, "mobile")

              .to(this.camera.orthographicCamera.position, {
                x: () => {
                  return 0;
                },

                y: () => {
                  return 4;
                },

                z: () => {
                  return 5;
                }

              }, "mobile");

        // First section
        this.mobilefirstMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".first-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          }
        });

        // Second section
        
        this.mobilesecondMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".second-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          }
        });

        this.mobilesecondMoveTimeline.to(this.room.position, {
          x: () => {
            return -3;
          },

          z:() => {
            return 2.24;
          }

        }, "same");

        this.mobilesecondMoveTimeline.to(this.room.scale, {
          x: -0.11,
          y: 0.11,
          z: -0.11,

        }, "same");
        
        this.mobilesecondMoveTimeline.to(this.camera.orthographicCamera.position, {
          y:() => {
            return 4;
          },

          x:() => {
            return -6.5;
          },

          z:() => {
            return 2.24;
          }
        }, "same");

        // Third section

        this.mobilethirdMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".third-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          }
        });

        this.mobilethirdMoveTimeline.to(this.camera.orthographicCamera.position, {
          x: () => {
            return -5.2;
          },

          y:() => {
            return 6.5;
          }
        });

        // Fourth section

        this.mobilefourthMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".fourth-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          }
        });

        this.mobilefourthMoveTimeline.to(this.camera.orthographicCamera.position, {
          x: () => {
            return -2;
          },

          y:() => {
            return -1;
          }
        });
        
      }
    );

    // All
    // All
    mm.add("all", () => {
      // Setup for all
      console.log("fired all");
      this.sections = document.querySelectorAll(".section");
      this.sections.forEach((section) => {
        this.progressWrapper = section.querySelector(".progress-wrapper");
        this.progressBar = section.querySelector(".progress-bar");

        if (section.classList.contains("right")) {
          GSAP.to(section, {
            borderTopLeftRadius: 10,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top top",
              scrub: 0.6,
            },
          });
          GSAP.to(section, {
            borderBottomLeftRadius: 700,
            scrollTrigger: {
              trigger: section,
              start: "bottom bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        } else {
          GSAP.to(section, {
            borderTopRightRadius: 10,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top top",
              scrub: 0.6,
            },
          });
          GSAP.to(section, {
            borderBottomRightRadius: 700,
            scrollTrigger: {
              trigger: section,
              start: "bottom bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        }

        GSAP.from(this.progressBar, {
          scaleY: 0,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
            pin: this.progressWrapper,
            pinSpacing: false,
          },
        });
      });

      // First section -----------------------------------------
      this.firstCircle = new GSAP.timeline({
        scrollTrigger: {
          trigger: ".first-move",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      }).to(this.circleFirst.scale, {
        x: 3,
        y: 3,
        z: 3,
      });

      // Second section -----------------------------------------
      this.secondCircle = new GSAP.timeline({
        scrollTrigger: {
          trigger: ".second-move",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      })
        .to(
          this.circleSecond.scale,
          {
            x: 3,
            y: 3,
            z: 3,
          },
          "same"
        )
        .to(
          this.room.position,
          {
            y: 0.7,
          },
          "same"
        );

      // Third section -----------------------------------------
      this.thirdCircle = new GSAP.timeline({
        scrollTrigger: {
          trigger: ".third-move",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      }).to(this.circleThird.scale, {
        x: 3,
        y: 3,
        z: 3,
      });
    });
}


  // setPath() {
  //     //Create a closed wavey loop
  //     this.curve = new THREE.CatmullRomCurve3( [
  //         new THREE.Vector3( -5, 0, 0 ),
  //         new THREE.Vector3( 0, 0, -5 ),
  //         new THREE.Vector3( 5, 0, 0 ),
  //         new THREE.Vector3( 0, 0, 5 )
  //     ], true);

  // onMouseMove() {
  //     window.addEventListener("mousemove", (e) => {
  //         this.rotation =
  //             ((e.clientX - window.innerWidth / 2) * 2) / window.innerWidth;
  //         this.lerp.target = this.rotation * 0.05;
  //     });
  // }

  //     const points = this.curve.getPoints( 50 );
  //     const geometry = new THREE.BufferGeometry().setFromPoints( points );

  //     const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );

  //     // Create the final object to add to the scene
  //     const curveObject = new THREE.Line( geometry, material );
  //     this.scene.add(curveObject);
  // }

  // onWheel() {
  //     window.addEventListener("wheel", (e) => {
  //         console.log(e);
  //         if (e.deltaY > 0) {
  //             this.lerp.target += 0.1;
  //         } else {
  //             this.lerp.target -= 0.1;

  //             // Leaving this error handling here in case I want to re-enable infinite scroll
  //             if (this.lerp.target < 0) {
  //                 this.lerp.target = 1;
  //             }
  //         }
  //     });
  // }

  resize() {}

  update() {
    // this.lerp.current = GSAP.utils.interpolate(
    //     this.lerp.current,
    //     this.lerp.target,
    //     this.lerp.ease
    // );
    // Use this to do a time based movement
    // this.lerp.target += 0.001;
    // Use clamp to avoid infinite loop
    // this.lerp.target = GSAP.utils.clamp(0,1, this.lerp.target);
    // this.lerp.current = GSAP.utils.clamp(0,1, this.lerp.current);
    // this.curve.getPointAt(this.lerp.current, this.position);
    // this.camera.orthographicCamera.position.copy(this.position);
    // this.directionalVector.subVectors(
    //     this.curve.getPointAt((this.lerp.current%1) + 0.00001),
    //     this.position
    // );
    // this.directionalVector.normalize();
    // this.crossVector.crossVectors(
    //     this.directionalVector,
    //     this.staticVector
    // );
    // this.crossVector.multiplyScalar(1000);
    // this.camera.orthographicCamera.lookAt(this.crossVector); //this is the point where the camera looks at
  }
}

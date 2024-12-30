import { EventEmitter } from "events";
import Experience from "./experience.js";
import GSAP from "gsap";

import convert from "./Utils/convertdivstospans";

export default class Preloader extends EventEmitter {
    constructor() {
        super();
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.sizes = this.experience.sizes;
        this.resources = this.experience.resources;
        this.camera = this.experience.camera;
        this.world = this.experience.world;
        this.device = this.sizes.device;
        this.secondIntroPlayed = false; // Add a flag to track if the second intro has played

        this.sizes.on("switchdevice", (device) =>{
            this.device = this.sizes.device;
        });

        this.world.on("worldready", () => {
            this.setAssets();
            this.playIntro();
            this.pageWrapper = document.querySelector('.page-wrapper');
        });
    }

    async playIntro() {
        await this.firstIntro();
        this.moveFlag = true;

        this.scrollOnceEvent = this.onScroll.bind(this);
        this.touchStart = this.onTouch.bind(this);
        this.touchMove = this.onTouchMove.bind(this);
        window.addEventListener("wheel", this.scrollOnceEvent);
        window.addEventListener("touchstart", this.touchStart);
        window.addEventListener("touchmove", this.touchMove);
    };

    setAssets() {
        convert(document.querySelector(".intro-text"));
        convert(document.querySelector(".hero-main-title"));
        convert(document.querySelector(".hero-main-description"));
        convert(document.querySelector(".hero-second-subheading"));
        convert(document.querySelector(".second-sub"));
        
        this.room = this.experience.world.room.actualRoom;
        this.roomChildren = this.experience.world.room.roomChildren;
        console.log(this.roomChildren);
    }

    firstIntro() {
        return new Promise((resolve) => {
            this.timeline = new GSAP.timeline();
            this.timeline.to(".preloader", {
                opacity: 0,
                delay: 1,
                onComplete:() =>{
                    document.querySelector(".preloader").classList.add("hidden");
                }
            });

            if (this.device === "desktop") {
                this.timeline
                    .to(this.roomChildren.intro.scale, {
                        x: 0.35,
                        y: 0.35,
                        z: 0.35,
                        ease: "back.out(2.5)",
                        duration: 3,
                    })
                    .to(this.room.position, {
                        x: -1,
                        ease: "power1.out",
                        duration: 0.7,
                    });
            } else {
                this.timeline
                    .to(this.roomChildren.intro.scale, {
                        x: 0.35,
                        y: 0.35,
                        z: 0.35,
                        ease: "backout(2.5)",
                        duration: 3,
                    })
                    .to(this.room.position, {
                        z: -1,
                        ease: "power1.out",
                        duration: 0.7,
                    });
            }

            // Intro text
            this.timeline
                .to(
                    ".intro-text .animatethis", {
                        yPercent: -100,
                        stagger: 0.07,
                        ease: "back.out(1.2)",
                        onComplete: resolve,
                    }
                )
                
                .to(
                    ".arrow-svg-wrapper", {
                        opacity: 1,
                    }, "arrow"
                );
        });
    }

    onScroll(e) {
        // Check if the second intro has already been played
        if (e.deltaY > 0 && !this.secondIntroPlayed) {
            this.removeEventListeners(); // Remove the event listener
            this.playSecondIntro();
            this.secondIntroPlayed = true; // Set the flag to true
            this.secondIntro().then(() => {
                this.experience.world.room.setAnimation();  // This will trigger the animation in Room
            });
        }
    }

    onTouch(e) {
        this.initalY = e.touches[0].clientY;
        this.playSecondIntro();
        this.secondIntro().then(() => {
            console.log("ANIMATION", this.experience.world.room);
            this.experience.world.room.setAnimation();  // This will trigger the animation in Room
        });
    }

    onTouchMove(e) {
        let currentY = e.touches[0].clientY;
        let difference = this.initalY - currentY;
        if (difference > 0) {
            this.removeEventListeners();
            this.playSecondIntro();
            
        }
        this.intialY = null;
        this.secondIntro().then(() => {
            console.log("ANIMATION", this.experience.world.room);
            this.experience.world.room.setAnimation();  // This will trigger the animation in Room
        });
    }

    removeEventListeners() {
        window.removeEventListener("wheel", this.scrollOnceEvent);
        window.removeEventListener("touchstart", this.touchStart);
        window.removeEventListener("touchmove", this.touchMove);
    }

    secondIntro() {
        return new Promise((resolve) => {
            this.secondTimeline = new GSAP.timeline();

            this.secondTimeline
            .to(
                ".intro-text .animatethis", {
                    yPercent: 100,
                    stagger: 0.05,
                    ease: "back.in(1.2)",
                }, "fadeout"
            )
            
            .to(
                ".arrow-svg-wrapper", {
                    opacity: 0,
                }, "fadeout"
            );

            this.secondTimeline
                .to(this.room.position, {
                    x: 0,
                    y: 0,
                    z: 0,
                    ease: "power1.out",
                }, "same")

                .to(this.roomChildren.intro.rotation, {
                    y: 2 * Math.PI + Math.PI / 4,
                }, "same")

                .to(this.roomChildren.intro.scale, {
                    x: 2.65,
                    y: 4,
                    z: 3.3,
                }, "same")
                .to(this.camera.orthographicCamera.position, {
                    y: 4.5,
                }, "same")
                .to(this.roomChildren.intro.position, {
                    x: -0.0334,
                    y: 53,
                    z: 0.0343,
                }, "same")

                .set(this.roomChildren.roombody.scale, {
                    x : 35.249794006347656,
                    y : 0.8918224573135376,
                    z : 33.18917465209961,
                    ease: "power1.out",
                }, "room")
                .set(this.roomChildren.roombody.position, {
                    x : -0.3563728332519531,
                    y : 1.0322036743164062,
                    z: -1.2040023803710938,
                }, "room")

                .to(this.roomChildren.intro.scale, {
                    x: 0,
                    y: 0,
                    z: 0,
                    delay: 1,
                }, "fade")

                .to(this.roomChildren.intro.position, {
                    x: 1,
                    y: 0,
                    z: 49,
                    delay: 1,
                }, "fade")

                .to(
                    ".hero-main-title .animatethis", {
                        yPercent: -100,
                        stagger: 0.07,
                        ease: "back.out(1.2)",
                    }, "fade"
                )

                .to(
                    ".hero-main-description .animatethis", {
                        yPercent: -100,
                        stagger: 0.07,
                        ease: "back.out(1.2)",
                    }, "fade"
                )

                .to(
                    ".first-sub .animatethis", {
                        yPercent: -100,
                        stagger: 0.07,
                        ease: "back.out(1.2)",
                    }, "fade"
                )

                .to(
                    ".second-sub .animatethis", {
                        yPercent: -100,
                        stagger: 0.07,
                        ease: "back.out(1.2)",
                    }, "fade"
                )
                

                .to(this.roomChildren.glass.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    ease: "power1.out",
                }, "shelf")

                .to(this.roomChildren.glass.position, {
                    x : -24.632801055908203,
                    y : 52.865684509277344,
                    z : 23.77675437927246,
                    ease: "power1.out",
                }, "shelf")

                //Shelf/Table -> Cupboards one by one
                .to(this.roomChildren.table.scale, {
                    x: 11.113993644714355,
                    y: 2.540747880935669,
                    z: 27.743366241455078,
                    ease: "power1.out",
                }, "shelf")       

                .to(this.roomChildren.shelf.scale, {
                    x: -5.926701545715332,
                    y: -8.5711030960083,
                    z: -16.119741439819336,
                    ease: "power1.out",
                }, "shelf")

                .to(this.roomChildren.cuupboard1.scale, {
                    x: 1.006807804107666,
                    y: 1.006807804107666,
                    z: 0.659254789352417,
                    ease: "power1.out",
                }, "cupboard1")

                .to(this.roomChildren.cupboard2.scale, {
                    x: 1.006807804107666,
                    y: 1.006807804107666,
                    z: 0.659254789352417,
                    ease: "power1.out",
                }, "cupboard2")

                .to(this.roomChildren.cupboard3.scale, {
                    x: 1.006807804107666,
                    y: 1.006807804107666,
                    z: 1.006807804107666,
                    ease: "power1.out",
                }, "cupboard3")

                // Electronics
                .to(this.roomChildren.ipad1.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    ease: "power1.out",
                }, "electronics")

                .to(this.roomChildren["ipad_mini_6th(space_grey)002"].scale, {
                    x: 4.066781044006348,
                    y: 4.066781044006348,
                    z: 4.066781044006348,
                    ease: "power1.out",
                }, "electronics")

                .to(this.roomChildren.keycaps_lable_3001.scale, {
                    x: 3.193986415863037,
                    y: 3.193986177444458,
                    z: 3.193986415863037,
                    ease: "power1.out",
                }, "electronics")

                .to(this.roomChildren.laptop_screen.scale, {
                    x: 5.573425769805908,
                    y: 5.4929609298706055,
                    z: 3.2708168029785156,
                    ease: "power1.out",
                }, "electronics")

                .to(this.roomChildren.tv.scale, {
                    x: 11.677042007446289,
                    y: 11.677042007446289,
                    z: 6.954728126525879,
                    ease: "power1.out",
                }, "electronics")

                .to(this.roomChildren.tv_screen.scale, {
                    x: 11.677042007446289,
                    y: 11.677042007446289,
                    z: 6.954728126525879,
                    ease: "power1.out",
                }, "electronics")

                .to(this.roomChildren.wire.scale, {
                    x: 1.8493075370788574,
                    y: 1.8499488830566406,
                    z: 2.0393271446228027,
                    ease: "power1.out",
                }, "electronics")

                .to(this.roomChildren.keychron_k8_pro002.scale, {
                    x: 42.13187026977539,
                    y: 42.131866455078125,
                    z: 42.13187026977539,
                    ease: "power1.out",
                }, "electronics")

                // Display items 
                .to(this.roomChildren.book1.scale, {
                    x: 1.006807804107666,
                    y: 1.006807804107666,
                    z: 1.006807804107666,
                    ease: "power1.out",
                }, "chair")

                //Chair
                .to(this.roomChildren.hardware002.scale, {
                    x: 19.73757553100586,
                    y: 19.73757553100586,
                    z: 19.73757553100586,
                    ease: "power1.out",
                }, "chair")

                .to(this.roomChildren.hardware046.scale, {
                    x: 19.73757553100586,
                    y: 19.73757553100586,
                    z: 19.73757553100586,
                    ease: "power1.out",
                }, "chair")

                //Peppy and Totoro
                .to(this.roomChildren.totoro1.scale, {
                    x : 7.470579147338867,
                    y : 7.470578670501709,
                    z : 7.470579147338867,
                    ease: "power1.out",
                }, "floorobj")

                .to(this.roomChildren.totoro2.scale, {
                    x : 7.470579147338867,
                    y : 7.470578670501709,
                    z : 7.470579147338867,
                    ease: "power1.out",
                }, "floorobj")

                .to(this.roomChildren.peppy.scale, {
                    x : 0.3500126600265503,
                    y : 0.3500126302242279,
                    z : 0.3500126600265503,
                    ease: "power1.out",
                }, "floorobj")

                .to(this.roomChildren.tail.scale, {
                    x : 0.34764593839645386,
                    y : 0.34764593839645386,
                    z : 0.34764593839645386,
                    ease: "power1.out",
                    
                }, "floorobj")

                .to(
                    ".toggle-bar", {
                        opacity: 1,
                    }
                )

                .to(
                    ".infosite", {
                        opacity: 1,
                    }
                )

                .to(
                    ".arrow-svg-wrapper", {
                        opacity: 1,
                        onComplete: resolve
                    }
                )

        });

        

        
    }

    async playSecondIntro() {
        this.scaleFlag = true;
        await this.secondIntro();
        this.moveFlag = false;
        this.scaleFlag = false;
        this.emit("enablecontrols");
        console
    }

    scale() {
        this.roomChildren.rectLight.width = 0;
        this.roomChildren.rectLight.height = 0;

        if (this.device === "desktop") {
            this.room.scale.set(-0.04, 0.04, -0.04);
        } else {
            this.room.scale.set(-0.02, 0.02, -0.02);
        }
    }

    update() {
        if (this.moveFlag) {
            this.move();
        }

        if (this.scaleFlag) {
            this.scale();
        }
    }
}

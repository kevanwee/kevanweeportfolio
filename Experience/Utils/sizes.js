import { EventEmitter } from "events";

export default class Sizes extends EventEmitter {
    constructor() {
        super();
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.width/this.height;
        this.frustrum = 5;
        if(this.width < 968){
            this.device = "mobile";
        } else {
            this.device = "desktop";
        }
        this.updatePixelRatio();


        window.addEventListener("resize",()=>{
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.aspect = this.width/this.height; 
            this.updatePixelRatio();
            this.emit("resize");

            if(this.width < 968 && this.device !== 'mobile' ){
                this.device = "mobile";
                this.emit("switchdevice", this.device);
                this.updatePixelRatio();
                
            } else if (this.width >= 968 && this.device !== 'desktop') {
                this.device = "desktop";
                this.emit("switchdevice", this.device);
                this.updatePixelRatio();
            }
        })
    }

    updatePixelRatio() {
        const maxRatio = this.device === "mobile" ? 1.5 : 2;
        this.pixelRatio = Math.min(window.devicePixelRatio, maxRatio);
    }
}
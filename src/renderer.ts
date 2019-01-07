// three.js
import * as THREE from 'three'

export class Renderer extends THREE.WebGLRenderer
 {
    constructor(container) {
        // Initialize polyfill
        // @ts-ignore: Unreachable code error
        new WebVRPolyfill();
        
        super({antialias: true});

        // set size
        this.setSize(window.innerWidth, window.innerHeight)

        this.vr.enabled = true;

        // Add render view to container
        container.appendChild(this.domElement)

        // Addd button to container and initialize WebVR
        // @ts-ignore: Unreachable code error
        container.appendChild( WEBVR.createButton( this ) );
        console.log("created renderer");
    }

    render(scene, camera) {
        this.render(scene, camera)
    }

}
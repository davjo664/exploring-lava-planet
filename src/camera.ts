// three.js
import * as THREE from 'three'

export class Camera extends THREE.PerspectiveCamera {
    constructor(aspectRatio) {
        super(60, aspectRatio,2, 10000);

        // this.position.set( 5, 74, 5 );
        // this.position.set( - 1200, 1000, 1200 );
        this.lookAt( 0, 0, 0 );
    }

    update() {
        // var time = performance.now() / 5000;

        // this.position.x = Math.sin( time ) * 5;
        // this.position.z = Math.cos( time ) * 5;
        this.lookAt( 0, 0, 0 );
    }
}
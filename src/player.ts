// three.js
import * as THREE from 'three'

export class Player extends THREE.Object3D {
    constructor(scene, camera) {
        super();
        console.log("Player");
        console.log(this);
        scene.add( this );
        this.position.set(0,1500,0);
        this.add( camera );
    }

    update() {
        var time = performance.now() / 5000;
        this.position.x = Math.sin( time ) * 5;
        this.position.z = Math.cos( time ) * 5;
    }
}
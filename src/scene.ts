// three.js
import * as THREE from 'three'

export class Scene extends THREE.Scene {
    constructor() {
        super();

        // add lights
        let light = new THREE.DirectionalLight(0xffffff, 1.0)
        light.position.set(100, 100, 100)
        this.add(light)

        var ambient = new THREE.HemisphereLight( 0xbbbbff, 0x886666, 0.75 );
        ambient.position.set( -0.5, 0.75, -1 );
        this.add( ambient );
    }
}
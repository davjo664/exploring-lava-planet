// three.js
import * as THREE from 'three'

export class Scene extends THREE.Scene {
    constructor() {
        super();
        // add axis to the scene
        // let axis = new THREE.AxesHelper(2)
        // this.add(axis);

        this.add( new THREE.GridHelper( 10, 10 ) );

        // add lights
        let light = new THREE.DirectionalLight(0xffffff, 1.0)
        light.position.set(100, 100, 100)
        this.add(light)

        var ambient = new THREE.HemisphereLight( 0xbbbbff, 0x886666, 0.75 );
        ambient.position.set( -0.5, 0.75, -1 );
        this.add( ambient );

        this.background = new THREE.Color( 0x222222 );
    }
}
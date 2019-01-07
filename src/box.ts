// three.js
import * as THREE from 'three'

export class Box extends THREE.Mesh {
    constructor(width, height, depth) {
        let material = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa,
            wireframe: false
        })
        super(new THREE.BoxGeometry(width, height, depth), material);

        this.position.x = 0.5
        this.rotation.y = 0.5
    }

    update() {
        let timer = 0.002 * Date.now()
        this.position.y = 0.5 + 0.5 * Math.sin(timer)
    }
}
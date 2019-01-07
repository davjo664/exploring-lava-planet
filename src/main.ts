// three.js
import * as THREE from 'three'

// local imports
import { Renderer } from './renderer';
import { Camera } from './camera';
import { Scene } from './scene';
import { Box } from './box';

export class Main {
    private scene: Scene;
    private camera: Camera;
    private renderer: Renderer;
    private box: Box;
    private container: any;
    constructor(container) {

        // // the HTML container
        this.container = container;

        // create the renderer
        this.renderer = new Renderer(this.container);
        
        // create the scene
        this.scene = new Scene();

        // create the camera
        const aspectRatio = this.renderer.domElement.width / this.renderer.domElement.height;
        this.camera = new Camera(aspectRatio);
        
        // create the box
        this.box = new Box(3,3,3);
        this.scene.add(this.box)

        // Initial size update set to canvas container
        this.updateSize();

        // Listeners
        document.addEventListener('DOMContentLoaded', () => this.updateSize(), false);
        window.addEventListener('resize', () => this.updateSize(), false);
        
        this.render()

        // Hide loading text
        this.container.querySelector('#loading').style.display = 'none';
    
    }

    updateSize() {
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.camera.updateProjectionMatrix();
    }

    render(): void {
        this.box.update();
        this.camera.update();
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
    }
}
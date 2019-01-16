// three.js
import * as THREE from 'three';

// local imports
import { Renderer } from './renderer';
import { Camera } from './camera';
import { Scene } from './scene';
import { Player } from './player';

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var uniformsNormal,
heightMap, normalMap,
quadTarget;

var vector = new THREE.Vector3(0,-1,0);

export class Main {
    private scene: Scene;
    private camera: Camera;
    private renderer: THREE.WebGLRenderer;
    private container: any;
    private player: Player;
    private controls: any;
    private clock: any;
    private uniformsNoise: any;
    constructor(container) {

        this.clock = new THREE.Clock();

        // // the HTML container
        this.container = container;

        // create the renderer
        // this.renderer = new Renderer(this.container);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
        container.appendChild( this.renderer.domElement );
        
        // create the scene
        this.scene = new Scene();

        // create the camera
        const aspectRatio = this.renderer.domElement.width / this.renderer.domElement.height;
        this.camera = new Camera(aspectRatio);

        // @ts-ignore: Unreachable code error
        this.controls = new FlyControls( this.camera, container );
        this.controls.movementSpeed = 0;
        this.controls.domElement = container;
        this.controls.rollSpeed = Math.PI / 4;

        this.player = new Player(this.scene, this.camera);

        // Initial size update set to canvas container
        this.updateSize();

        // Listeners
        document.addEventListener('DOMContentLoaded', () => this.updateSize(), false);
        window.addEventListener('resize', () => this.updateSize(), false);
        
        this.render()

        this.uniformsNoise = {
            time: { value: 1.0 },
            scale: { value: 500.0 },
            offset: { value: new THREE.Vector2( 0, 0 ) },
            texture: { value: new THREE.TextureLoader().load( 'assets/gradient.png' ) }
        };

        // SKY MESH
        var geometrySky = new THREE.SphereBufferGeometry(6000,32,32, Math.PI );

        // invert the geometry on the x-axis so that all of the faces point inward
        geometrySky.scale( - 1, 1, 1 );
        
        var mesh2 = new THREE.Mesh( geometrySky, new THREE.ShaderMaterial( {
            uniforms: {},
            vertexShader: document.getElementById( 'vertSky' ).textContent,
            fragmentShader: document.getElementById( 'fragSky' ).textContent
        }));
        this.scene.add( mesh2 );

        // TERRAIN MESH
        var geometryTerrain = new THREE.PlaneBufferGeometry( 6000, 6000, 256, 256 );
        var terrain = new THREE.Mesh( geometryTerrain, new THREE.ShaderMaterial( {
            uniforms: this.uniformsNoise,
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShaderNoise' ).textContent
        }) );
        terrain.position.set( 0, 0, 0 );
        terrain.rotation.x = - Math.PI / 2;
        this.scene.add( terrain );

        // LAVA MESH
        let lava = new THREE.Mesh( geometryTerrain, new THREE.ShaderMaterial( {
            uniforms: this.uniformsNoise,
            vertexShader: document.getElementById( 'vertLava' ).textContent,
            fragmentShader: document.getElementById( 'fragLava' ).textContent
        }));
        lava.rotation.x = - Math.PI / 2;
        lava.position.set(0,200,0);
        this.scene.add(lava);
    
    }

    updateSize() {
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.camera.updateProjectionMatrix();
    }

    render(): void {

        var delta = this.clock.getDelta();

        if (this.uniformsNoise) {
            this.uniformsNoise[ 'offset' ].value.y -= this.camera.getWorldDirection( vector ).z * 0.003;
            this.uniformsNoise[ 'offset' ].value.x += this.camera.getWorldDirection( vector ).x * 0.003;
            this.uniformsNoise[ 'time' ].value = 0.5*this.clock.elapsedTime;
        }

        this.controls.update( delta );
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
        
    }
}
// three.js
import * as THREE from 'three';

// local imports
import { Renderer } from './renderer';
import { Camera } from './camera';
import { Scene } from './scene';
import { Poly } from './poly';
import { Player } from './player';

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var camera, scene;
var cameraOrtho, sceneRenderTarget;

var collidableMeshList = [];

var uniformsNormal,
heightMap, normalMap,
quadTarget;

var vector = new THREE.Vector3(0,-1,0);

var directionalLight, pointLight;

var terrain;

var animDelta = 0, animDeltaDir = - 1;
var lightVal = 0, lightDir = 1;

var clock = new THREE.Clock();

var updateNoise = true;

var mlib = {};

var uniforms2;

export class Main {
    private scene: Scene;
    private camera: Camera;
    private renderer: THREE.WebGLRenderer;
    private container: any;
    private player: Player;
    private controls: any;
    private clock: any;
    private physicsWorld: any;
    private threeObject: any;
    private transformAux1: any;
    private uniformsNoise: any;
    private uniformsTerrain: any;
    private raycaster: THREE.Raycaster;
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
        // this.controls.autoForward = false;
        // this.controls.dragToLook = true;

        this.player = new Player(this.scene, this.camera);

        // Initial size update set to canvas container
        this.updateSize();

        // Listeners
        document.addEventListener('DOMContentLoaded', () => this.updateSize(), false);
        window.addEventListener('resize', () => this.updateSize(), false);
        
        this.render()

        // POLY REST API
        let randomAssets = ['7Rr7j8S0q6C','fsUd856ZJZM']
        let poly = new Poly(randomAssets[Math.floor(Math.random()*randomAssets.length)]);
        this.scene.add( poly );

        // Hide loading text
        this.container.querySelector('#loading').style.display = 'none';

        


        // LIGHTS

        this.scene.add( new THREE.AmbientLight( 0x111111 ) );

        directionalLight = new THREE.DirectionalLight( 0xffffff, 1.15 );
        directionalLight.position.set( 500, 2000, 0 );
        this.scene.add( directionalLight );

        pointLight = new THREE.PointLight( 0xff4400, 1.5 );
        pointLight.position.set( 0, 0, 0 );
        this.scene.add( pointLight );
                
       

        this.uniformsNoise = {

            time: { value: 1.0 },
            scale: { value: new THREE.Vector2( 3, 3 ) },
            offset: { value: new THREE.Vector2( 0, 0 ) },
            texture: { value: new THREE.TextureLoader().load( 'src/explosion.png' ) }

        };

        // Add sky base 
        var geometry2 = new THREE.SphereBufferGeometry(6000,32,32, Math.PI );

        // invert the geometry on the x-axis so that all of the faces point inward
        geometry2.scale( - 1, 1, 1 );
        var material2 = new THREE.ShaderMaterial( {
            uniforms: {},
            vertexShader: document.getElementById( 'vertSky' ).textContent,
            fragmentShader: document.getElementById( 'fragSky' ).textContent
        } );
        // var material2 = new THREE.MeshBasicMaterial( {
        //     color:'red'
        // } );
        // material.side = THREE.BackSide;
        var mesh2 = new THREE.Mesh( geometry2, material2 );
        this.scene.add( mesh2 );


        var vertexShader = document.getElementById( 'vertexShader' ).textContent;

        // TEXTURES

        var loadingManager = new THREE.LoadingManager( function () {

            terrain.visible = true;

        } );
        var textureLoader = new THREE.TextureLoader( loadingManager );


        var diffuseTexture1 = textureLoader.load( "assets/grasslight-big.jpg" );
        var diffuseTexture2 = textureLoader.load( "assets/backgrounddetailed6.jpg" );
        var detailTexture = textureLoader.load( "assets/grasslight-big-nm.jpg" );

        diffuseTexture1.wrapS = diffuseTexture1.wrapT = THREE.RepeatWrapping;
        diffuseTexture2.wrapS = diffuseTexture2.wrapT = THREE.RepeatWrapping;
        detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;

        // TERRAIN SHADER

        // @ts-ignore: Unreachable code error
        var terrainShader = ShaderTerrain[ "terrain" ];

        this.uniformsTerrain = THREE.UniformsUtils.clone( terrainShader.uniforms );




        uniforms2 = {
            time: { value: 1.0 },
            texture: { value: new THREE.TextureLoader().load( 'src/explosion.png' ) }
        }

        var params = [
            [ 'heightmap', 	document.getElementById( 'fragmentShaderNoise' ).textContent, 	vertexShader, this.uniformsNoise, false ]
            ];

        for ( var i = 0; i < params.length; i ++ ) {

            var material = new THREE.ShaderMaterial( {

                uniforms: params[ i ][ 3 ],
                vertexShader: params[ i ][ 2 ],
                fragmentShader: params[ i ][ 1 ]
            } );

            mlib[ params[ i ][ 0 ] ] = material;

        }

        var plane = new THREE.PlaneBufferGeometry( SCREEN_WIDTH, SCREEN_HEIGHT );

        quadTarget = new THREE.Mesh( plane, new THREE.MeshBasicMaterial( { color: 0x000000 } ) );
        quadTarget.position.z = - 500;
        quadTarget.receiveShadow = true;
        quadTarget.castShadow = true;
        // sceneRenderTarget.add( quadTarget );

        // TERRAIN MESH

        var geometryTerrain = new THREE.PlaneBufferGeometry( 6000, 6000, 256, 256 );

        let terrain2 = new THREE.Mesh( geometryTerrain, new THREE.ShaderMaterial( {
            uniforms: this.uniformsNoise,
            vertexShader: document.getElementById( 'vertLava' ).textContent,
            fragmentShader: document.getElementById( 'fragLava' ).textContent
        }));
        
        // @ts-ignore: Unreachable code error
        BufferGeometryUtils.computeTangents( geometryTerrain );

        terrain = new THREE.Mesh( geometryTerrain, mlib[ 'heightmap' ] );
        terrain.name = "ground";
        // terrain.receiveShadow = true;
        // terrain.castShadow = true;
        terrain.position.set( 0, 0, 0 );
        terrain.rotation.x = - Math.PI / 2;
        terrain.visible = false;
        this.scene.add( terrain );
        terrain2.rotation.x = - Math.PI / 2;
        terrain2.position.set(0,200,0);
        this.scene.add(terrain2);
        
        this.initPhysics();

        this.raycaster = new THREE.Raycaster();
    
    }

    initPhysics() {
        // Physics configuration
        // @ts-ignore: Unreachable code error
        let AmmoPhysics = Ammo;
        let collisionConfiguration = new AmmoPhysics.btDefaultCollisionConfiguration();
        let dispatcher = new AmmoPhysics.btCollisionDispatcher( collisionConfiguration );
        let broadphase = new AmmoPhysics.btDbvtBroadphase();
        let solver = new AmmoPhysics.btSequentialImpulseConstraintSolver();
        this.physicsWorld = new AmmoPhysics.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
        this.physicsWorld.setGravity( new AmmoPhysics.btVector3( 0, - 40, 0 ) );

        var radius = 50;
        this.threeObject = new THREE.Mesh( new THREE.SphereBufferGeometry( radius, 20, 20 ), new THREE.MeshPhongMaterial( { color: 'red' } ) );
        var shape = new AmmoPhysics.btSphereShape( radius );
        shape.setMargin( 0.5 );

        this.threeObject.position.set( 0, 3000, 0);
    
        var mass = 10;
        var localInertia = new AmmoPhysics.btVector3( 0, 0, 0 );
        shape.calculateLocalInertia( mass, localInertia );
        var transform = new AmmoPhysics.btTransform();
        transform.setIdentity();
        var pos = this.threeObject.position;
        transform.setOrigin( new AmmoPhysics.btVector3( pos.x, pos.y, pos.z ) );
        var motionState = new AmmoPhysics.btDefaultMotionState( transform );
        var rbInfo = new AmmoPhysics.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
        var body = new AmmoPhysics.btRigidBody( rbInfo );
        this.threeObject.userData.physicsBody = body;
        this.threeObject.receiveShadow = true;
        this.threeObject.castShadow = true;
        // this.scene.add( this.threeObject );
        // dynamicObjects.push( threeObject );
        this.physicsWorld.addRigidBody( body );
        this.transformAux1 = new AmmoPhysics.btTransform();
        // this.player.add(this.threeObject);
    }

    updateSize() {
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.camera.updateProjectionMatrix();
    }

    render(): void {
        
        // if ( this.threeObject && this.threeObject.geometry ) {
        //     var originPoint = this.threeObject.position.clone();
        //     // console.log("hello");

        //     const position = this.threeObject.geometry.attributes.position;
        //     const vector = new THREE.Vector3();

        //     for ( let i = 0, l = position.count; i < l; i ++ ) {
        //         vector.fromBufferAttribute( position, i );
        //         vector.applyMatrix4( this.threeObject.matrixWorld );
        //         vector.sub( this.threeObject.position );

        //         var ray = new THREE.Raycaster( originPoint, vector.clone().normalize() );
        //         var collisionResults = ray.intersectObjects( collidableMeshList );
        //     //     if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
        //     //         console.log("HIT");
        //     }
        // }

        var delta = this.clock.getDelta();
        if (this.physicsWorld) {
            this.physicsWorld.stepSimulation( delta, 10 );
            var objPhys = this.threeObject.userData.physicsBody;
            var ms = objPhys.getMotionState();
            if ( ms ) {
                ms.getWorldTransform( this.transformAux1 );
                var p = this.transformAux1.getOrigin();
                var q = this.transformAux1.getRotation();
                this.threeObject.position.set( p.x(), p.y(), p.z() );
                this.threeObject.quaternion.set( q.x(), q.y(), q.z(), q.w() );


                if(this.raycaster) {
                    this.raycaster.set( this.player.position, new THREE.Vector3(0,-1,0) );
                    var intersects = this.raycaster.intersectObject(terrain);
                    // console.log(intersects);
                    if (intersects.length > 0) {
                        // console.log(this.player.position);
                        // this.player.position.y = this.threeObject.position.y;

                        if (this.uniformsNoise && this.uniformsTerrain && this.player.position) {
                            this.uniformsNoise[ 'offset' ].value.y -= this.camera.getWorldDirection( vector ).z * 0.01;
                            this.uniformsTerrain[ 'uOffset' ].value.y = 4 * this.uniformsNoise[ 'offset' ].value.y;
                
                            this.uniformsNoise[ 'offset' ].value.x += this.camera.getWorldDirection( vector ).x * 0.01;
                            this.uniformsTerrain[ 'uOffset' ].value.x = 4 * this.uniformsNoise[ 'offset' ].value.x;

                            this.uniformsNoise[ 'time' ].value = 0.5*this.clock.elapsedTime;
                
                            // quadTarget.material = mlib[ 'heightmap' ];
                            // this.renderer.render( sceneRenderTarget, cameraOrtho, heightMap, true );
                
                            // quadTarget.material = mlib[ 'normal' ];
                            // this.renderer.render( sceneRenderTarget, cameraOrtho, normalMap, true );
                        }
                    }
                }
                // if(p.y() > 100) {
                    
                // }
            }
        }

        // if(uniforms2)
        // uniforms2.time.value = 0.5*this.clock.elapsedTime;

        this.controls.update( delta );
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
        
    }
}
import * as THREE from 'three'
import './style.css'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import backgroundTexture from '/maxwell/bg.jpg'


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const Canvas = document.querySelector('#Mainwell')!;

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: Canvas
  });

//adjust renderers resolution to users device resolution
renderer.setPixelRatio(window.devicePixelRatio);
//set renderer size to screensize
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(25);
camera.position.setX(-9);
camera.position.setY(-1);
// Render Scene 
renderer.render(scene, camera);

const pointLight = new THREE.PointLight('#2596be', 3.0, 100);

pointLight.position.set(20,30,10)

/* const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(300, 50);
scene.add(lightHelper, gridHelper); */



// set Lightning
const ambientLight = new THREE.AmbientLight(0x404040 ,4.5);
ambientLight.position.set(5,20,50);
scene.add(ambientLight);

const light = new THREE.SpotLight()
light.position.set(5, 5, 50)
scene.add(light)

/* const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true */

const backGround = new THREE.TextureLoader().load(backgroundTexture);
scene.background = backGround;


let loadedMaxwell: GLTF;
const loader = new GLTFLoader()
loader.load(
    '/maxwell/dingus_the_cat.glb',
    function (Maxwell) {
        Maxwell.scene.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
                const m = child as THREE.Mesh
                m.receiveShadow = true
                m.castShadow = true
            }
            if ((child as THREE.Light).isLight) {
                const l = child as THREE.Light
                l.castShadow = true
                l.shadow.bias = -0.003
                l.shadow.mapSize.width = 2048
                l.shadow.mapSize.height = 2048
            }
        })
        loadedMaxwell = Maxwell;
        Maxwell.scene.position.set(-10,-10,-10)
        scene.add(Maxwell.scene)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)
//Resize Function for the Canvas when user Resizes window
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      render()
  }


// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );



// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( '/maxwell/maxtheme.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0 );
	sound.play();
/*     muteBTN?.addEventListener('click',function enableMute(click){
        sound.setVolume(0);
    }); */
});

let isMuted = false;

const mute = document.getElementById("mute");
mute?.addEventListener("click", () => {
  isMuted = !isMuted;
  // Call function to mute/unmute the audio based on the value of `isMuted`
  toggleMute();
});

function toggleMute() {
    if (isMuted) {
      sound.gain.gain.value = 0;
    } else {
      sound.gain.gain.value = 1;
    }
  }


const previousMousePosition = new THREE.Vector2();
const currentMousePosition = new THREE.Vector2();
const mouseSpeed = 2;
const tiltSpeed = 0.5;

document.addEventListener('mousemove', onMouseMove, false);

function onMouseMove (event: MouseEvent) {
    // Get the mouse position relative to the center of the screen
    currentMousePosition.x = (event.clientX / window.innerWidth - 0.5) * 2;
    currentMousePosition.y = -(event.clientY / window.innerHeight - 0.5) * 2;
  
    // Calculate the difference between the current and previous mouse positions
    const mouseDelta = currentMousePosition.clone().sub(previousMousePosition);
    console.log(currentMousePosition);
    // Add the mouse delta to the current position of the loadedMaxwell
    if (loadedMaxwell && loadedMaxwell.scene) {
      loadedMaxwell.scene.position.x += mouseDelta.x * mouseSpeed;
      loadedMaxwell.scene.position.y += mouseDelta.y * mouseSpeed;
      loadedMaxwell.scene.rotation.z += mouseDelta.x * tiltSpeed;
    }
  
    // Update the previous mouse position
    previousMousePosition.copy(currentMousePosition);
  };



function animate() {
    if(loadedMaxwell){
        loadedMaxwell.scene.rotation.y -= 0.009;
    }
    requestAnimationFrame(animate)

    //controls.update()

    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()
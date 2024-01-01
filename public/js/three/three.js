import * as THREE from '/scripts/three/build/three.module.js';
import { OrbitControls } from '/scripts/three/examples/jsm/controls/OrbitControls.js';
import { Character } from './characterScript.js';

// Configuración básica
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear un plano
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
scene.add(plane);

// Crear el personaje (cubo)
const character = new Character();
scene.add(character.mesh);

// Posicionar la cámara
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Configurar OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2.15;

// Control de teclado
const keys = { W: false, A: false, S: false, D: false };

document.addEventListener('keydown', (event) => {
    handleKeyDown(event);
});

document.addEventListener('keyup', (event) => {
    handleKeyUp(event);
});

function handleKeyDown(event) {
    const key = event.key.toUpperCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
    }
}

function handleKeyUp(event) {
    const key = event.key.toUpperCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
    }
}

// Animación
const animate = function () {
    requestAnimationFrame(animate);

    // Mover el personaje según las teclas presionadas
    if (keys.W) character.moveForward();
    if (keys.A) character.moveLeft();
    if (keys.S) character.moveBackward();
    if (keys.D) character.moveRight();

    // Actualizar OrbitControls
    controls.update();

    renderer.render(scene, camera);
};

// Lanzar la animación
animate();

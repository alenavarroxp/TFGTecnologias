import * as THREE from "/scripts/three/build/three.module.js";
import { OrbitControls } from "/scripts/three/examples/jsm/controls/OrbitControls.js";
import { Character } from "./characterScript.js";

// Configuración básica
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear un plano
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0x999999,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
scene.add(plane);

// Crear el personaje (cubo)
const character = new Character(
  socket.id,
  {
    x: Math.random() * (10 - -10) + -10,
    y: 0.5,
    z: Math.random() * (10 - -10) + -10,
  },
  { x: 0, y: 0, z: 0 }
);
character.mesh.name = socket.id;
scene.add(character.mesh);

socket.emit("newCharacter", {
  id: socket.id,
  position: character.mesh.position,
  rotation: character.mesh.rotation,
});

// Posicionar la cámara
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Configurar OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 7.5;
controls.maxDistance = 25;

controls.enableZoom = true;
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.maxPolarAngle = Math.PI / 2.15;

// Control de teclado
const keys = { W: false, A: false, S: false, D: false };

document.addEventListener("keydown", (event) => {
  handleKeyDown(event);
});

document.addEventListener("keyup", (event) => {
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

  if (keys.W || keys.A || keys.S || keys.D)
    socket.emit("moveCharacter", {
      id: socket.id,
      position: character.mesh.position,
      rotation: character.mesh.rotation,
    });

  // Actualizar OrbitControls
  controls.update();

  renderer.render(scene, camera);
};

// Lanzar la animación
animate();

// socket.on("recuperarPersonajes", (id) => {
//   console.log("Recuperando personajes...");
//   scene.children.forEach((element) => {
//     if (!element.name) return;

//     if (element.name != id) {
//     //   console.log("Añadiendo personaje: ", element.name);
//     }
//   });
  
// });

socket.on("disconnected", (id) => {
  console.log("Desconectado del servidor");
  //ELIMINAR EL PERSONAJE DE LA ESCENA
  scene.children.forEach((element) => {
    if (element.name == id) {
      scene.remove(element);
    }
  });
});

socket.on("newCharacter", (obj) => {
  console.log("OBJ en newCharacter: ", obj);
  const character = new Character(obj.id, obj.position, obj.rotation);
  character.mesh.name = obj.id;
  scene.add(character.mesh);
  console.log("SCENE: ", scene.children);
});

socket.on("moveCharacter", (obj) => {
  console.log(
    "Se ha movido el personaje ",
    obj.id,
    " a la posición: ",
    obj.position
  );
  scene.children.forEach((element) => {
    if (element.name == obj.id) {
      element.position.set(obj.position.x, obj.position.y, obj.position.z);
    }
  });
});

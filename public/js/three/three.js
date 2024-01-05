import * as THREE from "/scripts/three/build/three.module.js";
import { OrbitControls } from "/scripts/three/examples/jsm/controls/OrbitControls.js";
import { Character } from "./characterThree.js";

const socket = io();
// Configuración básica
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const container = document.getElementById("container");
container.appendChild(renderer.domElement);

//LUZ DE VIDEOJUEGO HEMISPHERICA

const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
light.position.set(0, 1, 0);
scene.add(light);


var character;
const characters = [];

// Crear un plano
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshPhongMaterial({
  color: 0x999999,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// Posicionar la cámara
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Configurar OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 7.5;
controls.maxDistance = 100;

controls.enableZoom = true;
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.5;
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

let cameraMode = "default"; // Modo de la cámara por defecto

// Función para cambiar el modo de la cámara
function changeCameraMode() {
  if (cameraMode === "default") {
    // Cambiar a modo de seguir al jugador
    cameraMode = "followPlayer";
  } else {
    // Cambiar a modo por defecto
    cameraMode = "default";
    camera.position.set(5, 50, 5);
  }
}

// Asignar la función al evento de clic del botón
const changeCameraBtn = document.getElementById("changeCameraBtn");
changeCameraBtn.addEventListener("click", changeCameraMode);

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
// Añadir el panel al contenedor
container.appendChild(stats.dom);

const clock = new THREE.Clock();
// Animación
const animate = function () {
  stats.begin();
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  // Actualiza el mezclador de cada personaje
  characters.forEach((character) => {
    character.update(deltaTime);
  });
  // Mover el personaje según las teclas presionadas
  if (keys.W) character.moveForward(characters);
  if (keys.A) character.moveLeft(characters);
  if (keys.S) character.moveBackward(characters);
  if (keys.D) character.moveRight(characters);

  // Si no se presiona ninguna tecla, reproducir la animación de Idle
  if (character) {
    if (keys.W || keys.A || keys.S || keys.D) {
      // Si se presiona alguna tecla de movimiento, reproducir la animación de caminar
      character.playAnimation("CharacterArmature|Walk");
    } else {
      // Si no se presiona ninguna tecla, reproducir la animación Idle
      character.playAnimation("CharacterArmature|Idle");
    }
    try {
      socket.emit("moveCharacter", {
        id: socket.id,
        position: character.mesh.position,
        rotation: character.mesh.rotation,
        animation: character.animationName,
      });
    } catch (err) {}
  }

  // Actualizar OrbitControls
  controls.update();

  // Actualizar la posición de la cámara según el modo actual
  if (cameraMode === "followPlayer") {
    // Modo seguir al jugador
    camera.position
      .copy(character.mesh.position)
      .add(new THREE.Vector3(0, 5, 10));
    camera.lookAt(character.mesh.position);
  }

  renderer.render(scene, camera);
  stats.end();
};

//QUIERO HACER EL RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function eliminarPersonaje(id) {
  console.log(
    "Nombres de objetos antes de eliminar:",
    scene.children.map((obj) => obj.name)
  );

  const objectToRemove = scene.getObjectByName(id);

  if (objectToRemove) {
    console.log("ELIMINANDO ELEMENTO", objectToRemove);
    scene.remove(objectToRemove);

    // Limpia los recursos asociados al objeto si es necesario
    if (objectToRemove.dispose) {
      objectToRemove.dispose();
    }

    console.log(
      "Nombres de objetos despues de eliminar:",
      scene.children.map((obj) => obj.name)
    );
  } else {
    console.log("No se encontró el objeto con nombre", id);
  }
}

socket.on("connect", () => {
  console.log("Conectado al servidor: ", socket.id);
  // Crear el personaje (cubo)
  character = new Character(
    socket.id,
    {
      x: Math.random() * (10 - -10) + -10,
      y: 0,
      z: Math.random() * (10 - -10) + -10,
    },
    { x: 0, y: 0, z: 0 },
    0xff0000,
    (character) => {
      scene.add(character.mesh);
      characters.push(character);

      socket.emit("newCharacter", {
        id: character.id,
        position: character.mesh.position,
        rotation: character.mesh.rotation,
        color: 0x00ff00,
      });

      socket.emit("recuperarPersonajes", socket.id);
    }
  );
});

socket.on("disconnected", (id) => {
  console.log("Desconectado del servidor", id);
  isCreatingCharacter = false;
  eliminarPersonaje(id);
});

let isCreatingCharacter = false;

socket.on("newCharacter", (obj) => {
  console.log("Nuevo personaje: ", obj, "isCreatingCharacter", isCreatingCharacter);
  if(obj.from == "recuperar"){
    isCreatingCharacter = false;
    console.log("isCreatingCharacter", isCreatingCharacter);
  }
  if (isCreatingCharacter) return;

  isCreatingCharacter = true;
  const object = scene.getObjectByName(obj.id);

  if (!object) {
    const character = new Character(
      obj.id,
      obj.position,
      obj.rotation,
      obj.color,
      (character) => {
        scene.add(character.mesh);
        characters.push(character);
        console.log("scene.children", scene.children);
        isCreatingCharacter = false;
      }
    );
  }
});

socket.on("moveCharacter", (obj) => {
  scene.children.forEach((element) => {
    if (element.name == obj.id) {
      element.position.set(obj.position.x, obj.position.y, obj.position.z);
      element.rotation.set(obj.rotation._x, obj.rotation._y, obj.rotation._z);
      let character = characters.find((character) => character.id == obj.id);
      character.playAnimation(obj.animation);
    }
  });
});

socket.on("recuperarPersonajes", (id) => {
  scene.children.forEach((element) => {
    if (!element.name) return;
    if (element.name != id) {
      console.log("RECUPERAR")
      socket.emit("newCharacter", {
        id: element.name,
        position: element.position,
        rotation: element.rotation,
        color: 0x00ff00,
        from: "recuperar"
      });
    }
  });
});

document.getElementById("volver").addEventListener("click", () => {
  event.preventDefault();
  eliminarPersonaje(socket.id);
  window.location.href = "/";
});

animate();

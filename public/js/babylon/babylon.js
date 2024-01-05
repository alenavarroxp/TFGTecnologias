import { Character } from "./characterBabylon.js";

const socket = io();

function initScene() {
  // Obtener el canvas del documento
  const canvas = document.getElementById("renderCanvas");
  // Crear el motor de Babylon.js
  const engine = new BABYLON.Engine(canvas, true);

  // Crear una escena
  const scene = new BABYLON.Scene(engine);

  // Crear una cámara
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 4,
    70,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);
  camera.upperBetaLimit = Math.PI / 2.15; // Límite superior

  const cameraInitialPosition = camera.position.clone();

  // Crear una luz
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  // ...

  // Crear un plano de 50x50
  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 50, height: 50 },
    scene
  );

  // Crear un material para el suelo y establecer su color
  const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5); // Color gris

  // Asignar el material al suelo
  ground.material = groundMaterial;

  const characters = [];
  let character;

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
      cameraMode = "followPlayer";
    } else {
      cameraMode = "default";
      // Ajustar las propiedades de la cámara para volver a la posición inicial
      camera.position = cameraInitialPosition;
      camera.radius = 70;
      camera.alpha = -Math.PI / 2;
      camera.beta = Math.PI / 4;

      // Mira hacia el objetivo (ajusta según sea necesario)
      camera.setTarget(BABYLON.Vector3.Zero());
    }
  }

  // Asignar la función al evento de clic del botón
  const changeCameraBtn = document.getElementById("changeCameraBtn");
  changeCameraBtn.addEventListener("click", changeCameraMode);

  const stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  const GUI = document.getElementById("GUI");
  // Añadir el panel al contenedor
  GUI.appendChild(stats.dom);

  // Iniciar la renderización de la escena
  engine.runRenderLoop(() => {
    stats.begin();
    // Mover el personaje según las teclas presionadas
    if (keys.W) character.moveForward(characters, scene);
    if (keys.A) character.moveLeft(characters, scene);
    if (keys.S) character.moveBackward(characters, scene);
    if (keys.D) character.moveRight(characters, scene);

    if (keys.W || keys.A || keys.S || keys.D)
      socket.emit("moveCharacter", {
        id: socket.id,
        position: character.mesh.position,
        rotation: character.mesh.rotation,
      });
    if (cameraMode === "followPlayer") {
      // Ajusta el valor de lerpFactor según la suavidad deseada
      const lerpFactor = 0.1;

      // Calcula la posición deseada de la cámara
      const targetPosition = character.mesh.position
        .clone()
        .add(new BABYLON.Vector3(0, 10, -10));
      const targetRotation = character.mesh.rotation.clone(); // o ajusta según sea necesario

      // Aplica la interpolación (lerp) para suavizar el seguimiento del jugador
      camera.position = BABYLON.Vector3.Lerp(
        camera.position,
        targetPosition,
        lerpFactor
      );
      camera.rotation = BABYLON.Vector3.Lerp(
        camera.rotation,
        targetRotation,
        lerpFactor
      );

      // Mira al jugador
      camera.setTarget(character.mesh.position);
    }

    scene.render();
    stats.end();
  });

  // Redimensionar la escena cuando se cambie el tamaño de la ventana
  window.addEventListener("resize", () => {
    engine.resize();
  });

  function eliminarPersonaje(id) {
    const character = characters.find((character) => character.id === id);
    if (character) {
      character.mesh.dispose();
      const index = characters.indexOf(character);
      characters.splice(index, 1);
    }
  }

  socket.on("connect", () => {
    console.log("Conectado al servidor", socket.id);
    character = new Character(
      socket.id,
      new BABYLON.Vector3(
        Math.random() * (10 - -10) + -10,
        0,
        Math.random() * (10 - -10) + -10
      ),
      new BABYLON.Vector3(0, 0, 0),
      "#ff0000",
      scene,
      (character) => {
        characters.push(character);
        socket.emit("newCharacter", {
          id: socket.id,
          position: character.mesh.position,
          rotation: character.mesh.rotation,
          color: "#ff0000",
        });

        socket.emit("recuperarPersonajes", socket.id);
      }
    );
  });

  socket.on("disconnected", (id) => {
    console.log("Desconectado del servidor", id);
    eliminarPersonaje(id);
  });

  socket.on("newCharacter", (obj) => {
    const object = characters.find((character) => character.id === obj.id);
    if (!object) {
      const character = new Character(
        obj.id,
        obj.position,
        obj.rotation,
        obj.color,
        scene
      );
      console.log("Se ha creado el personaje: ", character);
      characters.push(character);
    }
  });

  socket.on("moveCharacter", (obj) => {
    const character = characters.find((character) => character.id === obj.id);
    if (character) {
      character.mesh.position.copyFrom(obj.position);
      character.mesh.rotation.copyFrom(obj.rotation);
    }
  });

  socket.on("recuperarPersonajes", (id) => {
    console.log("Recuperando personajes...");
    for (const character of characters) {
      socket.emit("newCharacter", {
        id: character.id,
        position: character.mesh.position,
        rotation: character.mesh.rotation,
        color: "#00ff00",
      });
    }
  });
}

// Inicializar la escena cuando se cargue el documento
document.addEventListener("DOMContentLoaded", () => {
  initScene();
});

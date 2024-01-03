import { Character } from "./characterBabylon.js";

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
    Math.PI / 2,
    Math.PI / 4,
    5,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

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
  // Crear un personaje usando la clase Character
  const character = new Character(
    "1",
    new BABYLON.Vector3(0, 0.5, 0),
    0,
    "#ff0000",
    scene
  );
  characters.push(character);

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
  // Iniciar la renderización de la escena
  engine.runRenderLoop(() => {
    scene.render();

    // Mover el personaje según las teclas presionadas
    if (keys.W) character.moveForward(characters);
    if (keys.A) character.moveLeft(characters);
    if (keys.S) character.moveBackward(characters);
    if (keys.D) character.moveRight(characters);
  });

  // Redimensionar la escena cuando se cambie el tamaño de la ventana
  window.addEventListener("resize", () => {
    engine.resize();
  });
}

// Inicializar la escena cuando se cargue el documento
document.addEventListener("DOMContentLoaded", () => {
  initScene();
});

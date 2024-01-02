function initScene() {
  // Obtener el canvas del documento
  const canvas = document.getElementById("renderCanvas");

  console.log("CANVAS", canvas);
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
  groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5); // Color rojo

  // Asignar el material al suelo
  ground.material = groundMaterial;

  // ...

  // Iniciar la renderización de la escena
  engine.runRenderLoop(() => {
    scene.render();
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

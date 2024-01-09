import * as THREE from "/scripts/three/build/three.module.js";
import { GLTFLoader } from "/scripts/three/examples/jsm/loaders/GLTFLoader.js";

export class Character {
  constructor(id, position, rotation, color, callback) {
    this.id = id;
    this.mesh = null;
    this.animations = {}; // Diccionario para almacenar animaciones
    this.mixer = null;
    this.isMoving = false;

    const loader = new GLTFLoader();
    loader.load("../../../models/character.glb", (gltf) => {
      this.mesh = gltf.scene;

      this.mesh.position.set(position.x, position.y, position.z);
      // this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
      this.mesh.scale.set(0.75, 0.75, 0.75);
      this.mesh.name = id;
      this.speed = 0.1;

      const characterMaterial = new THREE.MeshPhongMaterial({ color: color });

      const partsToColor = [
        "Body_2",
        "Body_3",
        "Body_4",
        "Ears",
        "Arms_1",
        "Head_2",
      ];
      this.mesh.traverse((object) => {
        if (object.isMesh && partsToColor.includes(object.name)) {
          object.material = characterMaterial;
        }
      });

      // Configura el mezclador de animaciones
      this.mixer = new THREE.AnimationMixer(this.mesh);

      // Almacena todas las animaciones en el diccionario
      gltf.animations.forEach((animation) => {
        this.animations[animation.name] = animation;
        if (!this.isMoving && animation.name == "CharacterArmature|Idle") {
          const action = this.mixer.clipAction(animation);
          action.setDuration(animation.duration);
          action.play();
        }
      });

      if (callback) {
        callback(this);
      }
    });
  }

  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  playAnimation(animationName) {
    if (this.mixer && this.animations[animationName]) {
      const action = this.mixer.clipAction(this.animations[animationName]);
      if (this.currentAction == action) return;

      // Detener la animación actual antes de reproducir la nueva
      if (this.currentAction) {
        this.currentAction.stop();
      }

      action.reset();
      action.play();
      this.animationName = animationName;
      this.currentAction = action; // Guardar la referencia a la acción actual
    }
  }

  moveForward(characters) {
    const newPosition = this.mesh.position.clone();
    newPosition.z -= this.speed;

    if (!this.checkCollisions(newPosition, characters)) {
      this.mesh.position.z = newPosition.z;
      this.smoothRotate(Math.PI); // Rotar 180 grados para ir hacia adelante
    }
  }

  moveBackward(characters) {
    const newPosition = this.mesh.position.clone();
    newPosition.z += this.speed;

    if (!this.checkCollisions(newPosition, characters)) {
      this.mesh.position.z = newPosition.z;
      this.smoothRotate(0); // Rotar 0 grados para ir hacia atrás
    }
  }

  moveLeft(characters) {
    const newPosition = this.mesh.position.clone();
    newPosition.x -= this.speed;

    if (!this.checkCollisions(newPosition, characters)) {
      this.mesh.position.x = newPosition.x;
      this.smoothRotate(-Math.PI / 2); // Rotar -90 grados para ir a la izquierda
    }
  }

  moveRight(characters) {
    const newPosition = this.mesh.position.clone();
    newPosition.x += this.speed;

    if (!this.checkCollisions(newPosition, characters)) {
      this.mesh.position.x = newPosition.x;
      this.smoothRotate(Math.PI / 2); // Rotar 90 grados para ir a la derecha
    }
  }
  smoothRotate(targetRotation) {
    this.mesh.rotation.y = this.lerpAngle(
      this.mesh.rotation.y,
      targetRotation,
      0.1
    );
  }

  lerpAngle(a, b, t) {
    const shortestDistance = this.shortestAngleDistance(a, b);
    return a + t * shortestDistance;
  }

  shortestAngleDistance(a, b) {
    const maxAngle = 2 * Math.PI; // El máximo valor para ángulos en radianes
    const angleDiff = (b - a + maxAngle) % maxAngle;
    return angleDiff > Math.PI ? angleDiff - maxAngle : angleDiff;
  }

  checkCollisions(newPosition, characters) {
    // Verificar colisiones con el plano
    if (newPosition.y < 0) {
      return true; // Colisión con el suelo, no permitir mover más abajo
    }

    // Verificar colisiones con otros personajes
    for (const character of characters) {
      if (character.id !== this.id) {
        const distance = newPosition.distanceTo(character.mesh.position);

        // Detener el movimiento si hay colisión con otro personaje
        if (distance < 1.5) {
          return true;
        }
      }
    }

    return false; // No hay colisiones
  }
}

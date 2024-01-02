import * as THREE from "/scripts/three/build/three.module.js";

export class Character {
  constructor(id, position, rotation) {
    // Crear el cubo como personaje
    this.id = id;
    this.geometry = new THREE.BoxGeometry();
    this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    console.log("Se ha creado el personaje: ", id, position, rotation);

    // Posicionar al personaje inicialmente
    this.mesh.position.set(position.x, position.y, position.z);

    // Velocidad del personaje
    this.speed = 0.1;
  }

  moveForward() {
    this.mesh.position.z -= this.speed;
  }

  moveBackward() {
    this.mesh.position.z += this.speed;
  }

  moveLeft() {
    this.mesh.position.x -= this.speed;
  }

  moveRight() {
    this.mesh.position.x += this.speed;
  }
}

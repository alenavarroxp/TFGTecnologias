import * as THREE from "/scripts/three/build/three.module.js";

export class Character {
  constructor(id, position, rotation, color) {
    // Crear el cubo como personaje
    this.id = id;
    this.geometry = new THREE.BoxGeometry();
    this.material = new THREE.MeshBasicMaterial({ color: color});
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    console.log("Se ha creado el personaje: ", id, position, rotation);

    // Posicionar al personaje inicialmente
    this.mesh.position.set(position.x, position.y, position.z);

    // Velocidad del personaje
    this.speed = 0.1;
  }

  moveForward(characters) {
    const newPosition = this.mesh.position.clone();
    newPosition.z -= this.speed;
  
    if (!this.checkCollisions(newPosition, characters)) {
      this.mesh.position.z = newPosition.z;
    }
  }
  
  moveBackward(characters) {
    const newPosition = this.mesh.position.clone();
    newPosition.z += this.speed;
  
    if (!this.checkCollisions(newPosition, characters)) {
      this.mesh.position.z = newPosition.z;
    }
  }
  
  moveLeft(characters) {
    const newPosition = this.mesh.position.clone();
    newPosition.x -= this.speed;
  
    if (!this.checkCollisions(newPosition, characters)) {
      this.mesh.position.x = newPosition.x;
    }
  }
  
  moveRight(characters) {
    const newPosition = this.mesh.position.clone();
    newPosition.x += this.speed;
  
    if (!this.checkCollisions(newPosition, characters)) {
      this.mesh.position.x = newPosition.x;
    }
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
        if (distance < 1.0) {
          return true;
        }
      }
    }
  
    return false; // No hay colisiones
  }
  
  
}

export class Character {
  constructor(id, position, rotation, color, scene) {
    // Crear el cubo como personaje
    this.id = id;
    this.mesh = BABYLON.MeshBuilder.CreateBox(id, { size: 1 }, scene);
    this.mesh.material = new BABYLON.StandardMaterial(`material_${id}`, scene);
    this.mesh.material.diffuseColor = new BABYLON.Color3.FromHexString(color);
    console.log("COLOR", this.mesh.material.diffuseColor.toHexString());
    // Posicionar al personaje inicialmente
    this.mesh.position = new BABYLON.Vector3(
      position._x,
      position._y,
      position._z
    );

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
        const distanceVector = newPosition.subtract(character.mesh.position);
        const distance = distanceVector.length();

        // Detener el movimiento si hay colisión con otro personaje
        if (distance < 1.0) {
          return true;
        }
      }
    }

    return false; // No hay colisiones
  }
}

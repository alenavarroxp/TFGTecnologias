import * as THREE from '/scripts/three/build/three.module.js';

export class Character {
    constructor() {
        // Crear el cubo como personaje
        this.geometry = new THREE.BoxGeometry();
        this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        // Posicionar al personaje inicialmente
        this.mesh.position.set(0, 0.5, 0);

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

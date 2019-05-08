function Particle(x, y, z, mass) {
  this.position = new THREE.Vector3(); // position
  this.previous = new THREE.Vector3(); // previous
  this.original = new THREE.Vector3(); // original
  initParameterizedPosition(x, y, this.position);
  initParameterizedPosition(x, y, this.previous);
  initParameterizedPosition(x, y, this.original);

  this.netForce = new THREE.Vector3(); // net force acting on particle
  this.mass = mass; // mass of the particle
}

Particle.prototype.lockToOriginal = function() {
  this.position.copy(this.original);
  this.previous.copy(this.original);
};

Particle.prototype.lock = function() {
  this.position.copy(this.previous);
  this.previous.copy(this.previous);
};

Particle.prototype.addForce = function(force) {
  // ----------- STUDENT CODE BEGIN ------------
  // Add the given force to the particle's total netForce.
  // ----------- Our reference solution uses 1 lines of code.
  this.netForce.add(force);
  // ----------- STUDENT CODE END ------------
};

Particle.prototype.integrate = function(deltaT) {
  // ----------- STUDENT CODE BEGIN ------------
  // Perform Verlet integration on this particle with the provided
  // timestep deltaT.
  //
  // You need to:
  // (1) Save the old (i.e. current) position into this.previous.
  // (2) Compute the new position of this particle using Verlet integration,
  //     and store it into this.position.
  // (3) Reset the net force acting on the particle (i.e. make it (0, 0, 0) again).
  // ----------- Our reference solution uses 13 lines of code.
  let prevCopy = new THREE.Vector3();
  prevCopy.copy(this.previous);

  this.previous.copy(this.position);

  let deltaPos = new THREE.Vector3();
  deltaPos.copy(this.position).sub(prevCopy); // TODO: check
  deltaPos.multiplyScalar(1-DAMPING);

  let accel = new THREE.Vector3();
  accel.copy(this.netForce).divideScalar(this.mass);
  accel.multiplyScalar(deltaT*deltaT);

  let newPos = new THREE.Vector3();
  newPos.copy(this.position);
  newPos.add(deltaPos).add(accel);

  this.netForce = new THREE.Vector3(0, 0, 0);

  this.position = newPos;
  // ----------- STUDENT CODE END ------------
};

Particle.prototype.handleFloorCollision = function() {
  // ----------- STUDENT CODE BEGIN ------------
  // Handle collision of this particle with the floor.
  // ----------- Our reference solution uses 3 lines of code.
  if (this.position.y < GROUND_Y) {
    this.position.y = GROUND_Y;
  }
  // ----------- STUDENT CODE END ------------
};

Particle.prototype.handleSphereCollision = function() {
  if (sphere.visible) {
    // ----------- STUDENT CODE BEGIN ------------
    // Handle collision of this particle with the sphere.
    let posFriction = new THREE.Vector3();
    let posNoFriction = new THREE.Vector3();
    // ----------- Our reference solution uses 28 lines of code.
    // check if particle inside sphere
    if (spherePosition.distanceTo(this.position) <= sphereSize) {
      // projection of particle's current position to nearest point on sphere's surface
      posNoFriction.subVectors(this.position, spherePosition).normalize().multiplyScalar(sphereSize).add(spherePosition);
      
      // check if particle was outside sphere in last time step
      if (prevSpherePosition.distanceTo(this.position) > sphereSize) {
        posFriction.copy(this.previous);
        // follow movement in last time step
        let sphereMov = new THREE.Vector3();
        sphereMov.subVectors(spherePosition, prevSpherePosition);
        posFriction.add(sphereMov);

        // weighted average
        let weightFric = new THREE.Vector3();
        let weightNoFric = new THREE.Vector3();
        weightFric.copy(posFriction).multiplyScalar(friction);
        weightNoFric.copy(posNoFriction).multiplyScalar(1-friction);

        this.position.copy(weightFric).add(weightNoFric);

      } else {
        this.position.copy(posNoFriction);
      }
    }
    // ----------- STUDENT CODE END ------------
  }
};

Particle.prototype.handleBoxCollision = function() {
  if (box.visible) {
    // ----------- STUDENT CODE BEGIN ------------
    // Handle collision of this particle with the axis-aligned box.
    let posFriction = new THREE.Vector3();
    let posNoFriction = new THREE.Vector3();
    // ----------- Our reference solution uses 61 lines of code.
    // check if particle inside box
    if (boundingBox.containsPoint(this.position)) {
      // projection of particle's current position to nearest point on box's surface
      let diffXLeft = this.position.x - boundingBox.min.x;
      let diffYBack = this.position.y - boundingBox.min.y;
      let diffYUnder = this.position.z - boundingBox.min.z;
      let diffXRight = boundingBox.max.x - this.position.x;
      let diffYFront = boundingBox.max.y - this.position.y;
      let diffZTop = boundingBox.max.z - this.position.z;

      let shortest = Infinity;
      if (diffXLeft < shortest) shortest = diffXLeft;
      if (diffYBack < shortest) shortest = diffYBack;
      if (diffYUnder < shortest) shortest = diffXRight;
      if (diffXRight < shortest) shortest = diffXLeft;
      if (diffYFront < shortest) shortest = diffYFront;
      if (diffZTop < shortest) shortest = diffZTop;

      posNoFriction.copy(this.position);

      if (shortest === diffXLeft) posNoFriction.x = boundingBox.min.x;
      if (shortest === diffYBack) posNoFriction.y = boundingBox.min.y;
      if (shortest === diffYUnder) posNoFriction.z = boundingBox.min.z;
      if (shortest === diffXRight) posNoFriction.x = boundingBox.max.x;
      if (shortest === diffYFront) posNoFriction.y = boundingBox.max.y;
      if (shortest === diffZTop) posNoFriction.z = boundingBox.max.z;

      // check if particle was outside box in last time step
      if (!boundingBox.containsPoint(this.previous)) {
        posFriction.copy(this.previous);

        // weighted average
        let weightFric = new THREE.Vector3();
        let weightNoFric = new THREE.Vector3();
        weightFric.copy(posFriction).multiplyScalar(friction);
        weightNoFric.copy(posNoFriction).multiplyScalar(1-friction);

        this.position.copy(weightFric).add(weightNoFric);

      } else {
        this.position.copy(posNoFriction);
      }
    }
    // ----------- STUDENT CODE END ------------
  }
};

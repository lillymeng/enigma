/****************************** CLOTH PROPERTIES ******************************/
// Which spring types to use in the cloth
var structuralSprings = true;
var shearSprings = true;
var bendingSprings = true;

// Similar to coefficient of friction
// 0 = frictionless, 1 = cloth sticks in place
var friction = 0.9;

var xSegs = 30; // how many particles wide is the cloth
var ySegs = 30; // how many particles tall is the cloth
var fabricLength = 500; // sets the length of the cloth in both dimensions

// Flag for whether cloth should avoid self intersections
var avoidClothSelfIntersection = false;

// This is a higher-order function used for the cloth's parametric geometry
// and for particles to compute their initial positions in space
var initParameterizedPosition = plane(500, 500);

/****************************** CONSTANTS ******************************/
// Rest distance coefficients for (B)ending springs and (S)hearing springs
var restDistance = fabricLength / xSegs;
var restDistanceB = 2;
var restDistanceS = Math.sqrt(2);

// Damping coefficient for integration
var DAMPING = 0.03;

// Mass of each particle in the cloth
var MASS = 0.1;

// Acceleration due to the gravity, scaled up experimentally for effect
var GRAVITY = 9.8 * 140;

// The timestep (or deltaT used in integration of the equations of motion)
// Smaller values result in a more stable simulation, but becomes slower.
// This value was found experimentally to work well in this simulation.
var TIMESTEP = 18 / 1000;

/****************************** HELPER FUNCTIONS ******************************/
// Used to parameterize the cloth's geometry and provide initial positions
// for the particles in the cloth
function plane(width, height) {
  return function(u, v, vec) {
    let x = u * width - width / 2;
    let y = 125;
    let z = v * height - height / 2;
    vec.set(x, y, z);
  };
}

/***************************** CONSTRAINT *****************************/
function Constraint(p1, p2, distance) {
  this.p1 = p1; // Particle 1
  this.p2 = p2; // Particle 2
  this.distance = distance; // Desired distance
}

Constraint.prototype.enforce = function() {
  // ----------- STUDENT CODE BEGIN ------------
  // Enforce this constraint by applying a correction to the two particles'
  // positions based on their current distance relative to their desired rest
  // distance.
  // ----------- Our reference solution uses 10 lines of code.
  let v12 = new THREE.Vector3();
  v12.subVectors(this.p2.position, this.p1.position);
  let v12Len = v12.length();
  let vCorr = new THREE.Vector3();
  vCorr.copy(v12).multiplyScalar((v12Len - this.distance)/v12Len);
  vCorr.multiplyScalar(0.5);
  this.p1.position.add(vCorr);
  this.p2.position.sub(vCorr);
  // ----------- STUDENT CODE END ------------
};

/****************************** CLOTH ******************************/
// Cloth constructor
// Parameters:
//   w: (int) number of segments width-wise
//   h: (int) number of segments height-wise
//   l: (int) actual length of the square cloth
//
// A cloth has the following properties:
//   this.w: (int) number of segments width-wise
//   this.h: (int) number of segments height-wise
//   this.constraints: (Constraints[]) list of Constraint objects
//      that constrain distances between some 2 particles in the cloth
//   this.particles: (Particles[]) list of Particle objects that make up the cloth
function Cloth(w, h, l) {
  // Internal helper function for computing 1D index into particles list
  // from a particle's 2D index
  function index(u, v) {
    return u + v * (w + 1);
  }
  this.index = index;

  // Width and height
  this.w = w;
  this.h = h;

  // Empty initial lists
  let particles = [];
  let constraints = [];

  // Create particles
  for (v = 0; v <= h; v++) {
    for (u = 0; u <= w; u++) {
      particles.push(new Particle(u / w, v / h, 0, MASS));
    }
  }

  // Edge constraints
  for (v = 0; v <= h; v++) {
    for (u = 0; u <= w; u++) {
      if (v < h && (u == 0 || u == w)) {
        constraints.push(
          new Constraint(particles[index(u, v)], particles[index(u, v + 1)], restDistance)
        );
      }

      if (u < w && (v == 0 || v == h)) {
        constraints.push(
          new Constraint(particles[index(u, v)], particles[index(u + 1, v)], restDistance)
        );
      }
    }
  }

  // Structural constraints
  if (structuralSprings) {
    // ----------- STUDENT CODE BEGIN ------------
    // Add structural constraints between particles in the cloth to the list of constraints.
    for (v = 0; v <= h; v++) {
      for (u = 0; u < w; u++) {
        constraints.push(
          new Constraint(particles[index(u, v)], particles[index(u+1, v)], restDistance)
        );
      }
    }
    for (v = 0; v < h; v++) {
      for (u = 0; u <= w; u++) {
        constraints.push(
          new Constraint(particles[index(u, v)], particles[index(u, v+1)], restDistance)
        );
      }
    }
    // ----------- Our reference solution uses 15 lines of code.
    // ----------- STUDENT CODE END ------------
  }

  // Shear constraints
  if (shearSprings) {
    // ----------- STUDENT CODE BEGIN ------------
    // Add shear constraints between particles in the cloth to the list of constraints.
    for (v = 0; v < h; v++) {
      for (u = 1; u <= w; u++) {
        constraints.push(
          new Constraint(particles[index(u, v)], particles[index(u-1, v+1)], restDistance*restDistanceS)
        );
      }
    }
    for (v = 0; v < h; v++) {
      for (u = 0; u < w; u++) {
        constraints.push(
          new Constraint(particles[index(u, v)], particles[index(u+1, v+1)], restDistance*restDistanceS)
        );
      }
    }
    // ----------- Our reference solution uses 21 lines of code.
    // ----------- STUDENT CODE END ------------
  }

  // Bending constraints
  if (bendingSprings) {
    // ----------- STUDENT CODE BEGIN ------------
    // Add bending constraints between particles in the cloth to the list of constraints.
    // ----------- Our reference solution uses 23 lines of code.
    for (v = 0; v <= h; v++) {
      for (u = 0; u < w-1; u++) {
        constraints.push(
          new Constraint(particles[index(u, v)], particles[index(u+2, v)], restDistance*restDistanceB)
        );
      }
    }
    for (v = 0; v < h-1; v++) {
      for (u = 0; u <= w; u++) {
        constraints.push(
          new Constraint(particles[index(u, v)], particles[index(u, v+2)], restDistance*restDistanceB)
        );
      }
    }
    // ----------- STUDENT CODE END ------------
  }

  // Store the particles and constraints lists into the cloth object
  this.particles = particles;
  this.constraints = constraints;
}

Cloth.prototype.applyGravity = function() {
  let particles = this.particles;
  // ----------- STUDENT CODE BEGIN ------------
  // For each particle in the cloth, apply force due to gravity.
  // ----------- Our reference solution uses 5 lines of code.
  for (let i = 0; i < particles.length; i++) {
    let g = new THREE.Vector3(0, -GRAVITY, 0);
    g.multiplyScalar(particles[i].mass);
    particles[i].addForce(g);
  }
  // ----------- STUDENT CODE END ------------
};

Cloth.prototype.applyWind = function() {
  let particles = this.particles;
  // ----------- STUDENT CODE BEGIN ------------
  // For each face in the cloth's geometry, apply a wind force.
  //
  // Here are some dummy values for a relatively boring wind.
  //
  // Try making it more interesting by making the strength and direction
  // of the wind vary with time. You can use the global variable `time`,
  // which stores (and is constantly updated with) the current Unix time
  // in milliseconds.
  //
  // One suggestion is to use sinusoidal functions. Play around with the
  // constant factors to find an appealing result!
  let windStrength = 30 * Math.cos(time/1000);
  let windForce = new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(windStrength);
  // ----------- Our reference solution uses 5 lines of code.
  // ----------- STUDENT CODE END ------------

  // Apply the wind force to the cloth particles
  let faces = clothGeometry.faces;
  for (i = 0; i < faces.length; i++) {
    let face = faces[i];
    let normal = face.normal;
    let tmpForce = normal
      .clone()
      .normalize()
      .multiplyScalar(normal.dot(windForce));
    particles[face.a].addForce(tmpForce);
    particles[face.b].addForce(tmpForce);
    particles[face.c].addForce(tmpForce);
  }
};

// Wrapper function that calls each of the other force-related
// functions, if applicable. Additional forces in the simulation
// should be added here.
Cloth.prototype.applyForces = function() {
  this.applyGravity();
  if (wind) {
    this.applyWind();
  }
};

Cloth.prototype.update = function(deltaT) {
  let particles = this.particles;
  // ----------- STUDENT CODE BEGIN ------------
  // For each particle in the cloth, have it update its position
  // by calling its integrate function.
  // ----------- Our reference solution uses 3 lines of code.
  for (let i = 0; i < particles.length; i++) {
    particles[i].integrate(deltaT);
  }
  // ----------- STUDENT CODE END ------------
};

Cloth.prototype.handleCollisions = function() {
  let particles = this.particles;
  // ----------- STUDENT CODE BEGIN ------------
  // For each particle in the cloth, call the appropriate function(s)
  // for handling collisions with various objects.
  //
  // Edit this function as you implement additional collision-detection functions.
  // ----------- Our reference solution uses 6 lines of code.
  for (let i = 0; i < particles.length; i++) {
    particles[i].handleFloorCollision();
    particles[i].handleSphereCollision();
    particles[i].handleBoxCollision();
  }
  // ----------- STUDENT CODE END ------------
};

Cloth.prototype.enforceConstraints = function() {
  let constraints = this.constraints;
  // ----------- STUDENT CODE BEGIN ------------
  // Enforce all constraints in the cloth.
  // ----------- Our reference solution uses 3 lines of code.
  for (let i = 0; i < constraints.length; i++) {
    constraints[i].enforce();
  }
  // ----------- STUDENT CODE END ------------
};

Cloth.prototype.handleSelfIntersections = function() {
  // ----------- STUDENT CODE BEGIN ------------
  // Handle self intersections within the cloth by repelling any
  // pair of particles back towards a natural rest distance.
  // This should be similar to how constraints are enforced to keep
  // particles close to each other, but in the opposite direction.
  //
  // A naive approach can do this in quadratic time.
  // For additional credit, try optimizing this further and showing us
  // the fps improvements that you achieve with your optimizations!
  let particles = this.particles;
  // ----------- Our reference solution uses 16 lines of code.
  // ----------- STUDENT CODE END ------------
};

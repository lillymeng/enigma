// Variables for simulation state; can be interactively changed in GUI
// These are their default values
var wind = false;
var wireframe = true;
var rotate = false;
var pinned = "Corners";
var object = "None";
var movingSphere = false;
var cornersPinned, oneEdgePinned, twoEdgesPinned, fourEdgesPinned, randomEdgesPinned;

// Variables used for random cloth pins
var randomPoints = [];
var rand, randX, randY;

// The cloth object
var cloth = new Cloth(xSegs, ySegs, fabricLength);

// Performs one timestep of the simulation.
// This function is repeatedly called in a loop, and its results are
// then rendered to the screen.
// For more info, see animate() in render.js.
function simulate() {
  // If toggled, update sphere position for interactive fun
  if (movingSphere && sphere.visible) {
    updateSpherePosition();
  }

  // Apply all relevant forces to the cloth's particles
  cloth.applyForces();

  // For each particle, perform Verlet integration to compute its new position
  cloth.update(TIMESTEP);

  // Handle collisions with other objects in the scene
  cloth.handleCollisions();

  // Handle self-intersections
  if (avoidClothSelfIntersection) {
    cloth.handleSelfIntersections();
  }

  // Apply cloth constraints
  cloth.enforceConstraints();

  // Pin constraints
  enforcePinConstraints();
}

/****** Helper functions for the simulation ******/
/****** You do not need to know how these work ******/

function pinCloth(choice) {
  if (choice == "Corners") {
    cornersPinned = true;
    oneEdgePinned = false;
    twoEdgesPinned = false;
    fourEdgesPinned = false;
    randomEdgesPinned = false;
  } else if (choice == "OneEdge") {
    cornersPinned = false;
    oneEdgePinned = true;
    twoEdgesPinned = false;
    fourEdgesPinned = false;
    randomEdgesPinned = false;
  } else if (choice == "TwoEdges") {
    cornersPinned = false;
    oneEdgePinned = false;
    twoEdgesPinned = true;
    fourEdgesPinned = false;
    randomEdgesPinned = false;
  } else if (choice == "FourEdges") {
    cornersPinned = false;
    oneEdgePinned = false;
    twoEdgesPinned = false;
    fourEdgesPinned = true;
    randomEdgesPinned = false;
  } else if (choice == "Random") {
    cornersPinned = false;
    oneEdgePinned = false;
    twoEdgesPinned = false;
    fourEdgesPinned = false;
    randomEdgesPinned = true;

    rand = Math.round(Math.random() * 10) + 1;
    randomPoints = [];
    for (r = 0; r < rand; r++) {
      randX = Math.round(Math.random() * xSegs);
      randY = Math.round(Math.random() * ySegs);
      randomPoints.push([randX, randY]);
    }
  } else if (choice == "None") {
    cornersPinned = false;
    oneEdgePinned = false;
    twoEdgesPinned = false;
    fourEdgesPinned = false;
    randomEdgesPinned = false;
  }
}

function enforcePinConstraints() {
  let particles = cloth.particles;
  if (cornersPinned) {
    // could also do particles[blah].lock() which will lock particles to
    // wherever they are, not to their original position
    particles[cloth.index(0, 0)].lockToOriginal();
    particles[cloth.index(xSegs, 0)].lockToOriginal();
    particles[cloth.index(0, ySegs)].lockToOriginal();
    particles[cloth.index(xSegs, ySegs)].lockToOriginal();
  } else if (oneEdgePinned) {
    for (u = 0; u <= xSegs; u++) {
      particles[cloth.index(u, 0)].lockToOriginal();
    }
  } else if (twoEdgesPinned) {
    for (u = 0; u <= xSegs; u++) {
      particles[cloth.index(0, u)].lockToOriginal();
      particles[cloth.index(xSegs, u)].lockToOriginal();
    }
  } else if (fourEdgesPinned) {
    for (u = 0; u <= xSegs; u++) {
      particles[cloth.index(0, u)].lockToOriginal();
      particles[cloth.index(xSegs, u)].lockToOriginal();
      particles[cloth.index(u, 0)].lockToOriginal();
      particles[cloth.index(u, xSegs)].lockToOriginal();
    }
  } else if (randomEdgesPinned) {
    for (u = 0; u < randomPoints.length; u++) {
      rand = randomPoints[u];
      randX = rand[0];
      randY = rand[1];
      particles[cloth.index(randX, randY)].lockToOriginal();
    }
  }
}

function placeObject(object) {
  if (object == "Sphere" || object == "sphere") {
    sphere.visible = true;
    box.visible = false;
    restartCloth();
  } else if (object == "Box" || object == "box") {
    sphere.visible = false;
    box.visible = true;
    restartCloth();
  } else if (object == "None" || object == "none") {
    sphere.visible = false;
    box.visible = false;
  }
}

function showWireframe(flag) {
  poleMaterial.wireframe = flag;
  clothMaterial.wireframe = flag;
  sphereMaterial.wireframe = flag;
}

function updateSpherePosition() {
  prevSpherePosition.copy(spherePosition);
  spherePosition.y = 50 * Math.sin(time / 600);
  spherePosition.x = 50 * Math.sin(time / 600);
  spherePosition.z = 50 * Math.cos(time / 600);
}

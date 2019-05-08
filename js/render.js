if (!Detector.webgl) Detector.addGetWebGLMessage();

var container;
var stats;
var controls;
var camera, scene, renderer;
var time;

var clothObject;
var clothGeometry;

var groundMaterial;

// Objects in the scene
var sphere;
var box;
var boundingBox;

var gui;
var guiControls;

var poleMaterial, clothMaterial, sphereMaterial;

// Property of the ground floor in the scene
var GROUND_Y = -249;

// Properties of the sphere in the scene
var sphereSize = 125;
var spherePosition = new THREE.Vector3(0, -250 + sphereSize, 0);
var prevSpherePosition = new THREE.Vector3(0, -250 + sphereSize, 0);

init();
animate();

function init() {
  // show student name and netID
  Student.updateHTML();

  container = document.createElement("div");
  document.body.appendChild(container);

  // scene (First thing you need to do is set up a scene)
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

  // camera (Second thing you need to do is set up the camera)
  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.y = 450;
  camera.position.z = 1500;
  scene.add(camera);

  // renderer (Third thing you need is a renderer)
  renderer = new THREE.WebGLRenderer({ antialias: true, devicePixelRatio: 1 });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(scene.fog.color);

  container.appendChild(renderer.domElement);
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.shadowMap.enabled = true;

  // This gives us stats on how well the simulation is running
  stats = new Stats();
  container.appendChild(stats.domElement);

  // mouse controls
  controls = new THREE.TrackballControls(camera, renderer.domElement);

  // lights (fourth thing you need is lights)
  let light, materials;
  scene.add(new THREE.AmbientLight(0x666666));
  light = new THREE.DirectionalLight(0xdfebff, 1.75);
  light.position.set(50, 200, 100);
  light.position.multiplyScalar(1.3);
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  let d = 300;
  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;
  light.shadow.camera.far = 1000;

  scene.add(light);

  // cloth (Now we're going to create the cloth)
  // every thing in our world needs a material and a geometry

  
  // this part allows us to use an image for the cloth texture
  // can include transparent parts
  var loader = new THREE.TextureLoader();
  var clothTexture = loader.load( "textures/patterns/illusion.png" );
  clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
  clothTexture.anisotropy = 16;
  

  // cloth material
  // this tells us the material's color, how light reflects off it, etc.

  clothMaterial = new THREE.MeshPhongMaterial({
    color: 0xaa2929,
    specular: 0x030303,
    wireframeLinewidth: 2,
    map: clothTexture,
    side: THREE.DoubleSide,
    alphaTest: 0.5,
  });

  // cloth geometry
  // the geometry contains all the points and faces of an object
  clothGeometry = new THREE.ParametricGeometry(initParameterizedPosition, cloth.w, cloth.h);
  clothGeometry.dynamic = true;

  
  // more stuff needed for the texture
  var uniforms = { texture:  { type: "t", value: clothTexture } };
  var vertexShader = document.getElementById( 'vertexShaderDepth' ).textContent;
  var fragmentShader = document.getElementById( 'fragmentShaderDepth' ).textContent;
  

  // cloth mesh
  // a mesh takes the geometry and applies a material to it
  // so a mesh = geometry + material
  clothObject = new THREE.Mesh(clothGeometry, clothMaterial);
  clothObject.position.set(0, 0, 0);
  clothObject.castShadow = true;

  // whenever we make something, we need to also add it to the scene
  scene.add(clothObject); // add cloth to the scene

  
  // more stuff needed for texture
  clothObject.customDepthMaterial = new THREE.ShaderMaterial( {
  uniforms: uniforms,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide
  } );
  

  // sphere
  // sphere geometry
  let sphereGeo = new THREE.SphereGeometry(sphereSize, 20, 20);
  // sphere material
  sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.01,
  });
  // sphere mesh
  sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  scene.add(sphere); // add sphere to scene

  // ground

  
  // needed for ground texture
  var groundTexture = loader.load( "textures/terrain/illusion-ground.png" );
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set( 25, 25 );
  groundTexture.anisotropy = 16;
  

  // ground material
  groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x404761, //0x3c3c3c,
    specular: 0x404761, //0x3c3c3c//,
    map: groundTexture
  });

  // ground mesh
  let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000), groundMaterial);
  mesh.position.y = GROUND_Y - 1;
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh); // add ground to scene

  // poles
  let poleGeo = new THREE.BoxGeometry(5, 250 + 125, 5);
  poleMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x111111,
    shininess: 100,
    side: THREE.DoubleSide,
  });

  let pole1 = new THREE.Mesh(poleGeo, poleMaterial);
  pole1.position.x = -250;
  pole1.position.z = 250;
  pole1.position.y = -(125 - 125 / 2);
  pole1.receiveShadow = false;
  pole1.castShadow = false;
  scene.add(pole1);

  let pole2 = new THREE.Mesh(poleGeo, poleMaterial);
  pole2.position.x = 250;
  pole2.position.z = 250;
  pole2.position.y = -(125 - 125 / 2);
  pole2.receiveShadow = false;
  pole2.castShadow = false;
  scene.add(pole2);

  let pole3 = new THREE.Mesh(poleGeo, poleMaterial);
  pole3.position.x = 250;
  pole3.position.z = -250;
  pole3.position.y = -(125 - 125 / 2);
  pole3.receiveShadow = false;
  pole3.castShadow = false;
  scene.add(pole3);

  let pole4 = new THREE.Mesh(poleGeo, poleMaterial);
  pole4.position.x = -250;
  pole4.position.z = -250;
  pole4.position.y = -62;
  pole4.receiveShadow = false;
  pole4.castShadow = false;
  scene.add(pole4);

  // create a box mesh
  let boxGeo = new THREE.BoxGeometry(250, 100, 250);
  boxMaterial = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.01,
  });
  box = new THREE.Mesh(boxGeo, boxMaterial);
  box.position.x = 0;
  box.position.y = 0;
  box.position.z = 0;
  box.receiveShadow = true;
  box.castShadow = true;
  scene.add(box);

  boxGeo.computeBoundingBox();
  boundingBox = box.geometry.boundingBox.clone();

  // event listeners
  window.addEventListener("resize", onWindowResize, false);

  // placeObject is a function that creates objects the cloth can collide into
  placeObject(object);

  // pinCloth sets how the cloth is pinned
  pinCloth(pinned);

  // wireframe sets whether or not the wireframe is shown by default
  showWireframe(wireframe);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// restartCloth() is used when we change a fundamental cloth property with a slider
// and therefore need to recreate the cloth object from scratch
function restartCloth() {
  scene.remove(clothObject);
  cloth = new Cloth(xSegs, ySegs, fabricLength);

  // recreate cloth geometry
  clothGeometry = new THREE.ParametricGeometry(initParameterizedPosition, xSegs, ySegs);
  clothGeometry.dynamic = true;

  // recreate cloth mesh
  clothObject = new THREE.Mesh(clothGeometry, clothMaterial);
  clothObject.position.set(0, 0, 0);
  clothObject.castShadow = true;

  scene.add(clothObject); // adds the cloth to the scene
}

function animate() {
  requestAnimationFrame(animate);

  time = Date.now();

  simulate(); // run physics simulation to create new positions of cloth
  render(); // update position of cloth, compute normals, rotate camera, render the scene
  stats.update();
  controls.update();
}

// the rendering happens here
function render() {
  let timer = Date.now() * 0.0002;

  // update position of the cloth
  // i.e. copy positions from the particles (i.e. result of physics simulation)
  // to the cloth geometry
  let p = cloth.particles;
  for (let i = 0, il = p.length; i < il; i++) {
    clothGeometry.vertices[i].copy(p[i].position);
  }

  // recalculate cloth normals
  clothGeometry.computeFaceNormals();
  clothGeometry.computeVertexNormals();

  clothGeometry.normalsNeedUpdate = true;
  clothGeometry.verticesNeedUpdate = true;

  // update sphere position from current sphere position in simulation
  sphere.position.copy(spherePosition);

  // option to auto-rotate camera
  if (rotate) {
    let cameraRadius = Math.sqrt(
      camera.position.x * camera.position.x + camera.position.z * camera.position.z
    );
    camera.position.x = Math.cos(timer) * cameraRadius;
    camera.position.z = Math.sin(timer) * cameraRadius;
  }

  camera.lookAt(scene.position);
  renderer.render(scene, camera); // render the scene
}

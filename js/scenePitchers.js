// <a href="https://www.freepik.com/free-photos-vectors/background">Background vector created by vectorpocket - www.freepik.com</a>

// pitcher object
function Pitcher(container, milk, capacity, quartsMilk, isClicked) {
  this.container = container;
  this.milk = milk;
  this.capacity = capacity;
  this.quartsMilk = quartsMilk;
  this.isClicked = isClicked;
}

function handleClick(event) {
  event.preventDefault();

  let mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  let raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(scene.children);
  //
  if (intersects.length > 0) {
    intersects[0].object.onClick(intersects[0].object.pitcher);
  }
}

function handleClickPitcher(pitcher) {
  // check if two pitchers already clicked
  if (numClicked >= 2) return;

  // the pitcher clicked is empty and it is the first one
  if (pitcherisEmpty(pitcher) && numClicked == 0) {
    return;
  }

  // the pitcher clicked is full and it is the second one
  if (pitcherIsFull(pitcher) && numClicked == 1) {
    return;
  }

  // unlclick pitcher
  if (pitcher.isClicked) {
    numClicked--;
    pitcher.isClicked = false;
    return;
  }

  pitcher.isClicked = true;
  clicked[numClicked++] = pitcher;
}

function pourMilk(pitcherToPour, pitcherToFill) {
  let oldMilkPour = pitcherToPour.milk.geometry;
  let posPour = pitcherToPour.milk.position;
  let oldMilkFill = pitcherToFill.milk.geometry;
  let posFill = pitcherToFill.milk.position;

  // change the milk levels
  let newMilkPour = new THREE.CylinderGeometry(40, 40, oldMilkPour.parameters.height - 10, 12);
  let newMilkPourMesh = new THREE.Mesh(newMilkPour, materialMilk);
  newMilkPourMesh.position.set(posPour.x, posPour.y - 5, posPour.z);

  let newMilkFill = new THREE.CylinderGeometry(40, 40, oldMilkFill.parameters.height + 10, 12);
  let newMilkFillMesh = new THREE.Mesh(newMilkFill, materialMilk);
  newMilkFillMesh.position.set(posFill.x, posFill.y + 5, posFill.z);

  // make changes to the scene
  scene.remove(pitcherToPour.milk);
  scene.remove(pitcherToFill.milk);
  scene.add(newMilkPourMesh);
  scene.add(newMilkFillMesh);

  // update the pitcher objects
  pitcherToPour.milk = newMilkPourMesh;
  pitcherToPour.quartsMilk--;
  pitcherToFill.milk = newMilkFillMesh;
  pitcherToFill.quartsMilk++;
}

function pitcherIsFull(pitcher) {
  return pitcher.quartsMilk == pitcher.capacity;
}

function pitcherisEmpty(pitcher) {
  return pitcher.quartsMilk == 0;
}

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//RENDERER
var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('canvasPitchers'), antialias: true, alpha: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

//CAMERA
var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);

//SCENE
var scene = new THREE.Scene();

//LIGHTS
var light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

var light1 = new THREE.PointLight(0xffffff, 0.5);
scene.add(light1);


// tracks clicked
let numClicked = 0;
let clicked = [null, null];

// create materials
let materialQuart = new THREE.MeshLambertMaterial({color: 0xffffff, transparent: true, opacity: 0.5});
let materialMilk = new THREE.MeshLambertMaterial({color: 0xffffff});

// create 10-quart container
let quart10 = new THREE.CylinderGeometry(40, 40, 120, 12);
let quartMesh10 = new THREE.Mesh(quart10, materialQuart);
quartMesh10.position.set(-200, -140, -1000);
quartMesh10.onClick = handleClickPitcher;

// create milk contained in 10-quart pitcher
let milk10 = new THREE.CylinderGeometry(40, 40, 100, 12);
let milkMesh10 = new THREE.Mesh(milk10, materialMilk);
milkMesh10.position.set(-200, -150, -1001);

// create 7-quart container
let quart7 = new THREE.CylinderGeometry(40, 40, 100, 12);
let quartMesh7 = new THREE.Mesh(quart7, materialQuart);
quartMesh7.position.set(0, -150, -1000);
quartMesh7.onClick = handleClickPitcher;

// create milk contained in 7-quart pitcher
let milk7 = new THREE.CylinderGeometry(40, 40, 0, 12);
let milkMesh7= new THREE.Mesh(milk7, materialMilk);
milkMesh7.position.set(0, -200, -1001);

// create 5-quart container
let quart5 = new THREE.CylinderGeometry(40, 40, 70, 12);
let quartMesh5 = new THREE.Mesh(quart5, materialQuart);
quartMesh5.position.set(200, -165, -1000);
quartMesh5.onClick = handleClickPitcher;

// create milk contained in 5-quart pitcher
let milk5 = new THREE.CylinderGeometry(40, 40, 0, 12);
let milkMesh5 = new THREE.Mesh(milk5, materialMilk);
milkMesh5.position.set(200, -200, -1001);

// create the three pitchers (container + milk)
let pitcher10 = new Pitcher(quartMesh10, milkMesh10, 10, 10, false);
let pitcher7 = new Pitcher(quartMesh7, milkMesh7, 7, 0, false);
let pitcher5 = new Pitcher(quartMesh5, milkMesh5, 5, 0, false);

// add pitcher objects to the meshes for simplicity
quartMesh10.pitcher = pitcher10;
quartMesh7.pitcher = pitcher7;
quartMesh5.pitcher = pitcher5;

scene.add(pitcher10.container);
scene.add(pitcher10.milk);
scene.add(pitcher7.container);
scene.add(pitcher7.milk);
scene.add(pitcher5.container);
scene.add(pitcher5.milk);


document.addEventListener('click', handleClick);
document.addEventListener('resize', handleWindowResize);

// create kitchen background scene
// let loader = new THREE.TextureLoader();
// let kitchenTexture = loader.load('/images/kitchen.jpg')
//
// let kitchenBackground = new THREE.Mesh(
//   new THREE.PlaneGeometry(2, 2, 0),
//   new THREE.MeshBasicMaterial({
//       map: kitchenTexture})
// );
//
// kitchenBackground.material.depthTest = false;
// kitchenBackground.material.depthWrite = false;
//
// let kitchenScene = new THREE.Scene();
// let kitchenCamera = new THREE.Camera();
// kitchenScene.add(kitchenBackground);
// kitchenScene.add(kitchenCamera);

//RENDER LOOP
requestAnimationFrame(render);

function render() {
    // pouring complete
    if (numClicked == 2) {
      if (pitcherisEmpty(clicked[0]) || pitcherIsFull(clicked[1])) {
        numClicked = 0;
        clicked[0].isClicked = false;
        clicked[1].isClicked = false;
        clicked = [];
      }
      else {
        pourMilk(clicked[0], clicked[1]);
      }
    }


    renderer.clear();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

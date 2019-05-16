// <a href="https://www.freepik.com/free-photos-vectors/background">Background vector created by vectorpocket - www.freepik.com</a>

// pitcher object
function Pitcher(container, milk, capacity, quartsMilk, isClicked, isSelected, label, selectedMesh) {
  this.container = container;
  this.milk = milk;
  this.capacity = capacity;
  this.quartsMilk = quartsMilk;
  this.isClicked = isClicked;
  this.isSelected = isSelected;
  this.label = label;
  this.selectedMesh = selectedMesh;
}

function createSelected(pitcher) {
  let geometry = pitcher.container.geometry.parameters;
  let position = pitcher.container.position;
  let selected = new THREE.CylinderGeometry(geometry.radiusTop, geometry.radiusBottom, geometry.height, geometry.radialSegments);
  let selectedMesh = new THREE.Mesh(selected, materialSelected);
  selectedMesh.position.set(position.x, position.y, position.z);
  selectedMesh.onClick = handleClickPitcher;
  selectedMesh.pitcher = pitcher;
  pitcher.selectedMesh = selectedMesh;

  return selectedMesh;
}

function switchMesh(pitcher) {
  if (pitcher.isClicked ^ pitcher.isSelected) {
    scene.remove(pitcher.selectedMesh);
    scene.add(pitcher.container);
  }
  else {
    scene.remove(pitcher.container);
    scene.add(pitcher.selectedMesh);
  }
}

function findPitcher(intersects) {
  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.pitcher != undefined)
      return intersects[i].object.pitcher;
  }

  return undefined;
}

function handleClick(event) {
  if (inReset)
    return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  let raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    let pitcher = findPitcher(intersects);
    if (pitcher == undefined)
      return;

    intersects[0].object.onClick(intersects[0].object.pitcher);
  }
}

function handleMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  let raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    let pitcher = findPitcher(intersects);
    if (pitcher == undefined)
      return;

    if (!pitcher.isClicked && !pitcher.isSelected)
      switchMesh(pitcher);
      pitcher.isSelected = true;
  }
  else {
    for (let i = 0; i < pitchers.length; i++) {
      if (!pitchers[i].isClicked && pitchers[i].isSelected)
        switchMesh(pitchers[i]);
        pitchers[i].isSelected = false;
    }
  }
}

function handleClickPitcher(pitcher) {
  // check if two pitchers already clicked
  if (numClicked >= 2) return;

  // unclick pitcher
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

  // change labels
  let posPourLabel = pitcherToPour.label.position;
  let newLevelPour = (parseInt(pitcherToPour.label.geometry.parameters.text) - 1) + '';
  let newLabelPour = new THREE.TextGeometry(newLevelPour, {font: storedFont, size: fontLabel, height: 1});
  let newLabelPourMesh = new THREE.Mesh(newLabelPour, materialText);
  newLabelPourMesh.position.set(posPourLabel.x, posPourLabel.y, posPourLabel.z);

  let posFillLabel = pitcherToFill.label.position;
  let newLevelFill = parseInt(pitcherToFill.label.geometry.parameters.text) + 1 + '';
  let newLabelFill = new THREE.TextGeometry(newLevelFill, {font: storedFont, size: fontLabel, height: 1});
  let newLabelFillMesh = new THREE.Mesh(newLabelFill, materialText);
  newLabelFillMesh.position.set(posFillLabel.x, posFillLabel.y, posFillLabel.z);

  // make changes to the scene
  scene.remove(pitcherToPour.milk);
  scene.remove(pitcherToFill.milk);
  scene.remove(pitcherToPour.label);
  scene.remove(pitcherToFill.label);
  scene.add(newMilkPourMesh);
  scene.add(newMilkFillMesh);
  scene.add(newLabelPourMesh);
  scene.add(newLabelFillMesh);

  // update the pitcher objects
  pitcherToPour.milk = newMilkPourMesh;
  pitcherToFill.milk = newMilkFillMesh;
  pitcherToPour.label = newLabelPourMesh;
  pitcherToFill.label = newLabelFillMesh;
  pitcherToPour.quartsMilk--;
  pitcherToFill.quartsMilk++;
}

function pitcherIsFull(pitcher) {
  return pitcher.quartsMilk == pitcher.capacity;
}

function pitcherIsEmpty(pitcher) {
  return pitcher.quartsMilk == 0;
}

function addLabelToPitcher(pitcher, label) {
  pitcher.label = label;
}

function isGoal() {
  return (pitcher10.quartsMilk == 5 && pitcher7.quartsMilk == 5);
}

function handleReset() {
  console.log("we made it");
  // reset click values
  for (let i = 0; i < pitchers.length; i++) {
    if (pitchers[i].isClicked) {
      switchMesh(pitchers[i]);
      pitchers[i].isClicked = false;
    }
  }
  numClicked = 0;
  clicked = [];

  // in reset mode
  inReset = true;
}

//RENDERER
var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('canvasPitchers'), antialias: true, alpha: true});
let canvas = renderer.domElement;
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

// MOUSE
let mouse = new THREE.Vector2();

// tracks clicked
let numClicked = 0;
let clicked = [null, null];
let inReset = false;

// create materials
let materialQuart = new THREE.MeshLambertMaterial({color: 0xffffff, transparent: true, opacity: 0.5});
let materialMilk = new THREE.MeshLambertMaterial({color: 0xffffff});
let materialText = new THREE.MeshLambertMaterial({color: 0x000000});
let materialSelected = new THREE.MeshLambertMaterial({color: 0xa8e3ff, transparent: true, opacity: 0.5});

let vertDiv = 7;

// create 10-quart container
let quart10 = new THREE.CylinderGeometry(40, 40, 120, 12);
let quartMesh10 = new THREE.Mesh(quart10, materialQuart);
quartMesh10.position.set(-(canvas.clientWidth / 6), -(canvas.clientHeight / vertDiv), -1000);
quartMesh10.onClick = handleClickPitcher;

// create milk contained in 10-quart pitcher
let milk10 = new THREE.CylinderGeometry(40, 40, 100, 12);
let milkMesh10 = new THREE.Mesh(milk10, materialMilk);
milkMesh10.position.set(-(canvas.clientWidth / 6), -(canvas.clientHeight / vertDiv) - 10, -1001);

// create 7-quart container
let quart7 = new THREE.CylinderGeometry(40, 40, 90, 12);
let quartMesh7 = new THREE.Mesh(quart7, materialQuart);
quartMesh7.position.set(0, -(canvas.clientHeight / vertDiv) - 15, -1000);
quartMesh7.onClick = handleClickPitcher;

// create milk contained in 7-quart pitcher
let milk7 = new THREE.CylinderGeometry(40, 40, 0, 12);
let milkMesh7= new THREE.Mesh(milk7, materialMilk);
milkMesh7.position.set(0, -(canvas.clientHeight / vertDiv) - 60, -1001);

// create 3-quart container
let quart3 = new THREE.CylinderGeometry(40, 40, 50, 12);
let quartMesh3 = new THREE.Mesh(quart3, materialQuart);
quartMesh3.position.set((canvas.clientWidth / 6), -(canvas.clientHeight / vertDiv) - 35, -1000);
quartMesh3.onClick = handleClickPitcher;

// create milk contained in 3-quart pitcher
let milk3 = new THREE.CylinderGeometry(40, 40, 0, 12);
let milkMesh3 = new THREE.Mesh(milk3, materialMilk);
milkMesh3.position.set((canvas.clientWidth / 6), -(canvas.clientHeight / vertDiv) - 60, -1001);

// create the three pitchers (container + milk)
let pitcher10 = new Pitcher(quartMesh10, milkMesh10, 10, 10, false, false, null, null);
let pitcher7 = new Pitcher(quartMesh7, milkMesh7, 7, 0, false, false, null, null);
let pitcher3 = new Pitcher(quartMesh3, milkMesh3, 3, 0, false, false, null, null);

createSelected(pitcher10)
createSelected(pitcher7)
createSelected(pitcher3)

let pitchers = [pitcher10, pitcher7, pitcher3];

// add pitcher objects to the meshes for simplicity
quartMesh10.pitcher = pitcher10;
quartMesh7.pitcher = pitcher7;
quartMesh3.pitcher = pitcher3;

scene.add(pitcher10.container);
scene.add(pitcher10.milk);
scene.add(pitcher7.container);
scene.add(pitcher7.milk);
scene.add(pitcher3.container);
scene.add(pitcher3.milk);

// create labels
let loader = new THREE.FontLoader();
let storedFont;
let horzOffsetLabel = -10;
let horzOffsetName = -37;
let vertOffset10 = 75;
let vertOffset7 = 50;
let vertOffset3 = 10;
let vertOffsetName = -95;
let fontLabel = 20;
let fontPitcher = 12;

loader.load('../fonts/Montserrat_Alternates_Regular.json', function(font) {
  storedFont = font;

  // level labels
  let label10 = new THREE.TextGeometry('10', {font: font, size: fontLabel, height: 1});
  let labelMesh10 = new THREE.Mesh(label10, materialText);
  labelMesh10.position.set(-(canvas.clientWidth / 6) + horzOffsetLabel, -(canvas.clientHeight / vertDiv) + vertOffset10, -1000);
  addLabelToPitcher(pitcher10, labelMesh10);
  scene.add(labelMesh10);

  let label7 = new THREE.TextGeometry('0', {font: font, size: fontLabel, height: 1});
  let labelMesh7 = new THREE.Mesh(label7, materialText);
  labelMesh7.position.set(horzOffsetLabel, -(canvas.clientHeight / vertDiv) + vertOffset7, -1000);
  addLabelToPitcher(pitcher7, labelMesh7);
  scene.add(labelMesh7);

  let label3 = new THREE.TextGeometry('0', {font: font, size: fontLabel, height: 1});
  let labelMesh3 = new THREE.Mesh(label3, materialText);
  labelMesh3.position.set((canvas.clientWidth / 6) + horzOffsetLabel, -(canvas.clientHeight / vertDiv) + vertOffset3, -1000);
  addLabelToPitcher(pitcher3, labelMesh3);
  scene.add(labelMesh3);

  // pitcher labels
  let name10 = new THREE.TextGeometry('10-quarts', {font: font, size: fontPitcher, height: 1});
  let nameMesh10 = new THREE.Mesh(name10, materialText);
  nameMesh10.position.set(-(canvas.clientWidth / 6) + horzOffsetName - 5, -(canvas.clientHeight / vertDiv) + vertOffsetName, -1000);
  scene.add(nameMesh10);

  let name7 = new THREE.TextGeometry('7-quarts', {font: font, size: fontPitcher, height: 1});
  let nameMesh7 = new THREE.Mesh(name7, materialText);
  nameMesh7.position.set(horzOffsetName, -(canvas.clientHeight / vertDiv) + vertOffsetName, -1000);
  scene.add(nameMesh7);

  let name3 = new THREE.TextGeometry('3-quarts', {font: font, size: fontPitcher, height: 1});
  let nameMesh3 = new THREE.Mesh(name3, materialText);
  nameMesh3.position.set((canvas.clientWidth / 6) + horzOffsetName, -(canvas.clientHeight / vertDiv) + vertOffsetName, -1000);
  scene.add(nameMesh3);
});

// listeners
document.addEventListener('click', handleClick, false);
document.addEventListener('mousemove', handleMouseMove);

//RENDER LOOP
requestAnimationFrame(render);

function render() {
    // resize
    if (canvas.clientWidth != window.innerWidth || canvas.clientHeight != window.innerHeight) {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }

    if (inReset) {
      // reset complete
      if (pitcherIsFull(pitcher10)) {
        inReset = false;
      }
      else {
        // if there is still milk in pitcher7, return it pitcher10
        if (!pitcherIsEmpty(pitcher7)) {
          pourMilk(pitcher7, pitcher10);
        }

        // if there is still milk in pitcher3, return it pitcher10
        if (!pitcherIsEmpty(pitcher3)) {
          pourMilk(pitcher3, pitcher10);
        }
      }
    }
    else if (numClicked == 2) {
      if (pitcherIsEmpty(clicked[0]) || pitcherIsFull(clicked[1])) {
        numClicked = 0;

        switchMesh(clicked[0]);
        switchMesh(clicked[1]);

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

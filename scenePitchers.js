// <a href="https://www.freepik.com/free-photos-vectors/background">Background vector created by vectorpocket - www.freepik.com</a>
//RENDERER
var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('canvasPitchers'), antialias: true});
// renderer.setClearColor(0x5000a0);
renderer.setClearColor( 0xffffff, 0)
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.autoClear = false;

//CAMERA
var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
// var camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 3000);

//SCENE
var scene = new THREE.Scene();

//LIGHTS
var light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

var light1 = new THREE.PointLight(0xffffff, 0.5);
scene.add(light1);

//OBJECT
// var geometry = new THREE.CubeGeometry(100, 100, 100);
// var material = new THREE.MeshLambertMaterial({color: 0xF3FFE2});
// var mesh = new THREE.Mesh(geometry, material);
// mesh.material.color.set(0x000000)
// mesh.position.set(0, 0, -1000);

// scene.add(mesh);

let materialQuart = new THREE.MeshLambertMaterial({color: 0xffffff, transparent: true, opacity: 0.5});
let materialMilk = new THREE.MeshLambertMaterial({color: 0xffffff});

// create 10-quart pitcher
let quart10 = new THREE.CylinderGeometry(40, 40, 120, 12);
let quartMesh10 = new THREE.Mesh(quart10, materialQuart);
quartMesh10.position.set(-200, -90, -1000);

// create milk contained in 10-quart pitcher
let milk10 = new THREE.CylinderGeometry(40, 40, 100, 12);
let milkMesh10 = new THREE.Mesh(milk10, materialMilk);
milkMesh10.position.set(-200, -100, -1000);

// create 7-quart pitcher
let quart7 = new THREE.CylinderGeometry(40, 40, 100, 12);
let quartMesh7 = new THREE.Mesh(quart7, materialQuart);
quartMesh7.position.set(0, -100, -1000);

// create milk contained in 7-quart pitcher
// let milk7 = new THREE.CylinderGeometry(40, 40, 100, 12);
// let milkMesh7 = new THREE.Mesh(milk7, materialMilk);
// milkMesh7.position.set(-200, -110, -1000);

// create 5-quart pitcher
let quart5 = new THREE.CylinderGeometry(40, 40, 70, 12);
let quartMesh5 = new THREE.Mesh(quart5, materialQuart);
quartMesh5.position.set(200, -115, -1000);

// create milk contained in 5-quart pitcher
// let milk5 = new THREE.CylinderGeometry(40, 40, 100, 12);
// let milkMesh5 = new THREE.Mesh(milk5, materialMilk);
// milkMesh5.position.set(-200, -110, -1000);

scene.add(quartMesh10);
scene.add(milkMesh10);
scene.add(quartMesh7);
scene.add(quartMesh5);

// create kitchen background scene
let loader = new THREE.TextureLoader();
let kitchenTexture = loader.load('/images/kitchen.jpg')

let kitchenBackground = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2, 0),
  new THREE.MeshBasicMaterial({
      map: kitchenTexture})
);

kitchenBackground.material.depthTest = false;
kitchenBackground.material.depthWrite = false;

let kitchenScene = new THREE.Scene();
let kitchenCamera = new THREE.Camera();
kitchenScene.add(kitchenCamera);
kitchenScene.add(kitchenBackground);


//RENDER LOOP
requestAnimationFrame(render);

function render() {
    renderer.clear();
    renderer.render(kitchenScene, kitchenCamera);
    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

//RENDERER
var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('myCanvas'), antialias: true, alpha: true});
renderer.setClearColor(0x000000, 0);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth/4, window.innerHeight/4);

//CAMERA
var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);

//SCENE
var scene = new THREE.Scene();

//LIGHTS
var light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

var light1 = new THREE.PointLight(0xffffff, 0.5);
scene.add(light1);

//LOGO CUBE
var geometry = new THREE.CubeGeometry(330, 330, 330);
var material = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('logo.png')});
var logoCube = new THREE.Mesh(geometry, material);
logoCube.position.set(0, 0, -1000);
scene.add(logoCube);


//RENDER LOOP
requestAnimationFrame(render);

function render() {
    logoCube.rotation.x += 0.01;
    logoCube.rotation.y += 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

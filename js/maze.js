//RENDERER
var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('myCanvas'), antialias: true});
renderer.setClearColor(0x9000f0);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

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

// current orientation of the scene
// *********************************
// 0 orientation up is up
// 1 orientation right is up
// 2 orientation down is up
// 3 orientation left is up
var orientation = 0;

// the x and y dimensions of the maz
const dimX = 7;
const dimY = 7;

// the zPosition of objects
const zPos = -1500;

// the offset to move a block by one index
const blockOffset = 55;

// the offset of the wall from the center of a block
const wallOffset = 27.5;

// the pixel location of a block at maze location (0, 0)
const zeroIndex = [-165, -165];

// Auxillary Functions

// Creates walls for the maze
function createWalls()
{
	var myWalls = [];

	for (var i = 0; i < dimX; i++)
	{
		myWalls[i] = [];

		for (var j = 0; j < dimY; j++)
		{
			myWalls[i][j] = false;
		}
	}

	return myWalls;
}

// Gets walls in the opposite orientation of myWalls
function getOppositeWalls(myWalls) 
{
	var newWalls = createWalls();

	for (var i = 0; i < dimX; i++)
	{
		for (var j = 1; j < dimY; j++)
		{
			newWalls[i][j] = myWalls[i][dimY - j];
		}
	}

	return newWalls;
}

// adds walls at the bottom of a matrix
function addEdgeWalls(myWalls) 
{
	var newWalls = myWalls;

	for (var i = 0; i < dimX; i++)
	{
		newWalls[i][0] = true;
	}

	return newWalls;
}

// get the indices for the rightward orientation from the upward (default) orientation
function getRightIndexFromUp(upIndex)
{
	var rightIndex = [dimY - upIndex[1] - 1, upIndex[0]]
	return rightIndex;
}

// get the indices for upward (default) orientation from right orientation
function getUpIndexFromRight(rightIndex)
{
	var upIndex = [rightIndex[1], dimY - rightIndex[0] - 1]
	return upIndex;
}

function getPixelPosition(indices)
{
	var myPos = [zeroIndex[0] + (indices[0] * blockOffset), zeroIndex[1] + (indices[1] * blockOffset)];
	return myPos;
}



var wallsUp = createWalls();
var wallsRight = createWalls();

// set walls for orientation 0
wallsUp[1][1] = true;
wallsUp[1][2] = true;
wallsUp[1][6] = true;
wallsUp[2][4] = true;
wallsUp[2][6] = true;
wallsUp[3][2] = true;
wallsUp[3][5] = true;
wallsUp[4][1] = true;
wallsUp[4][2] = true;
wallsUp[5][3] = true;
wallsUp[5][6] = true;
wallsUp[6][5] = true;
wallsUp[6][6] = true;

// set wall for orientation 1
wallsRight[0][4] = true;
wallsRight[1][1] = true;
wallsRight[1][2] = true;
wallsRight[1][4] = true;
wallsRight[1][5] = true;
wallsRight[2][1] = true;
wallsRight[2][2] = true;
wallsRight[2][3] = true;
wallsRight[2][4] = true;
wallsRight[3][3] = true;
wallsRight[3][6] = true;
wallsRight[4][1] = true;
wallsRight[4][2] = true;
wallsRight[4][4] = true;
wallsRight[4][5] = true;
wallsRight[5][3] = true;
wallsRight[6][2] = true;
wallsRight[6][4] = true;
wallsRight[6][6] = true;

// create walls for orientations 2 and 3
var wallsDown = getOppositeWalls(wallsUp);
var wallsLeft = getOppositeWalls(wallsRight);

// create edge walls
wallsUp = addEdgeWalls(wallsUp);
wallsRight = addEdgeWalls(wallsRight);
wallsDown = addEdgeWalls(wallsDown);
wallsLeft = addEdgeWalls(wallsLeft);


var blockGeom = new THREE.CubeGeometry(50, 50, 50);
var material1 = new THREE.MeshLambertMaterial({color: 0x0080a0});
var wallGeomUp = new THREE.CubeGeometry(5, 50, 50);
var wallGeomSide = new THREE.CubeGeometry(50, 5, 50);
var material2 = new THREE.MeshLambertMaterial({color: 0x200000});
//material1.color.set(0x0080a0);


// render the actual walls
for (var i = 0; i < dimX; i++)
{
	for (var j = 0; j < dimY; j++)
	{
		if (wallsUp[i][j])
		{
			var myWall = new THREE.Mesh(wallGeomSide, material2);
			myWall.position.set(zeroIndex[0] + (i * blockOffset), zeroIndex[1] + (j * blockOffset) - wallOffset, zPos);
			scene.add(myWall);
		}

		var rightIndex = getRightIndexFromUp([i, j]);
		if (wallsRight[rightIndex[0]][rightIndex[1]])
		{
			var myWall = new THREE.Mesh(wallGeomUp, material2);
			myWall.position.set(zeroIndex[0] + (i * blockOffset) - wallOffset, zeroIndex[1] + (j * blockOffset), zPos);
			scene.add(myWall);
		}

	}
}

// add walls at the top
for (var i = 0; i < dimX; i++)
{
	var myWall = new THREE.Mesh(wallGeomSide, material2);
	myWall.position.set(zeroIndex[0] + (i * blockOffset), zeroIndex[1] + ((dimY - 1) * blockOffset) + wallOffset, zPos);
	scene.add(myWall);
}

// add walls at the right
for (var i = 0; i < dimY; i++)
{
	var myWall = new THREE.Mesh(wallGeomUp, material2);
	myWall.position.set(zeroIndex[0] + ((dimX - 1) * blockOffset) + wallOffset, zeroIndex[1] + (i * blockOffset), zPos);
	scene.add(myWall);
}

// block positions
var block1Index = [3, 0]; // indices of the circle/red block
var block2Index = [3, 1]; // indices of the x/blue block
var block3Index = [3, 2]; // indices of the square/yellow block

var block1Pos = getPixelPosition(block1Index);// pixel position of the circle/red block
var block2Pos = getPixelPosition(block2Index); // pixel position of the x/blue block
var block3Pos = getPixelPosition(block3Index); // pixel position of the square/yellow block

// add blocks to the scene
var material1 = new THREE.MeshLambertMaterial({color: 0xff0000});
var block1 = new THREE.Mesh(blockGeom, material1);
block1.position.set(block1Pos[0], block1Pos[1], zPos);
scene.add(block1);

var material2 = new THREE.MeshLambertMaterial({color: 0x0000ff});
var block2 = new THREE.Mesh(blockGeom, material2);
block2.position.set(block2Pos[0], block2Pos[1], zPos);
scene.add(block2);

var material3 = new THREE.MeshLambertMaterial({color: 0xffff00});
var block3 = new THREE.Mesh(blockGeom, material3);
block3.position.set(block3Pos[0], block3Pos[1], zPos);
scene.add(block3);


function getBlocks()
{
	var pos1 = 0;
	var pos2 = 0;
	var pos3 = 0;
	if (orientation == 0)
	{
		pos1 = block1Index[1];
		pos2 = block2Index[1];
		pos3 = block3Index[1];
	}

	if (orientation == 1)
	{
		pos1 = block1Index[0];
		pos2 = block2Index[0];
		pos3 = block3Index[0];
	}

	if (orientation == 2)
	{
		pos1 = block1Index[1] * -1;
		pos2 = block2Index[1] * -1;
		pos3 = block3Index[1] * -1;
	}

	if (orientation == 4)
	{
		pos1 = block1Index[0] * -1;
		pos2 = block2Index[0] * -1;
		pos3 = block3Index[0] * -1;
	}

	if (pos1 <= pos2 && pos2 <= pos3)
	{
		return [block1, block2, block3];
	}

	else if (pos1 <= pos3 && pos3 <= pos2)
	{
		return [block1, block3, block2];
	}

	else if (pos3 <= pos1 && pos1 <= pos2)
	{
		return [block3, block1, block2];
	}

	else
	{
		return [block3, block2, block1];
	}
}



// use this to change the up direction for the camera
// camera.up.set(1, 1, 0);
// camera.lookAt(0, 0, 0);

// camera rotation

// variables for camera rotation
var angle = Math.PI / 2;
var angleFinal = 0;

const rotation = Math.PI;

var rotateCounter = true;
var rotateClock = false;
var inMotion = true;
orientation = 1;

// camera rotation
function rotateCameraCounterClock()
{
	camera.up.set(Math.cos(angle), Math.sin(angle), 0);
	camera.lookAt(0, 0, 0);
	angle -= .01;

	if (angle < angleFinal)
	{
		rotateCounter = false;
		inMotion = true;
	}
}

// camera rotation
function rotateCameraClock()
{
	camera.up.set(Math.cos(angle), Math.sin(angle), 0);
	camera.lookAt(0, 0, 0);
	angle += .01;

	if (angle > angleFinal)
	{
		rotateClock = false;
		inMotion = true;
	}
}

console.log("Hi");
console.log(getBlocks());


//RENDER LOOP
requestAnimationFrame(render);

function render() 
{
	if (rotateCounter)
	{
    	rotateCameraCounterClock();
	}

	if (rotateClock)
	{

	}
	
	if (inMotion)
	{

	}
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
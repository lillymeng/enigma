//RENDERER
var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('myCanvas'), antialias: true, alpha: true});
renderer.setClearColor(0x9000f0, 0);
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
			newWalls[i][j] = myWalls[dimX - i - 1][dimY - j];
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

// get the indices for the downward orientation from the upward (default) orientation
function getDownIndexFromUp(upIndex)
{
	var downIndex = [dimX - upIndex[0] - 1, dimY - upIndex[1] - 1]
	return downIndex;
}

function getLeftIndexFromUp(upIndex)
{
	var leftIndex = [upIndex[1], dimX - upIndex[0] - 1]
	return leftIndex;
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

for (var i = 0; i < dimX; i++)
{
	for (var j = 0; j < dimY; j++)
	{
		if (Math.random() < .3)
		{
			wallsUp[i][j] = true;
		}
	}
}

// set wall for orientation 1
for (var i = 0; i < dimX; i++)
{
	for (var j = 0; j < dimY; j++)
	{
		if (Math.random() < .3)
		{
			wallsRight[i][j] = true;
		}
	}
}

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


// goal positions && render goal blocks to scene
var block1Goal = [0, 0]; // goal for the circle/red block
var block2Goal = [0, 6]; // goal for the x/blue block
var block3Goal = [6, 6]; // goal for the square/yellow block

var block1Origin = [-10, -10];
var block2Origin = [-10, -10];
var block3Origin = [-10, -10];

var block1Index = [-10, -10]; // indices of the circle/red block
var block2Index = [-10, -10]; // indices of the x/blue block
var block3Index = [-10, -10]; // indices of the square/yellow block

// set origins for blocks

var set = false

while (!set)
{
	var xVal = Math.floor(Math.random() * dimX);
	var yVal = Math.floor(Math.random() * dimY);
	block1Origin[0] = xVal;
	block1Origin[1] = yVal;
	block1Index[0] = xVal;
	block1Index[1] = yVal;

	if (checkCollision(1))
	{
		set = true;
	}
}

set = false;
while (!set)
{
	var xVal = Math.floor(Math.random() * dimX);
	var yVal = Math.floor(Math.random() * dimY);
	block2Origin[0] = xVal;
	block2Origin[1] = yVal;
	block2Index[0] = xVal;
	block2Index[1] = yVal;

	if (checkCollision(2) && xVal != block1Origin[0] && yVal != block1Origin[1])
	{
		set = true;
	}
}

set = false;
while (!set)
{
	var xVal = Math.floor(Math.random() * dimX);
	var yVal = Math.floor(Math.random() * dimY);
	block3Origin[0] = xVal;
	block3Origin[1] = yVal;
	block3Index[0] = xVal;
	block3Index[1] = yVal;

	if (checkCollision(3) && xVal != block1Origin[0] && yVal != block1Origin[1] && 
		xVal != block2Origin[0] && yVal != block2Origin[1])
	{
		set = true;
	}
}



// block positions

var block1Pos = getPixelPosition(block1Index); // pixel position of the circle/red block
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
		return [1, 2, 3];
	}

	else if (pos1 <= pos3 && pos3 <= pos2)
	{
		return [1, 3, 2];
	}

	else if (pos3 <= pos1 && pos1 <= pos2)
	{
		return [3, 1, 2];
	}

	else
	{
		return [3, 2, 1];
	}
}


// use this to change the up direction for the camera
// camera.up.set(1, 1, 0);
// camera.lookAt(0, 0, 0);

// camera rotation

// variables for camera rotation
var angle = Math.PI / 2;
var angleFinal = angle;
const angleIncr = Math.PI / 40;
const rotation = Math.PI / 2;
const EPS = .00001;

var rotateCounter = false;
var rotateClock = false;
var applyGrav = false;
var inMotion = false;

// camera rotation
function rotateCameraCounterClock()
{
	camera.up.set(Math.cos(angle), Math.sin(angle), 0);
	camera.lookAt(0, 0, 0);
	angle -= angleIncr;

	if (angle + EPS < angleFinal)
	{
		rotateCounter = false;
		applyGrav = true;
	}
}

// camera rotation
function rotateCameraClock()
{
	camera.up.set(Math.cos(angle), Math.sin(angle), 0);
	camera.lookAt(0, 0, 0);
	angle += angleIncr;

	if (angle - EPS > angleFinal)
	{
		rotateClock = false;
		applyGrav = true;
	}
}

function checkCollision(blockNum)
{
	var myBlock;
	var bOther1;
	var bOther2;

	// get the blocks to compare
	if (blockNum == 1)
	{
		myBlock = block1Index;
		bOther1 = block2Index;
		bOther2 = block3Index;
	}

	else if (blockNum == 2)
	{
		myBlock = block2Index;
		bOther1 = block1Index;
		bOther2 = block3Index;
	}

	else if (blockNum == 3)
	{
		myBlock = block3Index;
		bOther1 = block2Index;
		bOther2 = block1Index;
	}

	// check the collision for the current orientation
	if (orientation == 0)
	{
		if (wallsUp[myBlock[0]][myBlock[1]])
		{
			return true;
		}

		if ((myBlock[1] - 1) == bOther1[1] && myBlock[0] == bOther1[0])
		{
			return true;
		}

		if ((myBlock[1] - 1) == bOther2[1] && myBlock[0] == bOther2[0])
		{
			return true;
		}
	}
	if (orientation == 1)
	{
		var myIndex = getRightIndexFromUp(myBlock);
		if (wallsRight[myIndex[0]][myIndex[1]])
		{
			return true;
		}

		if ((myBlock[0] - 1) == bOther1[0] && myBlock[1] == bOther1[1])
		{
			return true;
		}

		if ((myBlock[0] - 1) == bOther2[0] && myBlock[1] == bOther2[1])
		{
			return true;
		}
	}
	if (orientation == 2)
	{
		var myIndex = getDownIndexFromUp(myBlock);
		if (wallsDown[myIndex[0]][myIndex[1]])
		{
			return true;
		}

		if ((myBlock[1] + 1) == bOther1[1] && myBlock[0] == bOther1[0])
		{
			return true;
		}

		if ((myBlock[1] + 1) == bOther2[1] && myBlock[0] == bOther2[0])
		{
			return true;
		}
	}
	if (orientation == 3)
	{
		var myIndex = getLeftIndexFromUp(myBlock);
		if (wallsLeft[myIndex[0]][myIndex[1]])
		{
			return true;
		}

		if ((myBlock[0] + 1) == bOther1[0] && myBlock[1] == bOther1[1])
		{
			return true;
		}

		if ((myBlock[0] + 1) == bOther2[0] && myBlock[1] == bOther2[1])
		{
			return true;
		}
	}

	return false;
}

// update indices for all blocks
function moveDown(blockNum)
{
	var index;

	if (blockNum == 1)
	{
		index = block1Index;
	}

	else if (blockNum == 2)
	{
		index = block2Index;
	}

	else if (blockNum == 3)
	{
		index = block3Index;
	}

	// move block down for current orientation

	if (orientation == 0)
	{
		index[1]--;
	}

	else if (orientation == 1)
	{
		index[0]--;
	}

	else if (orientation == 2)
	{
		index[1]++;
	}

	else if (orientation == 3)
	{
		index[0]++;
	}
}

function gravityCheck()
{
	if (inMotion)
	{
		updatePosition();
	}

	else
	{
		var blocks = getBlocks();

		// move block indices down if no collisions
		for (var i = 0; i < blocks.length; i++)
		{
			if (!checkCollision(blocks[i]))
			{
				moveDown(blocks[i]);
				inMotion = true;
			}
		}

		// update block positions
		block1Pos = getPixelPosition(block1Index);
		block2Pos = getPixelPosition(block2Index); 
		block3Pos = getPixelPosition(block3Index); 

		if (inMotion == false)
		{
			applyGrav = false;
		}
	}
}

var posIncrement = 13.75;
var EPS2 = .05;

function updatePosition()
{
	var updating = false;

	if (orientation == 0)
	{
		if (block1.position.y - EPS2 > block1Pos[1])
		{
			block1.position.set(block1.position.x, block1.position.y - posIncrement, zPos);
			updating = true;
		}

		if (block2.position.y - EPS2 > block2Pos[1])
		{
			block2.position.set(block2.position.x, block2.position.y - posIncrement, zPos);
			updating = true;
		}

		if (block3.position.y - EPS2 > block3Pos[1])
		{
			block3.position.set(block3.position.x, block3.position.y - posIncrement, zPos);
			updating = true;
		}
	}

	else if (orientation == 1)
	{
		if (block1.position.x - EPS2 > block1Pos[0])
		{
			block1.position.set(block1.position.x - posIncrement, block1.position.y, zPos);
			updating = true;
		}

		if (block2.position.x - EPS2 > block2Pos[0])
		{
			block2.position.set(block2.position.x - posIncrement, block2.position.y, zPos);
			updating = true;
		}

		if (block3.position.x - EPS2 > block3Pos[0])
		{
			block3.position.set(block3.position.x - posIncrement, block3.position.y, zPos);
			updating = true;
		}
	}

	else if (orientation == 2)
	{
		if (block1.position.y + EPS2 < block1Pos[1])
		{
			block1.position.set(block1.position.x, block1.position.y + posIncrement, zPos);
			updating = true;
		}

		if (block2.position.y + EPS2 < block2Pos[1])
		{
			block2.position.set(block2.position.x, block2.position.y + posIncrement, zPos);
			updating = true;
		}

		if (block3.position.y + EPS2 < block3Pos[1])
		{
			block3.position.set(block3.position.x, block3.position.y + posIncrement, zPos);
			updating = true;
		}
	}

	else if (orientation == 3)
	{
		if (block1.position.x + EPS2 < block1Pos[0])
		{
			block1.position.set(block1.position.x + posIncrement, block1.position.y, zPos);
			updating = true;
		}

		if (block2.position.x + EPS2 < block2Pos[0])
		{
			block2.position.set(block2.position.x + posIncrement, block2.position.y, zPos);
			updating = true;
		}

		if (block3.position.x + EPS2 < block3Pos[0])
		{
			block3.position.set(block3.position.x + posIncrement, block3.position.y, zPos);
			updating = true;
		}
	}



	if (updating == false)
	{
		inMotion = false;
	}
}

// check if the blocks are all in their goal positions
function checkGoal()
{
	var goal1 = (block1Index[0] == block1Goal[0] && block1Index[1] == block1Goal[1]);
	var goal2 = (block2Index[0] == block2Goal[0] && block2Index[1] == block2Goal[1]);
	var goal3 = (block3Index[0] == block3Goal[0] && block3Index[1] == block3Goal[1]);

	return (goal1 && goal2 && goal3);
}

// randomize goal
const numSteps = 7; // number of steps to get to the goal

for (var step = 0; step < numSteps; step++)
{
	if (Math.random() > .5)
	{
		orientation++;
		if (orientation > 3)
		{
			orientation = 0;
		}
	}

	else
	{
		orientation--;
		if (orientation < 0)
		{
			orientation = 3;
		}
	}

	ongoing = true;
	while (ongoing)
	{
		ongoing = false;

		var myBlocks = getBlocks();

		for (var i = 0; i < myBlocks.length; i++)
		{
			if (!checkCollision(myBlocks[i]))
			{
				moveDown(myBlocks[i]);
				ongoing = true;
			}
		}
	}
}

block1Goal[0] = block1Index[0];
block1Goal[1] = block1Index[1];
block2Goal[0] = block2Index[0];
block2Goal[1] = block2Index[1];
block3Goal[0] = block3Index[0];
block3Goal[1] = block3Index[1];

block1Index[0] = block1Origin[0];
block1Index[1] = block1Origin[1];
block2Index[0] = block2Origin[0];
block2Index[1] = block2Origin[1];
block3Index[0] = block3Origin[0];
block3Index[1] = block3Origin[1];



var goal1Pos = getPixelPosition(block1Goal); // pixel position of the circle/red block
var goal2Pos = getPixelPosition(block2Goal); // pixel position of the x/blue block
var goal3Pos = getPixelPosition(block3Goal); // pixel position of the square/yellow block

// add goal blocks to the scene
var material1G = new THREE.MeshLambertMaterial({color: 0xa00000});
var block1G = new THREE.Mesh(blockGeom, material1G);
block1G.position.set(goal1Pos[0], goal1Pos[1], zPos - 10);
scene.add(block1G);

var material2G = new THREE.MeshLambertMaterial({color: 0x0000a0});
var block2G = new THREE.Mesh(blockGeom, material2G);
block2G.position.set(goal2Pos[0], goal2Pos[1], zPos - 10);
scene.add(block2G);

var material3G = new THREE.MeshLambertMaterial({color: 0xa0a000});
var block3G = new THREE.Mesh(blockGeom, material3G);
block3G.position.set(goal3Pos[0], goal3Pos[1], zPos - 10);
scene.add(block3G);


orientation = 0;

//RENDER LOOP
renderer.render(scene, camera);
requestAnimationFrame(render);

function crazyRotate()
{
	camera.up.set(Math.cos(angle), Math.sin(angle), 0);
	camera.lookAt(0, 0, 0);
	angle -= angleIncr;
}

function reset()
{
	orientation = 0;
	angle = Math.PI / 2;
	angleFinal = angle;

	camera.up.set(Math.cos(angle), Math.sin(angle), 0);
	camera.lookAt(0, 0, 0);

	block1Index[0] = block1Origin[0];
	block1Index[1] = block1Origin[1];
	block2Index[0] = block2Origin[0];
	block2Index[1] = block2Origin[1];
	block3Index[0] = block3Origin[0];
	block3Index[1] = block3Origin[1];

	block1Pos = getPixelPosition(block1Index);
	block2Pos = getPixelPosition(block2Index); 
	block3Pos = getPixelPosition(block3Index); 

	block1.position.set(block1Pos[0], block1Pos[1], zPos);
	block2.position.set(block2Pos[0], block2Pos[1], zPos);
	block3.position.set(block3Pos[0], block3Pos[1], zPos);

	renderer.render(scene, camera);
}

function render() 
{
	var rendering = false;
	
	if (rotateCounter)
	{
    	rotateCameraCounterClock();
    	rendering = true;
	}

	if (rotateClock)
	{
		rotateCameraClock();
		rendering = true;
	}
	
	if (applyGrav)
	{
		gravityCheck();
		rendering = true;
	}

	if (rendering)
	{
	    renderer.render(scene, camera);
	    requestAnimationFrame(render);
	}

	// check if the blocks are at the goal
	else
	{
		if (checkGoal())
        {
        	document.getElementById("instructions").innerHTML = "Congrats! Your puzzle solving skills are a-maze-ing!";
        }
	}
}
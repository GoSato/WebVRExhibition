var scene;
var camera;
var element;
var renderer;
var container;
var controls;
var light;
var sphere;
var cameraRig;
var effect;
var stats;

setup();

// モデルのロードを待つ
function setup()
{   
    // Scene
    scene = new THREE.Scene();
    scene.visible = false;

    // モデルの読み込み
    var loader = new THREE.OBJMTLLoader();
    loader.load( 'threejs/models/timelessness.obj', 'threejs/models/timelessness.mtl', onLoad);

    function onLoad(object)
    {
        start(object);
    }
}

// threejsの初期化処理
function start(object)
{
    // camera
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.set(0, 0, 300);
    scene.add(camera);

    // caemraRig
    cameraRig = new THREE.Object3D();
    cameraRig.add(camera);
    scene.add(cameraRig);

    // light
    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 100, 0);
    scene.add(light);

    // renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // container
    element = renderer.domElement;
    container = document.getElementById("container");
    container.appendChild(element);

    // effect
    effect = new THREE.StereoEffect(renderer);
    effect.separation = 0.06;

    stats = new Stats();
    stats.domElement.style.position = "absolute";
    stats.domElement.style.top = "0px";
    stats.domElement.style.zIndex = 100;
    container.appendChild(stats.domElement);

    createScene(object);
}

function createScene(object)
{
    var scale = 150;
    object.scale.x = scale;
    object.scale.y = scale;
    object.scale.z = scale;
    object.position.set(0, 100, 0);
    scene.add(object);
    onLoad();
}

function onLoad()
{
    window.addEventListener("resize", resize, false);
    resize();
    controls = new THREE.DeviceOrientationControls(cameraRig, true);
    controls.connect();
    
    /*マウス*/

    // controls = new THREE.OrbitControls(camera, element);
    // // controls.rotateUp(Math.PI / 4);
    // // 見回すように回転
    // // controls.target.set(
    // //     camera.position.x + 0.15,
    // //     camera.position.y,
    // //     camera.position.z
    // // );
    // controls.noZoom = true;
    // controls.noPan = true;

    createAxis()
    animate();
    scene.visible = true;
}

function animate()
{
    requestAnimationFrame(animate);
    controls.update();
    render();
    stats.update();
}

function render()
{
    effect.render(scene, camera);
}

// function setOrientationControls(e)
// {
//     if(!e.alpha)
//     {
//         return;
//     }

//     controls = new THREE.DeviceOrientationControls(cameraRig, true);
//     controls.connect();

//     window.removeEventListener("deviceorientation", setOrientationControls, true);
// }

function resize()
{
    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    effect.setSize(width, height);
}



function createSphere()
{
    sphere = new THREE.Mesh(
        new THREE.SphereGeometry(50, 20, 20),
        new THREE.MeshLambertMaterial({color: 0xff0000})
    );

    sphere.position.set(0, 0, 0);
    scene.add(sphere);
}

function createGrid()
{
    var grid = new THREE.GridHelper(10000, 100);
    // grid.setColors(0x444444, 0x444444);
    scene.add(grid);
}

function createAxis()
{
    var axis = new THREE.AxisHelper(1000);
    scene.add(axis);
}

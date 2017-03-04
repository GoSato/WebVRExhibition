
window.onload = threeStart;


function threeStart()
{
     console.log("threeStart");
     initThree();
     initScene();
     initCamera();
     initLight();
     initObject();
     createAxis();
     loop();
}

/* ---------------------------------------------------------- */
var renderer;
var container;
var element;

function initThree()
{
    console.log("initThree");
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xFFFFFF, 1);
    element = renderer.domElement;
    container = document.getElementById("container");
    container.appendChild(element);
    renderer.shadowMapEnabled = true;
}

/* ---------------------------------------------------------- */
var scene;

function initScene()
{
    console.log("initScene");
    scene = new THREE.Scene();
    // when use fog, uncomment out.
    // scene.fog = new THREE.FogExp2( 0xcccccc, 0.005 );
}

/* ---------------------------------------------------------- */
var camera;
var controls;

function initCamera()
{
    console.log("initCamera");
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 6000);
    camera.position.set(100, 100, 300);
    controls = new THREE.OrbitControls(camera, element);
    // If you want rotate camera like DeviceOrientationControl, uncomment out.
    // controls.target.set(
    //     camera.position.x + 0.15,
    //     camera.position.y,
    //     camera.position.z
    // );
    controls.enableZoom = true;
    controls.enablePan = true;

    window.addEventListener("resize", resize, false);
    resize();
}

/* ---------------------------------------------------------- */
var light;

function initLight()
{
    console.log("initLight");
    light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(0, 100, 0);
    light.castShadow = true;
    scene.add(light);
}

/* ---------------------------------------------------------- */
function initObject()
{
    console.log("initObject");
    var sphere = new THREE.Mesh(
        new THREE.SphereGeometry(100, 50, 50),
        new THREE.MeshPhongMaterial({
            color: 0x00FF7
        })
    );

    sphere.position.set(0, 30, 0);
    scene.add(sphere);
}

/* ---------------------------------------------------------- */
function loop()
{
    requestAnimationFrame(loop);
    renderer.clear();
    controls.update();
    renderer.render(scene, camera);
}

/* ---------------------------------------------------------- */
// Utility
function createAxis()
{
    var axis = new THREE.AxisHelper(5000);
    scene.add(axis);
}

/* ---------------------------------------------------------- */
function resize()
{
    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    // effect.setSize(width, height);
}
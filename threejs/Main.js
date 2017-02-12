var scene;
var camera;
var element;
var renderer;
var container;
var controls;
var light;
var sphere;

window.addEventListener("DOMContentLoaded", init, false);


function init()
{
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.set(0, 0, 300);
    scene.add(camera);

    var cameraRig = new THREE.Object3D();
    cameraRig.add(camera);
    scene.add(cameraRig);

    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 100, 0);
    scene.add(light);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);

    element = renderer.domElement;

    container = document.getElementById("container");
    container.appendChild(element);

    effect = new THREE.StereoEffect(renderer);
    effect.separation = 0.06;

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

    /*ジャイロ*/

    controls = new THREE.DeviceOrientationControls(cameraRig, true);
    controls.connect();

    window.addEventListener("resize", resize, false);
    resize();

    // window.addEventListener("deviceorientation", setOrientationControls, true);

    loop();

    /*関数*/
    // createSphere();
    objLoad();
    createGrid();
    createAxis();
}

function loop()
{
    requestAnimationFrame(loop);
    controls.update();
    render();
}

function render()
{
    effect.render(scene, camera);
}

function setOrientationControls(e)
{
    if(!e.alpha)
    {
        return;
    }

    controls = new THREE.DeviceOrientationControls(cameraRig, true);
    controls.connect();

    window.removeEventListener("deviceorientation", setOrientationControls, true);
}

function resize()
{
    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    effect.setSize(width, height);
}

function objLoad()
{   
    var loader = new THREE.OBJMTLLoader();
    loader.load( '../models/Robot_BI.obj', '../models/Robot_BI.mtl', function (object) {
        object.position.set(0, 20, 0);
        object.scale.set(20,20,20);
        scene.add(object);
    });
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

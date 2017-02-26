var scene;
var camera;
var element;
var renderer;
var container;
var orbitControls;
var controls;
var light;
var sphere;
var cameraRig;
var effect;
var stats;
var raycaster;
var scopedObj;
var cursor;
var group;
var parent;
var clock;
var elapsedTime = 0;

var useOrbit = false;
var useRaycast = true;

var videoFile="threejs/video/ANIMATION.mp4";
var video;
var videoTexture;
var mode;
var ctx;
var btn;
var audio;
var canvas;
var togglePlay;
var ua;
var rotationY = 0;
var exhibition;

setup();

// モデルのロードを待つ
function setup()
{   
    // Scene
    scene = new THREE.Scene();
    scene.visible = false;

    // Group
    group = new THREE.Group();
    scene.add(group);

    // モデルの読み込み
    var loader = new THREE.OBJMTLLoader();
    loader.load( 'threejs/models/ring_small_050.obj', 'threejs/models/ring_small_050.mtl', onLoad);

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
    camera.position.set(0, 0, 0);
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
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // container
    element = renderer.domElement;
    container = document.getElementById("container");
    container.appendChild(element);

    // effect
    effect = new THREE.StereoEffect(renderer);
    // effect.separation = 0.06;

    // stats FPS計測用
    stats = new Stats();
    stats.domElement.style.position = "absolute";
    stats.domElement.style.top = "0px";
    stats.domElement.style.zIndex = 100;
    // container.appendChild(stats.domElement);

    // raycaster用
    cursor = new THREE.Vector2(0, 0);
    raycaster = new THREE.Raycaster();

    // Time
    clock = new THREE.Clock();

    createScene(object);
}

function createScene(object)
{
    var scale = 70;
    object.scale.x = scale;
    object.scale.y = scale;
    object.scale.z = scale;
    object.position.set(0, -100, 300);
    object.rotation.set(-Math.PI/4, 0, Math.PI/4)
    object.name = "timelessness";
    exhibition = object;
    group.add(exhibition);
    
    // var clone = object.clone();
    // clone.position.set(0, 0, -300);
    // group.add(clone);

    // clone = object.clone();
    // clone.position.set(300, 0, 0);
    // group.add(clone);

    // clone = object.clone();
    // clone.position.set(-300, 0, 0);
    // group.add(clone);

    // //
    // clone = object.clone();
    // clone.position.set(0, -300, 300);
    // group.add(clone);

    // var clone = object.clone();
    // clone.position.set(0, -300, -300);
    // group.add(clone);

    // clone = object.clone();
    // clone.position.set(300, -300, 0);
    // group.add(clone);

    // clone = object.clone();
    // clone.position.set(-300, -300, 0);
    // group.add(clone);

    
   
    onLoad(object);
}

function onLoad(object)
{
    window.addEventListener("resize", resize, false);
    resize();

    // 通常使用
    controls = new THREE.DeviceOrientationControls(camera, true);
    controls.connect();

    // Oribit
    // orbitControls = new THREE.DeviceOrientationControls(object, true);
    // orbitControls.connect();

    /*マウス*/

    // controls = new THREE.OrbitControls(camera, element);
    // // controls.rotateUp(Math.PI / 4);
    // // 見回すように回転
    // controls.target.set(
    //     camera.position.x + 0.15,
    //     camera.position.y,
    //     camera.position.z
    // );
    // controls.noZoom = true;
    // controls.noPan = true;

    // createAxis();
    // createGrid();
    // createSphere();
    createMovie();
    animate();
    scene.visible = true;
}

function animate()
{
    requestAnimationFrame(animate);
    render();
    if(!useRaycast)
    {
        rotation();
    }
    stats.update();
}

function render()
{
    // if(useOrbit)
    // {    
    //     orbitControls.update();
    // }
    // else
    // {
        controls.update();
    // }

    // レイキャスト
    
    if(useRaycast)
    {
        raycaster.setFromCamera(cursor, camera);
        var intersects = raycaster.intersectObjects(group.children, true);
    
        if ( intersects.length > 0 )
        {
            if ( scopedObj != intersects[ 0 ].object )
            {
                if ( scopedObj ) scopedObj.scale.set(1,1,1);
                scopedObj = intersects[ 0 ].object;
                TweenLite.to(scopedObj.scale, 1, {x:2, y:2, z:2});
                // orbitControls.object = scopedObj;
                // orbitControls.connect();
            
                useOrbit = true;
                useRaycast = false;
                // orbitControls.enabled = true;
                // controls.enabled = false;
            }
        } 
    }
    else
    {
        elapsedTime += clock.getDelta();

        if(elapsedTime > 5.0 && useOrbit){

            if ( scopedObj ) 
            {
                TweenLite.to(scopedObj.scale, 1, {x:1, y:1, z:1});
            }
            
            scopedObj = null;

            useOrbit = false;
            // orbitControls.enabled = false;
            // controls.enabled = true;
        }

        if(elapsedTime > 7.0 && !useOrbit)
        {
            useRaycast = true;
            elapsedTime = 0;
        }
    }

    effect.render(scene, camera);
   
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
    //videoImageContext.drawImage(video, 0, 0);
    if (videoTexture) {
      videoTexture.needsUpdate = true;
    }

    if(mode == "currentTime")video.currentTime = audio.currentTime;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

}

function rotation()
{
    rotationY = rotationY + 0.02;
    exhibition.rotation.y = rotationY;
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
        new THREE.CubeGeometry(100, 100, 100),
        new THREE.MeshLambertMaterial({color: 0xff0000})
    );

    sphere.position.set(0, 0, -300);
    group.add(sphere);
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

function createMovie()
{
    btn = document.querySelector('button');
    btn.disabled = true;

    audio = new Audio();
    video = document.createElement('video');
    canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 640;
    ctx = canvas.getContext('2d');
    togglePlay;
    ua = navigator.userAgent;
    mode = 'none';

    if(/(iPhone|iPod)/.test(ua)) { // iPhoneでvideoをインライン再生
        //ctx.scale(0.5,0.5);
        var prms1 = new Promise(function(resolve, reject) {
            video.addEventListener('canplay',function(){
                resolve();
            });
            video.addEventListener('error',function(){
                reject();
                alert('failed loading video');
            });
        });
        var prms2 = new Promise(function(resolve, reject) {
            audio.addEventListener('canplay',function(){
                resolve();
            });
            audio.addEventListener('error',function(){
                reject();
                alert('failed loading audio');
            });
        });
        Promise.all([prms1,prms2]).then(function(){
            btn.disabled = false;
            mode = 'currentTime';
            makeSkybox();
        });
        video.src = videoFile;
        video.load();
        audio.src = videoFile;
        audio.load();

        togglePlay = function(){
        if(audio.paused){
            audio.play();
        } else {
            audio.pause();
        }
        };
    } else { // Androidなどは素直にVideoタグで再生
        //video.style.display = 'block';
        video.src = videoFile;
        video.load();
        video.addEventListener('canplay',function(){
        btn.disabled = false;
        mode = 'defaultPlay';
        makeSkybox();
        },false);
        video.addEventListener('error',function(){
            alert('failed loading video');
        });

        togglePlay = function(){
        if(video.paused){
            video.play();
        } else {
            video.pause();
        }
        };
    }
    btn.addEventListener('click',togglePlay);

    //生成したcanvasをtextureとしてTHREE.Textureオブジェクトを生成
    videoTexture = new THREE.Texture(canvas);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    //生成したtextureをmapに指定し、overdrawをtureにしてマテリアルを生成
    var sky;
    function makeSkybox(){
    var material = new THREE.MeshBasicMaterial({map: videoTexture, overdraw: true, side:THREE.DoubleSide});
    var geometry = new THREE.SphereGeometry( 500, 20, 20 );
    geometry.scale( - 1, 1, 1 );
    sky = new THREE.Mesh( geometry, material );
    scene.add( sky );
    }
}

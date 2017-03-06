
window.onload = threeStart;

var useSmartPhone = true;

function threeStart()
{
     console.log("threeStart");
     initThree();
     initScene();
     initCamera();
     initLight();
     initReticulum();
     createMovie();
     initObject();
    //  createAxis();
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
    scene.fog = new THREE.FogExp2( 0xcccccc, 0.0005 );
}

/* ---------------------------------------------------------- */
var camera;
var controls;
var effect;

function initCamera()
{
    console.log("initCamera");
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 6000);
    camera.position.set(0, 100, 0);
    scene.add(camera);
    
    // ↓ Use PC
    if(useSmartPhone == false)
    {
        controls = new THREE.OrbitControls(camera, element);
        // If you want rotate camera like DeviceOrientationControl, uncomment out.
        controls.target.set(
            camera.position.x + 0.15,
            camera.position.y,
            camera.position.z
        );
        controls.enableZoom = true;
        controls.enablePan = true;
    }

    // ↓ Use SmartPhone
    if(useSmartPhone)
    {
        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        effect   = new THREE.StereoEffect(renderer);
    }

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
var panelUI1;
var panelUI2;

function initObject()
{
    console.log("initObject");

    // Sphere1
    var sphere1 = new THREE.Mesh(
        new THREE.SphereGeometry(100, 50, 50),
        new THREE.MeshPhongMaterial({
            color: 0x00FF7
        })
    );

    sphere1.position.set(0, 0, 300);
    sphere1.name = "blue";
    scene.add(sphere1);

    // set event
    Reticulum.add( sphere1, {
		reticleHoverColor: 0x00fff6,
		fuseVisible: true,
		onGazeOver: function(){
			// do something when user targets object
		},
		onGazeOut: function(){
			// do something when user moves reticle off targeted object
		},
		onGazeLong: function(){
			// do something user targetes object for specific time
            panelUI1.visible = true;
		},
		onGazeClick: function(){
			// have the object react when user clicks / taps on targeted object
		}
	});

    // Sphere2
    var sphere2 = new THREE.Mesh(
        new THREE.SphereGeometry(100, 50, 50),
        new THREE.MeshPhongMaterial({
            color: 0xFF0000
        })
    );

    sphere2.position.set(0, 0, -300);
    sphere2.name = "red";
    scene.add(sphere2);

    // Image
    var texture = new THREE.ImageUtils.loadTexture('threejs/image/secca_logo.jpg');
    texture.anisotropy = renderer.getMaxAnisotropy();
    var material = new THREE.MeshBasicMaterial({map: texture, transparent: true});
    var planegeometory = new THREE.PlaneGeometry(149, 24, 64, 64);
    panelUI1 = new THREE.Mesh(planegeometory, material);
    panelUI1.visible = false;
    panelUI1.position.set(0, 150, 0);
    panelUI1.rotation.set(0, Math.PI, 0);
    sphere1.add(panelUI1);

    // PlayPanel
    texture = new THREE.ImageUtils.loadTexture('threejs/image/play.png');
    texture.anisotropy = renderer.getMaxAnisotropy();
    var material = new THREE.MeshBasicMaterial({map: texture, transparent: true});
    var planegeometory = new THREE.PlaneGeometry(40, 40, 64, 64);
    var playPanel = new THREE.Mesh(planegeometory, material);
    playPanel.position.set(120, 0, 0);
    panelUI1.add(playPanel);

     // set event
    Reticulum.add( playPanel, {
		reticleHoverColor: 0x00fff6,
		fuseVisible: true,
		onGazeOver: function(){
			// do something when user targets object
		},
		onGazeOut: function(){
			// do something when user moves reticle off targeted object
		},
		onGazeLong: function(){
			// do something user targetes object for specific time
            togglePlay();
		},
		onGazeClick: function(){
			// have the object react when user clicks / taps on targeted object
		}
	});

    // ClosePanel
    texture = new THREE.ImageUtils.loadTexture('threejs/image/close.png');
    texture.anisotropy = renderer.getMaxAnisotropy();
    var material = new THREE.MeshBasicMaterial({map: texture, transparent: true});
    var planegeometory = new THREE.PlaneGeometry(40, 40, 64, 64);
    var closePanel = new THREE.Mesh(planegeometory, material);
    closePanel.position.set(-120, 0, 0);
    closePanel.name = "close";
    panelUI1.add(closePanel);

    Reticulum.add( closePanel, {
        reticleHoverColor: 0x00fff6,
        fuseVisible: true,
        onGazeOver: function(){
            // do something when user targets object
        },
        onGazeOut: function(){
            // do something when user moves reticle off targeted object
        },
        onGazeLong: function(){
            // do something user targetes object for specific time
            panelUI1.visible = false;
            togglePlay();
        },
        onGazeClick: function(){
            // have the object react when user clicks / taps on targeted object
        }
    });

    panelUI2 = panelUI1.clone();
    panelUI2.visible = false;
    panelUI2.position.set(0, 150, 0);
    panelUI2.rotation.set(0, 0, 0);
    sphere2.add(panelUI2);
}

/* ---------------------------------------------------------- */
var videoFile="threejs/video/ANIMATION.mp4";
var video;
var videoTexture;
var mode;
var ctx;
var audio;
var canvas;
var togglePlay;
var ua;

function createMovie()
{

    audio = new Audio();
    video = document.createElement('video');
    canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 640;
    ctx = canvas.getContext('2d');
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

    function ready()
    {
        audio.play();
        audio.pause();
        document.removeEventListener('touchstart', ready, false);
    }

    document.addEventListener('touchstart', ready, false);

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

/* ---------------------------------------------------------- */
function initReticulum()
{
    Reticulum.init(camera, {
        proximity: false,
        clickevents: false,
        near: null, //near factor of the raycaster (shouldn't be negative and should be smaller than the far property)
        far: null, //far factor of the raycaster (shouldn't be negative and should be larger than the near property)
        reticle: {
            visible: true,
            restPoint: 1000, //Defines the reticle's resting point when no object has been targeted
            color: 0xcc0000,
            innerRadius: 0.0001,
            outerRadius: 0.01,
            hover: {
                color: 0xcc0000,
                innerRadius: 0.02,
                outerRadius: 0.024,
                speed: 5,
                vibrate: 50 //Set to 0 or [] to disable
            }
        },
        fuse: {
            visible: false,
            duration: 2.5,
            color: 0x00fff6,
            innerRadius: 0.045,
            outerRadius: 0.06,
            vibrate: 100, //Set to 0 or [] to disable
            clickCancelFuse: false //If users clicks on targeted object fuse is canceled
        }
    });
}

/* ---------------------------------------------------------- */
function loop()
{
    requestAnimationFrame(loop);
    renderer.clear();
    controls.update();
    Reticulum.update();

    // ↓ Use PC
    if(useSmartPhone == false)
    {
        renderer.render(scene, camera);
    }

    // ↓ Use SmartPhone
    if(useSmartPhone)
    {
        effect.render(scene, camera);
    }

    // Use Movie
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        //videoImageContext.drawImage(video, 0, 0);
        if (videoTexture) {
        videoTexture.needsUpdate = true;
        }

        if(mode == "currentTime")
        {
            video.currentTime = audio.currentTime;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
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

    // use SmartPhone
    if(useSmartPhone)
    {
        effect.setSize(width, height);
    }
}
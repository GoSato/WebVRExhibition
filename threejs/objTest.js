// forked from cx20's "three.js で OBJ 形式のデータを表示してみるテスト（その６）" http://jsdo.it/cx20/Akft
// forked from cx20's "three.js で OBJ 形式のデータを表示してみるテスト（その５）" http://jsdo.it/cx20/QBVx
// forked from cx20's "three.js で OBJ 形式のデータを表示してみるテスト（その４）" http://jsdo.it/cx20/EGey
// forked from cx20's "three.js で OBJ 形式のデータを表示してみるテスト（その３）" http://jsdo.it/cx20/yOBb
// forked from cx20's "three.js で OBJ 形式のデータを表示してみるテスト（その１）" http://jsdo.it/cx20/wGMY
// forked from cx20's "three.js で Blender のデータを表示してみるテスト" http://jsdo.it/cx20/2CXI
// forked from 【WebGL特集】第4回：Blenderでモデル出力 http://mox-motion.com/blog/webgl04-2/

var gopher;

window.addEventListener("DOMContentLoaded", init, false);

  
function init() {
    width = window.innerWidth;
    height = window.innerHeight;
    
    scene = new THREE.Scene();
  
    var ambient = new THREE.AmbientLight( 0x101030 );
    scene.add( ambient );

    //ライティング
    var light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    var light2 = new THREE.DirectionalLight(0xffffff);
    light2.position.set(-1, -1, -1).normalize();
    scene.add(light2);
    

    camera = new THREE.PerspectiveCamera( 75, width / height, 1, 2000 );
    camera.position.z = 10;

    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
    };

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };

	var loader = new THREE.OBJMTLLoader();
    // gopher.obj / gopher.mtl
    loader.load( '../models/timelessness.obj', '../models/timelessness.mtl', function ( object ) {
        object.position.y -= 2.0;
		gopher = object;
		scene.add( object );
	} );
    
    var axis = new THREE.AxisHelper(1000);   
    scene.add(axis);

    renderer = new THREE.WebGLRenderer();

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.userPan = false;
    controls.userPanSpeed = 0.0;
    controls.maxDistance = 5000.0;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.autoRotate = true;     //true:自動回転する,false:自動回転しない
    controls.autoRotateSpeed = 10.0;    //自動回転する時の速度

    renderer.setSize( width, height );

    var element = renderer.domElement;

    var container = document.getElementById("container");
    container.appendChild(element);  

    animate();
}
  
function animate(dt) {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    controls.update();
}

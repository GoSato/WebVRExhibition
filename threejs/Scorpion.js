if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var container, stats;
var camera, scene, renderer;
var directionalLight, pointLight;
var controls;

var cubeTexUrls;
var glass;
var bodyMaterials;
var bodyMesh;

var maxDist = 100;


setup();

/*
setup
シーンやマテリアルを作成してモデルのロードを待つ
*/
function setup()
{
  // Scene
  scene = new THREE.Scene();
  scene.visible = false;

  // モデルの読み込み
  var loader = new THREE.OBJMTLLoader();
  loader.load( "obj/Robot_BI.obj", "obj/Robot_BI.mtl", onLoad );

  // 環境マップ用テクスチャをロードして textureCube を作成
  var r = "cube_tex/";
  cubeTexUrls = [ r + "posx.jpg", r + "negx.jpg", r + "posy.jpg", r + "negy.jpg", r + "posz.jpg", r + "negz.jpg" ];
  var textureCube = THREE.ImageUtils.loadTextureCube( cubeTexUrls );

  // マテリアル（ガラス）
  glass = new THREE.MeshBasicMaterial( {
    color: 0x223344,
    envMap: textureCube,
    opacity: 0.1,
    combine: THREE.MixOperation,
    reflectivity: 0.7,
    transparent: true
  } )

  // ロボの本体色変更用マテリアル
  bodyMaterials =
  {
    Red: new THREE.MeshLambertMaterial( {
      color: 0x660000,
      envMap: textureCube,
      combine: THREE.MixOperation,
      reflectivity: 0.5
    } ),

    Blue: new THREE.MeshLambertMaterial( {
      color: 0x224466,
      envMap: textureCube,
      combine: THREE.MixOperation,
      reflectivity: 0.3,
      side: THREE.DoubleSide
    } ),

    Black: new THREE.MeshLambertMaterial( {
      color: 0x000000,
      envMap: textureCube,
      combine: THREE.MixOperation,
      reflectivity: 0.5
    } ),

    White: new THREE.MeshLambertMaterial( {
      color: 0xffffff,
      envMap: textureCube,
      combine: THREE.MixOperation,
      reflectivity: 0.5
    } ),

    Scorpion: new THREE.MeshPhongMaterial( {
      color: 0x770000,
      specular: 0xffaaaa,
      envMap: textureCube,
      combine: THREE.MultiplyOperation
    } ),

    Gold: new THREE.MeshPhongMaterial( {
      color: 0xaa9944,
      specular: 0xbbaa99,
      shininess: 50,
      envMap: textureCube,
      combine: THREE.MultiplyOperation
    } ),

    Chrome: new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      specular:0xffffff,
      envMap: textureCube,
      combine: THREE.MultiplyOperation
    } ),

    Wire: new THREE.MeshPhongMaterial( {
      color: 0xffaa66,
      wireframe: true
    } )
  };

  function onLoad( object )
  {
    document.getElementById("disp").style.display="none";
    start(object);
  };
}


/*
start
threejs の初期化処理を行いスタート
*/
function start( object )
{
  // container
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  // camera
  camera = new THREE.PerspectiveCamera( 70, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
  camera.position.x = -25;
  camera.position.y = 50;
  camera.position.z = 30;
  camera.lookAt(new THREE.Vector3(0,0,0));

  // light
  var ambient = new THREE.AmbientLight( 0xFFFFFF );
  scene.add( ambient );

  var directionalLight = new THREE.DirectionalLight( 0x999999 );
  directionalLight.position.set( -1.5, 2, -0.5 ).normalize();
  directionalLight.castShadow = true;
  //directionalLight.shadowCameraVisible = true;
  directionalLight.shadowMapWidth = 1024; // デプステクスチャの横幅
  directionalLight.shadowMapHeight = 1024; // デプステクスチャの高さ
  var d = 50; // dist 大きければ広範囲・小さい蹴れば狭範囲
  directionalLight.shadowCameraLeft = -d;
  directionalLight.shadowCameraRight = d;
  directionalLight.shadowCameraTop = d;
  directionalLight.shadowCameraBottom = -d;
  directionalLight.shadowCameraNear = -30; // 四角錐台の上面の位置
  directionalLight.shadowCameraFar = 20; // 四角錐台の下面の位置
  directionalLight.shadowCameraFov = 1; // 視野角
  directionalLight.shadowBias = 0.0001;
  directionalLight.shadowDarkness = 0.5;
  scene.add( directionalLight );

  pointLight = new THREE.PointLight( 0x333333 );
  scene.add( pointLight );


  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
  renderer.setFaceCulling( THREE.CullFaceNone );
  renderer.setClearColor( 0xFFFFFF );
  renderer.shadowMapEnabled = true;

  container.appendChild( renderer.domElement );

  // stats
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.zIndex = 100;

  container.appendChild( stats.domElement );

  //
  createScene( object );
}


/*
resized window
ウィンドウリサイズ時のハンドラ
*/
function onWindowResize()
{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}


/*
create scene
MeshFaceMaterial に bodyMaterials のマテリアルを設定してメッシュを作成
*/
function createScene( object )
{
  var scale = 5;
  object.scale.x = scale;
  object.scale.y = scale;
  object.scale.z = scale;

  for(var i = 0; i < object.children.length; i++)
  {
    var obj = object.children[i];
    var l = object.children[i].children.length;
    for(var j = 0; j < l; j++)
    {
      var mesh = obj.children[j];
      console.log(mesh);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      if(mesh.material.name == "lensglass")
      {
        mesh.material = glass;
      }
      else if (mesh.material.name == "shinymetal") {
        mesh.material = bodyMaterials.Chrome;
      }
      else
      {
        //
        // 色を変更する Mesh
        if(mesh.material.name == "colmetal")
        {
          bodyMesh = mesh;
          bodyMesh.material = bodyMaterials.Red;
        }
      }
    }
  }
  scene.add( object );
  object.position.y = -2;


  // skybox
  var size = (maxDist * 100)/2;
  var skyGeometry = new THREE.CubeGeometry( size, size, size );
  var materialArray = [];
  for (var i = 0; i < 6; i++)
  {
    var mat = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture( cubeTexUrls[i] ), side: THREE.BackSide });
    materialArray.push( mat );
  }
  var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
  var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
  skyBox.receiveShadow = true;
  skyBox.rotation.y = 180;
  scene.add( skyBox );


  // ground
  var planeGeo = new THREE.PlaneGeometry(size, size);
  var texture = THREE.ImageUtils.loadTexture( "tex/ground.jpg", null, onLoadGround )
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 64, 48 );
  var mat = new THREE.MeshLambertMaterial({map:texture});
  var plane = new THREE.Mesh( planeGeo, mat );
  plane.rotation.x = - Math.PI / 2
  plane.position.y = -2;
  plane.receiveShadow = true;
  scene.add( plane );

  function onLoadGround()
  {
    // window resize event listener
    window.addEventListener( 'resize', onWindowResize, false );
    // orbit ctrl
    controls = new THREE.OrbitControls(camera, container);
    controls.minDistance = 30; // カメラ最小距離
    controls.maxDistance = maxDist; // カメラ最大距離
    controls.keyPanSpeed = .1; // パンの速度
    controls.rotateSpeed = .75; // 回転の速度
    controls.maxPolarAngle = Math.PI * .5; // 最大回転角（ラジアン値）
    // render
    animate();
    //
    scene.visible = true;
    //
    createButtons( bodyMaterials );
  }
}


/*
create ｂuttons
マテリアルの切り替え用ボタンを設定
*/
function createButtons( materials )
{
  var buttons = document.getElementById( "buttons" );
  for ( var key in materials )
  {
    var button = document.createElement( 'button' );
    button.textContent = key;
    // マテリアルの切り替え
    button.addEventListener( 'click', function ( event ) {
      bodyMesh.material = materials[ this.textContent ];
    }, false );
    buttons.appendChild( button );

  }
}


/*
animate
*/
var count = 0;
var skipCount = 2;
function animate()
{
  requestAnimationFrame( animate );
  // 謎の疑似高速化ｗ
  if(count < skipCount)
  {
    controls.update();
    render();
    count ++;;
  }
  else
  {
    count = 0;
  }
  stats.update();
}


/*
render
*/
function render()
{
  var timer = -0.001 * Date.now();

  pointLight.position.x = 1000 * Math.cos( timer );
  pointLight.position.z = 1000 * Math.sin( timer );

  renderer.render( scene, camera );
}

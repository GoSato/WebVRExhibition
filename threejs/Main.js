(function(){
	var STEP = 100;

	var scene; // シーン
	var spere; // 球体
	var camera; // カメラ
	var element; // DOM
	var renderer; // レンダラー
	var container; // 描画領域
	var controls; // 操作
	var light; // 照明
	var clock;
	var edgesPool;

	function init()
	{
		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 3000);
		camera.position.set(0, 700, 0);
		scene.add(camera);

		// ライト
		// light = new THREE.DirectionalLight(0xffffff, 1);
		// light.position.set(200, 100, 300);
		// scene.add(light);

		renderer = new THREE.WebGLRenderer({antialias: true});
		renderer.setClearColor(0x0);
		renderer.setSize(window.innerWidth, window.innerHeight);

		// DOM
		element = renderer.domElement;

		// 描画領域
		container = document.getElementById("container");
		container.appendChild(element);

		// ２眼にする
		effect = new THREE.StereoEffect(renderer);
		effect.separation = 0.06;

		controls = new THREE.OrbitControls(camera, element);
		controls.rotateUp(Math.PI / 4);
		controls.target.set(
			camera.position.x + 0.15,
			camera.position.y,
			camera.position.z
		);
		controls.noZoom = true;
		controls.noPan = true;

		clock = new THREE.Clock;

		// ジャイロセンサーを使って制御
		window.addEventListener("deviceorientation", setOrientationControls, true);

		window.addEventListener("resize", resize, false);
		resize();

		createBox();

		createBrid();

		// sphere = new THREE.Mesh(
		// 	new THREE.SphereGeometry(100, 20, 20),
		// 	new THREE.MeshLambertMaterial({color: 0x8dc3ff})
		// );
		// sphere.position.set(0,0,10);
		// scene.add(sphere);

		loop();
	}

	function setOrientationControls(e){
		if(!e.alpha){
			return;
		}

		controls = new THREE.DeviceOrientationControls(camera, true);
		controls.connect();
		controls.update();

		element.addEventListener("click", fullscreen, false);

		window.removeEventListener("deviceorientation", setOrientationControls, true);
	}

	function createBox() {
		edgesPool = [];

		var geometry = new THREE.BoxGeometry(STEP, STEP, STEP, 1, 1, 1);
		var material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });

		for(var i = 0; i < 700; i++) {
			var mesh = new THREE.Mesh(geometry, material);
			// 立方体を作る
			var egh = new THREE.EdgesHelper(mesh, 0xFF0000);
			egh.material.linewidth = 1;
			egh.updateMatrix();
			scene.add(egh);

			edgesPool.push(egh);

			startDrop(egh);
		}
	}

	function startDrop(egh)
	{
		egh.position.x = STEP * Math.round(6000 * (Math.random() - 0.5) / STEP) + STEP / 2;
		egh.position.y = 5000;
		egh.position.z = STEP * Math.round(6000 * (Math.random() - 0.5) / STEP) + STEP / 2;
		egh.updateMatrix();

		var sec = 3 * Math.random() + 3;

		TweenMax.to(egh.position, sec, {
			y: STEP / 2 + 10,
			ease: Bounce.easeOut,
			onComplete: endDrop,
			onCompleteParams: [egh]
		});
	}

	function endDrop(egh)
	{
		setTimeout(function(){
			startDrop(egh)
		}, 1000);
	}

	function createBrid()
	{
		var grid = new THREE.GridHelper(10000, STEP);
		grid.setColors(0x444444, 0x444444);
		scene.add(grid);
	}

	function fullscreen(){
		if(container.requestFullscreen)
		{
			container.requestFullscreen();
		}
		else if(container.msRequestFullScreen)
		{
			container.msRequestFullScreen();
		}
		else if(container.mozRequestFullScreen)
		{
			container.mozRequestFullScreen();
		}
		else if(container.webkitRequestFullScreen)
		{
			container.webkitRequestFullScreen();
		}
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

	function loop(){
		requestAnimationFrame(loop);
		update(clock.getDelta());
		render();
	}

	function update(dt)
	{
		if(edgesPool){
			for(var i=0; i<edgesPool.length; i++)
			{
				edgesPool[i].updateMatrix();
			}
		}
		camera.updateProjectionMatrix();
		controls.update(dt);
	}

	function render(){
		effect.render(scene, camera);
	}

	window.addEventListener("DOMContentLoaded", init, false);

})();
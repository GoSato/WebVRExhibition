(function() {

  var root = this;
  var previousShinySound = root.ShinySound || {};

  var shinysound, cardboard;

  var ShinySound = root.ShinySound = function(ctxAudio, callback) {

    var i = 0;

    THREE.Object3D.call(this);

    var file = 'forward_thinking96.mp3';

    var ready = _.after(2, function() {
      if (callback && typeof callback === 'function') {
        console.log('resolve shinysound');
        callback();
      }
    });

    var audioTexture = this.audioTexture = new THREE.AudioTexture('audio/' + file, ctxAudio, ready);

    // Camera Rig

    this.cameraRig = new THREE.Object3D();
    this.cameraRig.add(cardboard.camera);
    cardboard.scene.add(this.cameraRig);

    // skyBox

    var skyBoxTexture = window.skybox = THREE.ImageUtils.loadTextureCube([
      'textures/skybox/skybox_px.jpg', // x-axis
      'textures/skybox/skybox_nx.jpg',
      'textures/skybox/skybox_py.jpg', // y-axis
      'textures/skybox/skybox_ny.jpg',
      'textures/skybox/skybox_pz.jpg', // z-axis
      'textures/skybox/skybox_nz.jpg'
    ], undefined, ready);

    var skyBoxShader = THREE.ShaderLib.cube;
    skyBoxShader.uniforms = {
      'tCube': {
        type: 't',
        value: null
      },
      'tFlip': {
        type: 'f',
        value: -1
      }
    };
    skyBoxShader.uniforms.tCube.value = skyBoxTexture;

    var skyBoxMaterial = new THREE.ShaderMaterial({
      fragmentShader: skyBoxShader.fragmentShader,
      vertexShader: skyBoxShader.vertexShader,
      uniforms: skyBoxShader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    });

    var skyBox = new THREE.Mesh(
    new THREE.BoxGeometry(20, 20, 20),
    skyBoxMaterial
    );

    cardboard.scene.add(skyBox);

    var ambientLight = new THREE.AmbientLight(0x333333);

    var keyLight = new THREE.DirectionalLight(0xffffff, 0.1);
    keyLight.position.set(5, 10, 10);

    var fillLight = new THREE.DirectionalLight(0xffffff, 0.1);
    fillLight.position.set(-10, -22, 10);

    var backLight = new THREE.DirectionalLight(0xffffff, 0.9);
    backLight.position.set(5, -5, -9);

    this.cameraRig.add(keyLight);
    this.cameraRig.add(fillLight);
    this.cameraRig.add(backLight);
    this.cameraRig.add(ambientLight);

    // molecule

    var _radiusCore = 0.2;
    var _radiusSheild = _radiusCore * 2.25;
    var _radiusBubble = _radiusCore * 1.15;

    this.molecule = new THREE.Object3D();
    cardboard.scene.add(this.molecule);

    // nucleus

    var nucleusSpecular = new THREE.ImageUtils.loadTexture('textures/shinysound/noise.jpg');
    var nucleusBump = new THREE.ImageUtils.loadTexture('textures/shinysound/bump.jpg');

    this.nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(_radiusCore, 32, 32),
    new THREE.MeshPhongMaterial({
      shininess: 20,
      specularMap: nucleusSpecular,
      bumpMap: nucleusBump,
      bumpScale: 0.1,
      ambient: 0x0072bc,
      specular: 0xf7cfff,
      shading: THREE.SmoothShading
    })
    );

    this.molecule.add(this.nucleus);

    // bubble

    this.bubble = new THREE.Mesh(
    new THREE.IcosahedronGeometry(_radiusBubble, 4),

    new THREE.MeshPhongMaterial({
      shininess: 60,
      ambient: 0x000000,
      color: 0x000000,
      specular: 0xffffff,
      refractionRatio: 0.91,
      reflectivity: 0.3,
      envMap: skyBoxTexture,
      combine: THREE.AddOperation,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      shading: THREE.SmoothShading
    })
    );

    this.molecule.add(this.bubble);

    // shield

    var icosahedron = new THREE.IcosahedronGeometry(_radiusSheild, 1);
    icosahedron = this.icosahedron = explodeGeo(icosahedron);

    var sheildShader = THREE.MoleculeSheildShader;
    sheildShader.uniforms = THREE.UniformsUtils.clone(THREE.MoleculeSheildShader.uniforms);
    sheildShader.uniforms.tFft.value = audioTexture.texture;

    this.shield = new THREE.Mesh(
    icosahedron,
    new THREE.ShaderMaterial({
      fragmentShader: sheildShader.fragmentShader,
      vertexShader: sheildShader.vertexShader,
      depthWrite: false,
      transparent: true,
      uniforms: sheildShader.uniforms,
      blending: THREE.AdditiveBlending
    })
    );

    this.molecule.add(this.shield);

    // network

    var networkShader = THREE.MoleculeNetworkShader;
    networkShader.uniforms = THREE.UniformsUtils.clone(THREE.MoleculeNetworkShader.uniforms);
    networkShader.uniforms.tFft.value = audioTexture.texture;
    var networkMaterial = new THREE.ShaderMaterial({
      fragmentShader: networkShader.fragmentShader,
      vertexShader: networkShader.vertexShader,
      depthWrite: false,
      transparent: true,
      wireframe: true,
      uniforms: sheildShader.uniforms,
      blending: THREE.AdditiveBlending
    });

    var network = new THREE.Mesh(
    icosahedron,
    networkMaterial
    );

    this.molecule.add(network);

    // satelites

    var sateliteCoreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      envMap: skyBoxTexture,
      transparent: true,
      shading: THREE.FlatShading,
      opacity: 0
    });

    this.satelites = [];
    var sateliteGeo = new THREE.IcosahedronGeometry(_radiusSheild / 3, 0);
    for (i = 0; i < 10; i++) {

      this.satelites[i] = new THREE.Mesh(
      sateliteGeo,
      networkMaterial
      );

      this.satelites[i].core = new THREE.Mesh(
      sateliteGeo,
      sateliteCoreMaterial
      );
      this.satelites[i].core.visible = false;
      this.satelites[i].core.renderDepth = 100000;
      this.satelites[i].core.scale.multiplyScalar(0.9);

      this.satelites[i].add(this.satelites[i].core);

      this.satelites[i].position.set(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).multiplyScalar(1 + Math.random() * 2);
      this.satelites[i].scale.multiplyScalar(1 + Math.random());
      this.satelites[i].phase = Math.random() * Math.PI * 2;

      this.satelites[i].dir = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
        (Math.random() - 0.5) * 0.025,
        (Math.random() - 0.5) * 0.025,
        (Math.random() - 0.5) * 0.025
        )
      );

      this.molecule.add(this.satelites[i]);

    }

    // lines

    var LINE_OPACITY = 0.33;

    var lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 1,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0
    });

    var geometry = new THREE.Geometry();

    for (i = 0; i < 20; i++) {

      var x = (Math.random() - 0.5) * _radiusSheild * 10000;
      var y = (Math.random() - 0.5) * _radiusSheild * 10000;
      var z = (Math.random() - 0.5) * _radiusSheild * 10000;

      geometry.vertices.push(new THREE.Vector3());
      geometry.vertices.push(new THREE.Vector3(x, y, z));

    }

    var line = new THREE.Line(geometry, lineMaterial);
    this.molecule.add(line);

    // particles

    var particleGeo = new THREE.Geometry();
    for (i in icosahedron.vertices) {
      particleGeo.vertices.push(new THREE.Vector3(
      icosahedron.vertices[i].x,
      icosahedron.vertices[i].y,
      icosahedron.vertices[i].z
      ));
    }

    var particleMaterial = new THREE.PointCloudMaterial({
      color: 0xffffff,
      // size: _radiusCore * 0.05,
      sizeAttenuation: false,
      size: 3,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0
    });
    var particles = new THREE.PointCloud(
    particleGeo,
    particleMaterial
    );

    this.molecule.add(particles);

    cardboard.camera.position.z = 2.0;

    cardboard.controls.object = this.cameraRig;
    cardboard.controls.object.rotation.reorder('YXZ');

    var scope = this;
    var time;
    var beatTime, beatCount, beatEnvelope, doubleBeatTime, doubleBeatCount, doubleBeatEnvelope, hornTime, hornEnvelope;
    var bands, v_length, b_length;

    var horns = [42.4, 63.5, 71.8, 80.2];

    audioTexture.onAudioUpdated = function(event) {

      bands = event.fftBuffer;
      v_length = icosahedron.vertices.length;
      b_length = bands.length;

      scope.bubble.scale.set(1, 1, 1).multiplyScalar(1 + bands[64] / 500);
      scope.nucleus.scale.set(1, 1, 1).multiplyScalar(1 - bands[128] / 1000);

      for (var i = 0; i < v_length; i++) {

        var b = imap(i, 0, v_length, 0, b_length);
        var amplitude = map(bands[b], 0, 255, 0, _radiusSheild);

        var length = amplitude * 0.5 + _radiusSheild;

        icosahedron.vertices[i].setLength(length);
        particleGeo.vertices[i].setLength(length);
      }

      icosahedron.verticesNeedUpdate = true;
      particleGeo.verticesNeedUpdate = true;

      time = audioTexture.source.context.currentTime % audioTexture.source.buffer.duration;

      beatTime = (Math.max(time - 16.93, 0) % 0.52) / 0.52;
      beatCount = Math.round((Math.max(time - 16.93, 0)) / 0.52 - beatTime);
      beatEnvelope = Math.min(beatTime * 4, 1 - beatTime) / 4;

      doubleBeatTime = (Math.max((time + 0.52) - 16.93, 0) % 1.04) / 1.04;
      doubleBeatCount = Math.round((Math.max((time + 0.52) - 16.93, 0)) / 1.04 - doubleBeatTime);
      doubleBeatEnvelope = Math.min(doubleBeatTime * 20, 1 - doubleBeatTime);

      // console.log( beatTime );

      // sunrise
      if (time > 8.6 && time < 12) {

        lineMaterial.opacity = (lineMaterial.opacity * 400 + LINE_OPACITY) / 401;

      // sunset
      } else if (time > 12 && beatCount < 15) {

        particleMaterial.opacity = (particleMaterial.opacity * 100 + LINE_OPACITY) / 101;
        lineMaterial.opacity *= 0.99;

      // sunset
      } else if (beatCount >= 15 && beatCount < 48) {

        if (line.lastBeat && line.lastBeat !== doubleBeatCount) {
          line.rotation.set(
            Math.random() * 2 * Math.PI,
            Math.random() * 2 * Math.PI,
            Math.random() * 2 * Math.PI
          );
        }
        lineMaterial.opacity = doubleBeatEnvelope * LINE_OPACITY / 4;
        line.lastBeat = doubleBeatCount;

      // snare
      } else if (beatCount >= 48 && beatCount < 79) {

        lineMaterial.opacity = (lineMaterial.opacity * 50 + LINE_OPACITY / 2) / 51;

      // beat solo
      } else if (beatCount >= 80 && beatCount < 88) {

        scope.nucleus.scale.multiplyScalar(1 + beatEnvelope);
        scope.bubble.scale.multiplyScalar(1 + beatEnvelope);

        lineMaterial.opacity *= 0.8;

      // snare
      } else if (beatCount >= 89 && beatCount < 120) {

        lineMaterial.opacity = (lineMaterial.opacity * 50 + LINE_OPACITY / 2) / 51;

        if (line.lastBeat && line.lastBeat !== doubleBeatCount) {
          line.rotation.set(
            Math.random() * 2 * Math.PI,
            Math.random() * 2 * Math.PI,
            Math.random() * 2 * Math.PI
          );
        }
        lineMaterial.opacity = doubleBeatEnvelope * LINE_OPACITY / 2;
        line.lastBeat = doubleBeatCount;

        sateliteCoreMaterial.opacity = (sateliteCoreMaterial.opacity * 1000 + 1) / 1001;

      // sunset
      } else if (beatCount > 135) {

        particleMaterial.opacity *= 0.97;
        lineMaterial.opacity *= 0.97;
        sateliteCoreMaterial.opacity *= 0.97;

      }

      if (beatTime === 0) {
        for (i = 0; i < scope.satelites.length; i++) {
          scope.satelites[i].core.visible = false;
        }
      } else if (beatCount === 87) {
        for (i = 0; i < scope.satelites.length; i++) {
          scope.satelites[i].core.visible = true;
        }
      }

      /// HORNS
      for (i = 0; i < horns.length; i++) {

        hornTime = Math.max(time - horns[i], 0);
        hornEnvelope = Math.min(hornTime * 2, 2.5 - hornTime) / 4;
        if (hornTime > 0 && hornTime < 2.5) {
          scope.nucleus.position.set(
            (Math.random() - 0.5) * hornEnvelope * 0.05,
            (Math.random() - 0.5) * hornEnvelope * 0.05,
            (Math.random() - 0.5) * hornEnvelope * 0.05
          );
        }

      }

    };

    // var up = new THREE.Vector3();
    // var forward = new THREE.Vector3();

    this.update = function() {

      var now = Date.now() / 10000;

      this.nucleus.rotation.x += 0.002;
      this.nucleus.rotation.y += 0.003;
      this.nucleus.rotation.z += 0.005;

      for (var i = 0; i < 10; i++) {

        this.satelites[i]
          .quaternion
          .multiply(this.satelites[i].dir);

        this.satelites[i]
          .position
          .normalize()
          .multiplyScalar(2 + Math.sin(now + this.satelites[i].phase));

      }

      // up.set(0,1,0).applyQuaternion(cardboard.controls.object.quaternion);
      // forward.set(0,0,1).applyQuaternion(cardboard.controls.object.quaternion);
      // if( Math.abs(up.y) < 0.2 && Math.abs(forward.y) < 0.6) {
      //   console.log( 'sideways' );
      // }

    };

  };

  ShinySound.noConflict = function() {
    root.ShinySound = previousShinySound;
    return ShinySound;
  };

  function explodeGeo(geo) {

    var vertices = geo.vertices;
    var uvs = geo.faceVertexUvs[0];

    var geometry = new THREE.Geometry();

    var faces = geo.faces;
    var i, il;

    for (i = 0, il = faces.length; i < il; i++) {

      geometry.vertices.push(vertices[faces[i].a].clone());
      geometry.vertices.push(vertices[faces[i].b].clone());
      geometry.vertices.push(vertices[faces[i].c].clone());
      geometry.faces.push(faces[i].clone());
      geometry.faces[geometry.faces.length - 1].a = geometry.vertices.length - 3;
      geometry.faces[geometry.faces.length - 1].b = geometry.vertices.length - 2;
      geometry.faces[geometry.faces.length - 1].c = geometry.vertices.length - 1;

    }

    uvs = geo.faceVertexUvs[0];

    for (i = 0, il = uvs.length; i < il; i++) {

      var uv = uvs[i],
        uvCopy = [];

      for (var j = 0, jl = uv.length; j < jl; j++) {
        uvCopy.push(new THREE.Vector2(uv[0].x, uv[0].y));
      }

      geometry.faceVertexUvs[0].push(uvCopy);

    }

    geometry.mergeVertices();

    return geometry;

  }

  function imap(v, a, b, c, d) {
    return Math.round(map(v, a, b, c, d));
  }

  function map(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
  }

  function enter() {
    cardboard.scene.visible = true;
    shinysound.audioTexture.play();
  }

  function leave() {
    cardboard.scene.visible = false;
    shinysound.audioTexture.stop();
  }

  function render() {
    cardboard.update();
    shinysound.update();
    cardboard.render();
  }

  function resize() {
    Cardboard.prototype.resize.apply(cardboard, arguments);
  }

  var factory = function(gl, audio, options) {

    return new Promise(function(resolve) {

        cardboard = new Cardboard(gl);
        cardboard.effect.separation = 0.06;
        if (options.deviceOrientation) {
          cardboard.orbitControls.enabled = false;
          cardboard.controls.connect();
        }

        shinysound = new ShinySound(audio, function() {

          resolve({
            enter: enter,
            leave: leave,
            render: render,
            resize: resize
          });

        });

      });

  };

  Demos.register({
    factory: factory,
    slug: 'shinysound',
    preview: '/images/preview/shinysound.jpg'
  });

})();
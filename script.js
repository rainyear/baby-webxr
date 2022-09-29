// Canvas 画布
var canvas = document.getElementById("renderCanvas");
// Babylon 渲染引擎 -> Canvas
var engine = new BABYLON.Engine(canvas, true);

var isQuest = false;
const SHPERE_SIZE = 1.5;

const onRespObservable = new BABYLON.Observable();

var isTriggered = false;

// 创建场景内容
var createScene = async function () {
  // VR 场景（环境） 基于 Babylon 引擎
  var scene = new BABYLON.Scene(engine);
  // 背景色
  scene.clearColor = new BABYLON.Color3.Black();
  // 设置物理引擎
  await Ammo();

  scene.enablePhysics(undefined, new BABYLON.AmmoJSPlugin());
  // scene.debugLayer.show();

  const isHandTrackingFeatureSupported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync("immersive-vr");
  if (!isHandTrackingFeatureSupported){
    alert("Sorry Immersive-VR not support!");
  }

  // 头部 Camera

  /*
  var camera = new BABYLON.FreeCamera("mainCamera", new BABYLON.Vector3(0, 0, 0), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);
  */

  // setupCameraForCollisions(camera);
  // camera.setTarget(target);

  // 环境光
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(1, 1, 0)
  );
  // Skybox
  addSkyBox(scene);

  // 创建物体
  /*
  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: SHPERE_SIZE, segments: 32 }, scene);
  sphere.position = new BABYLON.Vector3(0, SHPERE_SIZE, 0);

  // 设置物理属性
  sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {mass: SHPERE_SIZE});
  */

  const ground = addGround(scene);

  // 创建 XR 体验
  /*
    Default XR Experience 提供：
    - `input`
    - `enterExitUI`
    - `renderTarget`
  */
  const xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground]
  });
  xr.baseExperience.camera.position = new BABYLON.Vector3(0,0,0);



  // Feature Manager - 特性管理
  // https://doc.babylonjs.com/features/featuresDeepDive/webXR/webXRFeaturesManager
  /*
    - Teleportation - 传送
    - Hand joint tracking - 手（关节）追踪
    - Movement - 移动
    - Walking Locomotion 
  */
  // Controller - Point & Grab
  // TODO: https://playground.babylonjs.com/#1FTUSC#37

  // Teleportation
  xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRFeatureName.TELEPORTATION, "stable", {
    xrInput: xr.input,
    floorMeshes:[ground]
  })
  /*
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      console.log(motionController);

      const xr_ids = motionController.getComponentIds();
      let triggerComponent = motionController.getComponent(xr_ids[0]);//xr-standard-trigger
      triggerComponent.onButtonStateChangedObservable.add(() => {
      if (triggerComponent.pressed) {
        console.log("Trigger");
        isTriggered = !isTriggered;
        onRespObservable.notifyObservers();
      }
    });
  });
  });
  */

  // Handtracking
  if (isHandTrackingFeatureSupported && isQuest) {
    const xrHandFeature = xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRFeatureName.HAND_TRACKING, "latest", {
      xrInput: xr.input,
      enablePhysics: true
    });
  }

  // Exps
  fovExp(scene, 5);

  return scene;
};

createScene().then((sceneToRender) => {
  engine.runRenderLoop(() => sceneToRender.render());
});

const addSkyBox = function(scene){
  const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:150}, scene);
  const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
  skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  skybox.material = skyboxMaterial;
}
const addGround = function(scene){
  // 创建地面
  const ground = BABYLON.MeshBuilder.CreateGround("ground", {
    width: 40,
    height: 40,
  });
  // 增加 纹理材质
  /*
  const floorMat = new BABYLON.StandardMaterial("floorMat");
  floorMat.diffuseTexture = new BABYLON.Texture("textures/floor.png");
  floorMat.diffuseTexture.uScale = 5.0;
  floorMat.diffuseTexture.vScale = 5.0;

  ground.material = floorMat;
  */

  ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 });
  return ground;
}

const fovExp = function(scene, distance){
  const H = 15;
  const D = 0.02;
  const FRAME_RATE = 60;
  const State = {
    wait: 0,
    paused: 1,
    animating: 2
  }
  var _state = State.wait;

  const LINE_OPTS = {height: H, diameter: D, updatable: true};

  const mat = new BABYLON.StandardMaterial("line", scene);
  mat.diffuseColor = BABYLON.Color3.Red();

  const vLineLeft = BABYLON.MeshBuilder.CreateCylinder("vLineLeft", LINE_OPTS, scene);
  vLineLeft.material = mat;
  vLineLeft.position.z = distance;
  vLineLeft.position.x = -D;

  const vLineRight = vLineLeft.clone("vLineRight");
  vLineRight.position.x = D;

  const lineAnimation = new BABYLON.Animation("toLeft", "position.x", FRAME_RATE, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  const keyFrames = [];
  keyFrames.push({
    frame: 0,
    value: 0
  });
  keyFrames.push({
    frame: FRAME_RATE * 10,
    value: 10
  })
  lineAnimation.setKeys(keyFrames);
  vLineRight.animations.push(lineAnimation);

  const uiManager = new BABYLON.GUI.GUI3DManager(scene);
  var panel = new BABYLON.GUI.StackPanel3D();
  uiManager.addControl(panel);
  panel.position.z = 3;
  panel.position.y = 1.5;


  var button = new BABYLON.GUI.Button3D("start");
  panel.addControl(button);
  var text = new BABYLON.GUI.TextBlock();
  text.text = '开始测试';
  text.color = "white";
  text.fontSize = 24; 
  button.content = text;

  var resText = new BABYLON.GUI.TextBlock();
  resText.text = '0.00';
  resText.color = "white";
  resText.fontSize = 40; 
 
  var slate = new BABYLON.GUI.HolographicSlate("result");
  slate.title = "FOV";
  slate.minDimensions = new BABYLON.Vector2(0.1, 0.1);
  slate.dimensions = new BABYLON.Vector2(0.5, 0.5);
  slate.titleBarHeight = 0.075;
  slate.content = resText;
  uiManager.addControl(slate);
  slate.position = new BABYLON.Vector3(-1, 1, 1);


  button.onPointerUpObservable.add(()=>{
    var vLineRightAni;
    if (_state == State.wait) {
      vLineRightAni = scene.beginAnimation(vLineRight, 0, FRAME_RATE * 10);
      _state = State.animating;

      onRespObservable.add((s)=>{
        if (s == 'pause') {
          vLineRightAni.pause();
          resText.text = `${vLineRight.position.x.toFixed(2)}`;
        } else {
          vLineRightAni.restart();
        }
      });

    } else if (_state == State.animating) {
      console.log("Pos: ", vLineRight.position.x);
      _state = State.paused;
      onRespObservable.notifyObservers("pause");
    } else if (_state == State.paused) {
      _state = State.animating;
      onRespObservable.notifyObservers("restart");
    };
  });
}
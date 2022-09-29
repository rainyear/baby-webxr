// Canvas 画布
var canvas = document.getElementById("renderCanvas");
// Babylon 渲染引擎 -> Canvas
var engine = new BABYLON.Engine(canvas, true);

var isQuest = false;
const SHPERE_SIZE = 1.5;

// 创建场景内容
var createScene = async function () {
  // VR 场景（环境） 基于 Babylon 引擎
  var scene = new BABYLON.Scene(engine);
  // 背景色
  scene.clearColor = new BABYLON.Color3.Black();
  // 设置物理引擎
  await Ammo();

  scene.enablePhysics(undefined, new BABYLON.AmmoJSPlugin());

  const alpha = Math.PI / 4;
  const beta = Math.PI / 3;
  const radius = 8;
  const target = new BABYLON.Vector3(0, 0, 0);

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



  /*
  const box = BABYLON.MeshBuilder.CreateBox("box", {});
  box.position.x = 0;
  box.position.y = 1/2;

  const boxMaterial = new BABYLON.StandardMaterial("material", scene);
  boxMaterial.diffuseColor = BABYLON.Color3.Random();
  box.material = boxMaterial;

  box.actionManager = new BABYLON.ActionManager(scene);
  box.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPickTrigger,
      function (evt) {
        const sourceBox = evt.meshUnderPointer;
        sourceBox.position.x += 0.1;
        sourceBox.position.y += 0.1;

        boxMaterial.diffuseColor = BABYLON.Color3.Random();
      }
    )
  );
  */
  // 创建地面
  const ground = BABYLON.MeshBuilder.CreateGround("ground", {
    width: 40,
    height: 40,
  });
  // 增加 纹理材质
  const floorMat = new BABYLON.StandardMaterial("floorMat");
  floorMat.diffuseTexture = new BABYLON.Texture("textures/floor.png");
  ground.material = floorMat;

  ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 });

  // 场景中创建默认环境 Default Environment
  // const env = scene.createDefaultEnvironment();

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

  // Handtracking
  if (isHandTrackingFeatureSupported && isQuest) {
    const xrHandFeature = xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRFeatureName.HAND_TRACKING, "latest", {
      xrInput: xr.input,
      enablePhysics: true
    });
  }

  // Exps
  fovExp(scene, 1.5);

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

const fovExp = function(scene, distance){
  const H = 15;
  const D = 0.02;

  const LINE_OPTS = {height: H, diameter: D, updatable: true};

  const mat = new BABYLON.StandardMaterial("line", scene);
  mat.diffuseColor = BABYLON.Color3.Red();

  const vLineLeft = BABYLON.MeshBuilder.CreateCylinder("vLineLeft", LINE_OPTS, scene);
  vLineLeft.material = mat;
  vLineLeft.position.z = distance;
  vLineLeft.position.x = -D;

  const vLineRight = vLineLeft.clone("vLineRight");
  vLineRight.position.x = D;



  /*
  const vLineRight = BABYLON.MeshBuilder.CreateCylinder("cylinder", LINE_OPTS);//vLine.clone("vLineRight");
  vLineRight.material = mat;
  vLineRight.position.x = - D * 2;
  vLineRight.position.z = distance;
  */

  // vLine.position.y = H / 2;
  // vLine.position.x = D;

  // vLineRight.material = mat;
  // vLineRight.x = 1;
}
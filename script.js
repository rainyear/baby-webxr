// Canvas 画布
var canvas = document.getElementById("renderCanvas");
// Babylon 渲染引擎 -> Canvas
var engine = new BABYLON.Engine(canvas, true);

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

  const isHandTrackingFeatureSupported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync("hand-tracking");
  if (!isHandTrackingFeatureSupported){
    alert("Sorry Hand tracking not supported");
  }

  // 头部 Camera
  const camera = new BABYLON.ArcRotateCamera(
    "Camera",
    alpha,
    beta,
    radius,
    target,
    scene
  );
  camera.attachControl(canvas, true);
  // camera.setTarget(target);

  // 环境光
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(1, 1, 0)
  );

  // 创建物体
  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 0.5, segments: 32 }, scene);
  sphere.position.y = 1.1;
  // 设置物理属性
  sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 0.5})



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
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 });

  // 场景中创建默认环境 Default Environment
  const env = scene.createDefaultEnvironment();

  // 创建 XR 体验
  /*
    Default XR Experience 提供：
    - `input`
    - `enterExitUI`
    - `renderTarget`
  */
  const xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [env.ground]
  });

  // Feature Manager - 特性管理
  // https://doc.babylonjs.com/features/featuresDeepDive/webXR/webXRFeaturesManager
  /*
    - Teleportation - 传送
    - Hand joint tracking - 手（关节）追踪
    - Movement - 移动
    - Walking Locomotion 
  */

  if (isHandTrackingFeatureSupported) {
    const xrHandFeature = xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRFeatureName.HAND_TRACKING, "latest", {
      xrInput: xr.input,
      enablePhysics: true
    });
  }
  return scene;
};

createScene().then((sceneToRender) => {
  engine.runRenderLoop(() => sceneToRender.render());
});
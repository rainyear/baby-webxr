// Canvas 画布
var canvas = document.getElementById("renderCanvas");
// Babylon 渲染引擎 -> Canvas
var engine = new BABYLON.Engine(canvas, true);


const createScene = async function(){
    var scene = new BABYLON.Scene(engine);
    enableDebug(scene);

    var gl = new BABYLON.GlowLayer("glow", scene, { 
        mainTextureSamples: 4 
    });

    
    var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, -1), scene);
	light.position = new BABYLON.Vector3(-5, 10, 5);
	light.intensity = 0.5;
    new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(1, 1, 0)
    );
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);

    // TODO: add ground
    const ground = addGround(scene);
    // TODO: add sky
    addSkyBox(scene);
    // TODO: add room
    // await addRoom(scene);
    // TODO: add objects
    // await addObjects(scene, shadowGenerator);

    // TODO: FOV exp
    expFOV(scene, new BABYLON.Vector3(0,0,0), gl);



    var xrHelper = await scene.createDefaultXRExperienceAsync({
        disableTeleportation: true,
        floorMeshes: [ground] /* Array of meshes to be used as landing points */,
    });

    return scene;
}

createScene().then((scene) => {
    engine.runRenderLoop(() => {
        scene.render();
    });
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});
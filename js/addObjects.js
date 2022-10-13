const addObjects = async function(scene, sg){
    const robot = await BABYLON.SceneLoader.ImportMeshAsync("", "scenes/", "security_bot_7.glb", scene);
    const _robot = robot.meshes[0];
    _robot.name = "Obj_Robot";
    _robot.position = new BABYLON.Vector3(-15, 0, 15);
    _robot.rotationQuaternion = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), Math.PI / 6);

    sg.getShadowMap().renderList.push(robot.meshes[4]);
}
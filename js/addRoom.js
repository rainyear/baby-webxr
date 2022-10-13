const addRoom = async function(scene){
    const room = await BABYLON.SceneLoader.ImportMeshAsync("", "scenes/", "stone_stage.glb", scene);
    const _root = room.meshes[0];
    _root.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
    // _root.position.y = -21.5;
}
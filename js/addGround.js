const addGround = function(scene){
    // TODO: Infinite ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {
        width: 40,
        height: 40,
    });
    const floorMat = new BABYLON.StandardMaterial("floorMat");
    floorMat.diffuseTexture = new BABYLON.Texture("textures/wood.jpg");
    floorMat.diffuseTexture.uScale = 10.0;
    floorMat.diffuseTexture.vScale = 10.0;
    // floorMat.diffuseColor = new BABYLON.Color3(.75, .75, .75);
    // floorMat.emissiveColor = BABYLON.Color3.Gray();

    ground.material = floorMat;
    ground.receiveShadows = true;

    return ground;
}
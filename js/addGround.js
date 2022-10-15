const addGround = function(scene){
    // TODO: Infinite ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {
        width: 40,
        height: 40,
    });
    var groundMaterial = new BABYLON.GridMaterial("groundMaterial", scene);
    groundMaterial.majorUnitFrequency = 5;
    groundMaterial.minorUnitVisibility = 0.5;
    groundMaterial.gridRatio = 1;
	// groundMaterial.opacity = 0.9;
    groundMaterial.useMaxLine = true;
    groundMaterial.lineColor = new BABYLON.Color3.Teal();
    groundMaterial.mainColor = new BABYLON.Color3.Black();

    ground.material = groundMaterial;
    ground.receiveShadows = true;

    return ground;
}
const FOV_PREFIX = "EXP_FOV_";
const FRAME_RATE = 60;
const _make_name = (name) => {return "" + FOV_PREFIX + name;}
const State = {
    wait: 0,
    paused: 1,
    animating: 2
}

const addControlSlate = function(scene, leftLine, rightLine){
    var leftAnimation;
    var rightAnimation;
    var _left_state = State.wait;
    var _right_state = State.wait;
    const stateObservable = new BABYLON.Observable();
    const CTR_SIZE = 1;

    console.log("add control slate");
    var manager = new BABYLON.GUI.GUI3DManager(scene);

    const ctrSlate = new BABYLON.GUI.HolographicSlate(_make_name("ctrSlate"));
    manager.addControl(ctrSlate);

    ctrSlate.titleBarHeight = 0;
    ctrSlate.minDimensions = new BABYLON.Vector2(0.1, 0.1);
    ctrSlate.dimensions = new BABYLON.Vector2(CTR_SIZE, CTR_SIZE);
    ctrSlate.position = new BABYLON.Vector3(-1.5, 1.5, 1.5);
    ctrSlate.mesh.rotationQuaternion = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(1, 0, 0), Math.PI / 10);

    var contentGrid = new BABYLON.GUI.Grid(_make_name("grid"));

    var resText = new BABYLON.GUI.TextBlock(_make_name("resText"));
    resText.height = CTR_SIZE / 2;
    resText.color = "white";
    resText.fontSize = "24px";
    resText.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    resText.setPadding("5%", "5%", "5%", "5%");
    resText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    resText.text = "点击下方按钮开始 FOV 测试\n当红色竖线不可见时点击按钮停止"

    contentGrid.addControl(resText);

    var buttonLeft = BABYLON.GUI.Button.CreateSimpleButton(_make_name("leftBtn"), "左侧");
    var buttonRight = BABYLON.GUI.Button.CreateSimpleButton(_make_name("rightBtn"), "右侧");
    buttonLeft.width = CTR_SIZE / 2;
    buttonLeft.height = CTR_SIZE / 5;
    buttonLeft.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    buttonLeft.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    buttonLeft.textBlock.color = "white";
    buttonLeft.textBlock.fontSize = "30px";
    buttonLeft.onPointerUpObservable.add(()=>{
        console.log("Left FOV Start testing...");
        if (_left_state == State.wait){
            leftAnimation = scene.beginAnimation(leftLine, 0, FRAME_RATE * 10);
            _left_state = State.animating;
        } else if(_left_state == State.animating){
            leftAnimation.pause();
            _left_state = State.paused;
        } else {
            _left_state = State.animating;
            leftAnimation.restart();
        }
        stateObservable.notifyObservers();
    });

    buttonRight.width = CTR_SIZE / 2;
    buttonRight.height = CTR_SIZE / 5;
    buttonRight.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    buttonRight.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    buttonRight.textBlock.color = "white";
    buttonRight.textBlock.fontSize = "30px";
    buttonRight.onPointerUpObservable.add(()=>{
        console.log("Right FOV Start testing...");
        if (_right_state == State.wait){
            rightAnimation = scene.beginAnimation(rightLine, 0, FRAME_RATE * 10);
            _right_state = State.animating;
        } else if(_right_state == State.animating){
            rightAnimation.pause();
            _right_state = State.paused;
        } else {
            _right_state = State.animating;
            rightAnimation.restart();
        }
        stateObservable.notifyObservers();
    });

    contentGrid.addControl(buttonLeft);
    contentGrid.addControl(buttonRight);

    var buttonRestart = BABYLON.GUI.Button.CreateSimpleButton(_make_name("resetBtn"), "重置");
    buttonRestart.width = CTR_SIZE;
    buttonRestart.height = CTR_SIZE / 5;
    // buttonRestart.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    buttonRestart.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    buttonRestart.background = "#100";
    buttonRestart.textBlock.color = "white";
    buttonRestart.textBlock.fontSize = "30px";
    buttonRestart.onPointerUpObservable.add(()=>{
        _left_state = State.wait;
        _right_state = State.wait;
        if (leftAnimation) {
            leftAnimation.reset();
        };
        if (rightAnimation) {
            rightAnimation.reset();
        };
        stateObservable.notifyObservers();
    });
    contentGrid.addControl(buttonRestart);

    stateObservable.add(() => {
        switch (_left_state) {
            case State.wait:
                // reset
                buttonLeft.textBlock.text = "左侧";
                buttonLeft.background = undefined;
                break;
            case State.paused:
                var lFOV = Math.atan(Math.abs(leftLine.position.x) / leftLine.position.z) / Math.PI * 180;
                buttonLeft.textBlock.text = `点击继续\nR_FOV=${lFOV.toFixed(2)}`;
                buttonLeft.background = "#010";
                break;
            case State.animating:
                buttonLeft.textBlock.text = "点击停止";
                buttonLeft.background = "#100";
                break;
            default:
                break;
        }
        switch (_right_state) {
            case State.wait:
                // reset
                buttonRight.textBlock.text = "右侧";
                buttonRight.background = undefined;
                break;
            case State.paused:
                var rFOV = Math.atan(rightLine.position.x / rightLine.position.z) / Math.PI * 180;
                buttonRight.textBlock.text = `点击继续\nR_FOV=${rFOV.toFixed(2)}`;
                buttonRight.background = "#010";
                break;
            case State.animating:
                buttonRight.textBlock.text = "点击停止";
                buttonRight.background = "#100";
                break;
            default:
                break;
        }
    })

    // contentGrid.background = "rgba(128,128,128,0.7)";
    ctrSlate.content = contentGrid;
}
const expFOV = function(scene, center, gl) {
    const _C = center.clone();
    const EXP_AREA = {width: 15, height: 15};
    const VLineOpts = {height: 10, diameter: 0.02};

    const expGround = BABYLON.MeshBuilder.CreateGround(_make_name("ground"), EXP_AREA);
    expGround.position = _C.clone();
    expGround.position.y += 0.001;
    const groundMat = new BABYLON.StandardMaterial(_make_name("groundMat"), scene);
    groundMat.diffuseColor = new BABYLON.Color3.White();
    groundMat.alpha = 0.5;
    // groundMat.emissiveColor = BABYLON.Color3.Red();
    expGround.material = groundMat;

    gl.addIncludedOnlyMesh(expGround);


    /*
    const stand = BABYLON.MeshBuilder.CreateDisc("stand", {radius: 0.5}, scene);
    // stand.rotation
    stand.position = _C.clone();
    */


    const vLineLeft = BABYLON.MeshBuilder.CreateCylinder(_make_name("vLL"), VLineOpts);
    vLineLeft.position = _C.clone();
    vLineLeft.position.y = VLineOpts.height / 2;
    vLineLeft.position.z += EXP_AREA.height / 2;
    vLineLeft.position.x += VLineOpts.diameter;

    const lineMat = new BABYLON.StandardMaterial(_make_name("lineMat"), scene);
    lineMat.diffuseColor = BABYLON.Color3.Red();
    lineMat.emissiveColor = BABYLON.Color3.Red();

    vLineLeft.material = lineMat;

    const vLineRight = vLineLeft.clone(_make_name("vLR"));
    // vLineRight.position = vLineLeft.position.clone();
    vLineRight.position.x -= VLineOpts.diameter * 2;

    gl.addIncludedOnlyMesh(vLineLeft);

    const leftLineAnimation = new BABYLON.Animation(_make_name("lla"), "position.x", FRAME_RATE, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keyFrames = [];
    keyFrames.push({
        frame: 0,
        value: 0
    });
    keyFrames.push({
        frame: FRAME_RATE * 10,
        value: -10
    });
    leftLineAnimation.setKeys(keyFrames);
    vLineLeft.animations.push(leftLineAnimation);

    const rightLineAnimation = new BABYLON.Animation(_make_name("rla"), "position.x", FRAME_RATE, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keyFramesRight = [];
    keyFramesRight.push({
        frame: 0,
        value: 0
    });
    keyFramesRight.push({
        frame: FRAME_RATE * 10,
        value: 10
    });
    rightLineAnimation.setKeys(keyFramesRight);
    vLineRight.animations.push(rightLineAnimation);

    addControlSlate(scene, vLineLeft, vLineRight);
}

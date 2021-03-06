/**
 * Created by mitchcout on 2/27/2017.
 */
var gl;
var glCanvas;
var persProjMat, viewMat, bbCF;
var axisBuff, tmpMat, normalMat;
var globalAxes;
var lightCF;

var globalX, globalY, globalZ;

/* Vertex shader attribute variables */
var posAttr, colAttr, normalAttr;

/* Shader uniform variables */
var projUnif, viewUnif, modelUnif, lightPosUnif1, lightPosUnif2;
var objAmbientUnif, normalUnif, isEnabledUnif;
var objTintUnif, ambCoeffUnif, diffCoeffUnif, specCoeffUnif, shininessUnif;
var lightPos1, lightPos2, useLightingUnif;
var lineBuff, normBuff, objTint, pointLight;
var shaderProg, redrawNeeded, showLight1, showLight2;
var lightingComponentEnabled = [true, true, true];

const IDENTITY = mat4.create();
var BBScaleTransformation, HutScaleTransformation, RockScaleTransformation;
var bbTranslation;
var hut1Transformation,hut2Transformation,hut3Transformation,hut4Transformation;
var movingLeft, movingRight, movingUp, movingDown;
var rotateX, rotateY, rotateZ;
var currentObject;
var coneSpinAngle;
var obj, obj2, hut1, hut2, hut3, hut4, ground, sky;
var rockArray = [];
var rockTransformationsArray = [];

function main() {
    glCanvas = document.getElementById("gl-canvas");

    /*lighting*/
    let light1CheckBox = document.getElementById("light1");
    light1CheckBox.addEventListener('change', ev => {
        lightingComponentEnabled[0] = ev.target.checked;
        gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
        redrawNeeded = true;
    }, false);
    let light2CheckBox = document.getElementById("light2");
    light2CheckBox.addEventListener('change', ev => {
        lightingComponentEnabled[1] = ev.target.checked;
        gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
        redrawNeeded = true;
    }, false);

    /*objects*/
    gl = WebGLUtils.setupWebGL(glCanvas, null);
    axisBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBuff);
    window.addEventListener("keyup", keyboardUpHandler, false);
    window.addEventListener("keydown", keyboardDownHandler, false);
    window.addEventListener("keypress", keyboardSceneHandler, false);
    ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
        .then (prog => {
            shaderProg = prog;
            gl.useProgram(prog);
            gl.clearColor(0, 0, 0, 1);
            gl.enable(gl.DEPTH_TEST);    /* enable hidden surface removal */
            //gl.enable(gl.CULL_FACE);     /* cull back facing polygons */
            //gl.cullFace(gl.BACK);
            lineBuff = gl.createBuffer();
            normBuff = gl.createBuffer();
            posAttr = gl.getAttribLocation(prog, "vertexPos");
            colAttr = gl.getAttribLocation(prog, "vertexCol");
            normalAttr = gl.getAttribLocation(prog, "vertexNormal");
            lightPosUnif1 = gl.getUniformLocation(prog, "lightPosWorld1");
            lightPosUnif2 = gl.getUniformLocation(prog, "lightPosWorld2");
            projUnif = gl.getUniformLocation(prog, "projection");
            viewUnif = gl.getUniformLocation(prog, "view");
            modelUnif = gl.getUniformLocation(prog, "modelCF");
            normalUnif = gl.getUniformLocation(prog, "normalMat");
            useLightingUnif = gl.getUniformLocation (prog, "useLighting");
            objTintUnif = gl.getUniformLocation(prog, "objectTint");
            ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
            diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
            specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
            shininessUnif = gl.getUniformLocation(prog, "shininess");
            isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");
            gl.enableVertexAttribArray(posAttr);
            gl.enableVertexAttribArray(colAttr);
            // gl.enableVertexAttribArray(normalAttr);

            persProjMat = mat4.create();
            viewMat = mat4.create();
            normalMat = mat3.create();
            lightCF = mat4.create();
            bbCF = mat4.create();
            tmpMat = mat4.create();
            bbTranslation = mat4.create();
            this.bb8BodyCF = mat4.create();
            this.bb8HeadCF = mat4.create();
            this.bb6BodyCF = mat4.create();
            this.bb6HeadCF = mat4.create();
            hut1Transformation = mat4.create();
            hut2Transformation = mat4.create();
            hut3Transformation = mat4.create();
            hut4Transformation = mat4.create();
            setPerspective();

            movingLeft = false;
            movingRight = false;
            movingUp = false;
            movingDown = false;
            rotateX = false;
            rotateY = false;
            rotateZ = false;
            updateObject();

            /* light Position */
            lightPos1 = vec3.fromValues(-3, -3, 4);
            gl.uniform3fv (lightPosUnif1, lightPos1);

            lightPos2 = vec3.fromValues(4, 4, 1);
            gl.uniform3fv (lightPosUnif2, lightPos2);

            BBScaleTransformation = mat4.create();
            let bbScale = vec3.fromValues(0.5,0.5,0.5);
            mat4.scale(BBScaleTransformation,BBScaleTransformation,bbScale);
            HutScaleTransformation = mat4.create();
            let hutScale = vec3.fromValues(1.5,1.5,1.5);
            mat4.scale(HutScaleTransformation,HutScaleTransformation,hutScale);
            RockScaleTransformation = mat4.create();
            let rockScale = vec3.fromValues(0.2,0.2,0.2);
            mat4.scale(RockScaleTransformation,RockScaleTransformation,rockScale);

            /* define colors */
            let orange = vec3.fromValues(255/255,128/255,0/255);
            let blue = vec3.fromValues(0/255,93/255,255/255);
            let yellow = vec3.fromValues (0xe7/255, 0xf2/255, 0x4d/255);

            /* define objects */
            gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
            ground = new Ground(gl, prog);
            sky = new Sky(gl);

            obj = new BB8(gl, prog, 0.5, orange);
            obj.updateCoorFrames(BBScaleTransformation);

            obj2 = new BB8(gl, prog, 0.3, blue);
            this.obj2StartingPosition = mat4.create();
            let offset = vec3.fromValues (1.5, 1.0, 0);
            mat4.translate(this.obj2StartingPosition, this.obj2StartingPosition, offset);
            obj2.updateCoorFrames(this.obj2StartingPosition);
            obj2.updateCoorFrames(BBScaleTransformation);

            hut1 = new Hut(gl, prog);
            let offsethut1 = vec3.fromValues (1.5, -3, 0);
            mat4.translate(hut1Transformation, hut1Transformation, offsethut1);
            mat4.rotateZ(hut1Transformation,hut1Transformation,Math.PI/5);
            mat4.mul(hut1Transformation,hut1Transformation,HutScaleTransformation);

            hut2 = new Hut(gl, prog);
            let offsethut2 = vec3.fromValues (2.75, -1.75, 0);
            mat4.translate(hut2Transformation, hut2Transformation, offsethut2);
            mat4.rotateZ(hut2Transformation,hut2Transformation,Math.PI/4);
            mat4.mul(hut2Transformation,hut2Transformation,HutScaleTransformation);

            hut3 = new Hut(gl, prog);
            let offsethut3 = vec3.fromValues (-2.5, 3, 0);
            mat4.translate(hut3Transformation, hut3Transformation, offsethut3);
            mat4.rotateZ(hut3Transformation,hut3Transformation,Math.PI*1.25);
            mat4.mul(hut3Transformation,hut3Transformation,HutScaleTransformation);

            hut4 = new Hut(gl, prog);
            let offsethut4 = vec3.fromValues (-3, -1.75, 0);
            mat4.translate(hut4Transformation, hut4Transformation, offsethut4);
            mat4.rotateZ(hut4Transformation,hut4Transformation,-Math.PI/4);
            mat4.mul(hut4Transformation,hut4Transformation,HutScaleTransformation);

            randomizeRocks(prog);

            pointLight = new UniSphere(gl, prog, 0.03, 3, yellow, yellow);

            globalAxes = new Axes(gl, prog);
            coneSpinAngle = 0;
            // resizeWindow();
            render();
        });
}

function setPerspective() {
    globalX = document.getElementById("global-X").valueAsNumber;
    globalY = document.getElementById("global-Y").valueAsNumber;
    globalZ = document.getElementById("global-Z").valueAsNumber;
    mat4.lookAt(viewMat,
        // vec3.fromValues(0, 3, 2), /* eye */good
        vec3.fromValues(globalX*(2+(1-Math.abs(globalY))), globalY*(2+(1-Math.abs(globalX))), globalZ*2), /* eye */
        vec3.fromValues(0, 0, 0), /* focal point */
        vec3.fromValues(0, 0, 1)); /* up */
    gl.uniformMatrix4fv(modelUnif, false, bbCF);
}

function setPerspectiveFromValues(x,y,z) {
    //set sliders to new values
    document.getElementById("global-X").value = x;
    document.getElementById("global-Y").value = y;
    document.getElementById("global-Z").value = z;

    //update perspective
    globalX = x;
    globalY = y;
    globalZ = z;
    mat4.lookAt(viewMat,
        vec3.fromValues(globalX*(2+(1-Math.abs(globalY))), globalY*(2+(1-Math.abs(globalX))), globalZ*2), /* eye */
        vec3.fromValues(0, 0, 0), /* focal point */
        vec3.fromValues(0, 0, 1)); /* up */
    gl.uniformMatrix4fv(modelUnif, false, bbCF);
}

function updateObject(){
    currentObject = document.getElementById("objects").value;
}

function resizeWindow() {
    //resize window
    let width = 0.99 * window.innerWidth;
    let height = 0.74 * window.innerHeight;
    glCanvas.width = width;
    glCanvas.height = height;
    //set perspective
    mat4.perspective(persProjMat,
        Math.PI/3,   /* 60 degrees vertical field of view */
        width/height,/* must be width/height ratio */
        1,           /* near plane at Z=1 */
        20);
}

function render() {
    resizeWindow();
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    draw3D();
    requestAnimationFrame(render);
}

function drawScene() {
    gl.uniform1i (useLightingUnif, false);
    gl.disableVertexAttribArray(normalAttr);
    gl.enableVertexAttribArray(colAttr);

    gl.uniform1i (useLightingUnif, true);
    gl.disableVertexAttribArray(colAttr);
    gl.enableVertexAttribArray(normalAttr);
    ground.draw(posAttr, normalAttr, modelUnif, IDENTITY);

    gl.uniform1i (useLightingUnif, false);
    gl.disableVertexAttribArray(normalAttr);
    gl.enableVertexAttribArray(colAttr);

    // ground.drawNormal(posAttr, colAttr, modelUnif, IDENTITY);
    // ground.drawVectorsTo(gl, lightPos1, posAttr, colAttr, modelUnif, IDENTITY);

    sky.draw(posAttr, colAttr, modelUnif, IDENTITY);
    // globalAxes.draw(posAttr, colAttr, modelUnif, IDENTITY);

    if (typeof hut1 !== 'undefined') {
        checkIfRotateHut(1);
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        hut1.draw(posAttr, normalAttr, modelUnif, hut1Transformation);
    }
    if (typeof hut2 !== 'undefined') {
        checkIfRotateHut(2);
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        hut2.draw(posAttr, normalAttr, modelUnif, hut2Transformation);
    }
    if (typeof hut3 !== 'undefined') {
        checkIfRotateHut(3);
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        hut3.draw(posAttr, normalAttr, modelUnif, hut3Transformation);
    }
    if (typeof hut4 !== 'undefined') {
        checkIfRotateHut(4);
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        hut4.draw(posAttr, normalAttr, modelUnif, hut4Transformation);
    }
    gl.uniform1i (useLightingUnif, true);
    gl.disableVertexAttribArray(colAttr);
    gl.enableVertexAttribArray(normalAttr);
    for(let i = 0; i < rockArray.length; i++){
        rockArray[i].draw(posAttr, normalAttr, modelUnif, rockTransformationsArray[i]);
    }
    if (typeof obj !== 'undefined') {
        checkIfMoveBB(1);
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        obj.draw(posAttr, normalAttr, modelUnif, IDENTITY, viewMat);
    }
    if (typeof obj2 !== 'undefined') {
        checkIfMoveBB(2);
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        obj2.draw(posAttr, normalAttr, modelUnif, IDENTITY, viewMat);
    }

}

function draw3D() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, persProjMat);
    gl.uniformMatrix4fv(viewUnif, false, viewMat)
    mat4.mul (tmpMat, viewMat, IDENTITY);
    mat3.normalFromMat4 (normalMat, tmpMat);
    gl.uniformMatrix3fv (normalUnif, false, normalMat);
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    drawScene();
}

function randomizeRocks(prog) {
    let size = 8;

    for(let i = 0; i < size; i++){
        let rockSize = (Math.random() * 0.6)+0.2;
        rockArray[i] = new RockType1(gl, prog, rockSize);
    }
    for(let i = 0; i < size; i++) {
        rockTransformationsArray[i] = mat4.create();
        let angle = Math.PI*(Math.random() * 2);
        mat4.rotateZ(rockTransformationsArray[i],rockTransformationsArray[i],angle);
        let position = vec3.fromValues((Math.random() * 4)-2,(Math.random() * 4)-2,0);
        mat4.translate(rockTransformationsArray[i],rockTransformationsArray[i],position);
        mat4.mul(rockTransformationsArray[i],rockTransformationsArray[i],RockScaleTransformation);
    }
}

function keyboardSceneHandler(event) {
    switch (event.key) {
        case "1": //scene 1
            setPerspectiveFromValues(-0.25, 1, 0.5);
            break;
        case "2": //scene 2
            setPerspectiveFromValues(1, -1, 2);
            break;
        case "3": //scene 3
            setPerspectiveFromValues(0.45, 0.8, 0.2);
            break;
        case "4": //scene 4
            setPerspectiveFromValues(-0.75, 0.55, 1.15);
            break;
    }
}

function keyboardDownHandler(event) {
    switch (event.key) {
        case "d":
            movingRight = true;
            break;
        case "a":
            movingLeft = true;
            break;
        case "w":
            movingUp = true;
            break;
        case "s":
            movingDown = true;
            break;
        case "z":
            rotateZ = true;
            break;
        case "x":
            rotateX = true;
            break;
        case "y":
            rotateY = true;
            break;
    }
    updateObjectMovement();
}

function keyboardUpHandler(event) {
    switch (event.key) {
        case "d":
            movingRight = false;
            break;
        case "a":
            movingLeft = false;
            break;
        case "w":
            movingUp = false;
            break;
        case "s":
            movingDown = false;
            break;
        case "z":
            rotateZ = false;
            break;
        case "x":
            rotateX = false;
            break;
        case "y":
            rotateY = false;
            break;
    }
    updateObjectMovement();
}

function updateObjectMovement() {
    if(currentObject === "bb8")
        obj.updateMovingDirection(movingLeft, movingRight, movingUp, movingDown);
    else if(currentObject === "bb6")
        obj2.updateMovingDirection(movingLeft, movingRight, movingUp, movingDown);
}

function checkIfMoveBB(num) {
    if(num == 1){
        if(currentObject === "bb8"){
            let increment = obj.getRadius() * 0.03;
            let transformation = mat4.create();
            let x = 0, y = 0;
            if(movingLeft){
                x += increment;
            }
            if(movingRight){
                x += -increment;
            }
            if(movingUp){
                y += -increment;
            }
            if(movingDown){
                y += increment;
            }
            let positionChange = vec3.fromValues(x,y,0);
            mat4.translate(transformation,transformation,positionChange);
            obj.updateCoorFrames(transformation);
        }
    }else if(num == 2){
        if(currentObject === "bb6"){
            let increment = obj2.getRadius() * 0.03;
            let transformation = mat4.create();
            let x = 0, y = 0;
            if(movingLeft){
                x += increment;
            }
            if(movingRight){
                x += -increment;
            }
            if(movingUp){
                y += -increment;
            }
            if(movingDown){
                y += increment;
            }
            let positionChange = vec3.fromValues(x,y,0);
            mat4.translate(transformation,transformation,positionChange);
            obj2.updateCoorFrames(transformation);
        }
    }
}

function checkIfRotateHut(num) {
    if(num == 1){
        if(currentObject === "hut1") {
            if (rotateZ)
                mat4.rotateZ(hut1Transformation, hut1Transformation, Math.PI / 90);
            if (rotateX)
                mat4.rotateX(hut1Transformation, hut1Transformation, Math.PI / 90);
            if (rotateY)
                mat4.rotateY(hut1Transformation, hut1Transformation, Math.PI / 90);
        }
    }else if(num == 2){
        if(currentObject === "hut2") {
            if (rotateZ)
                mat4.rotateZ(hut2Transformation, hut2Transformation, Math.PI / 90);
            if (rotateX)
                mat4.rotateX(hut2Transformation, hut2Transformation, Math.PI / 90);
            if (rotateY)
                mat4.rotateY(hut2Transformation, hut2Transformation, Math.PI / 90);
        }
    }else if(num == 3){
        if(currentObject === "hut3") {
            if (rotateZ)
                mat4.rotateZ(hut3Transformation, hut3Transformation, Math.PI / 90);
            if (rotateX)
                mat4.rotateX(hut3Transformation, hut3Transformation, Math.PI / 90);
            if (rotateY)
                mat4.rotateY(hut3Transformation, hut3Transformation, Math.PI / 90);
        }
    }else if(num == 4){
        if(currentObject === "hut4") {
            if (rotateZ)
                mat4.rotateZ(hut4Transformation, hut4Transformation, Math.PI / 90);
            if (rotateX)
                mat4.rotateX(hut4Transformation, hut4Transformation, Math.PI / 90);
            if (rotateY)
                mat4.rotateY(hut4Transformation, hut4Transformation, Math.PI / 90);
        }
    }
}
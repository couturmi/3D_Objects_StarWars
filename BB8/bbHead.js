/**
 * Created by mitchcout on 2/27/2017.
 */
class bbHead {
    constructor(gl, prog, zOffset, color) {
        let z = zOffset;
        let headRadius = 0.27;

        //define colors
        let mainColor = vec3.fromValues(250/255,240/255,230/255);
        let botSectionColor = vec3.fromValues(200/255,200/255,200/255);
        let midSectionColor = vec3.fromValues(175/255,175/255,175/255);
        let antennaColor = vec3.fromValues(230/255,225/255,210/255);
        let black = vec3.fromValues(0,0,0);
        let uniqueColor = color;

        //define objects
        this.headBotSection = new Cylinder(gl, prog, headRadius, headRadius*0.75, 0.06, 100, botSectionColor, botSectionColor);
        this.headMidSection = new Cylinder(gl, prog, headRadius, headRadius, 0.03, 100, midSectionColor, midSectionColor);
        this.headTopSection = new Hemisphere(gl, prog, headRadius, 28, mainColor, mainColor);
        this.eyeRing1 = new Ring(gl, prog, 0.075, 0.05, 0.05, 20, 1, black, black);
        this.eyeRing2 = new Ring(gl, prog, 0.03, 0.02, 0.025, 20, 1, black, black);
        this.eye1;
        this.eye2;
        this.antenna1 = new Cylinder(gl, prog, 0.01, 0.01, headRadius, 20, antennaColor, antennaColor);
        this.antenna2 = new Cylinder(gl, prog, 0.01, 0.01, headRadius/2, 20, antennaColor, antennaColor);

        //define tranformations
        z -= (z*0.04);

        this.headBotTransform = mat4.create();
        z += (this.headBotSection.getHeight()/2);
        let headBotHeight = vec3.fromValues (0, 0, z);
        z += (this.headBotSection.getHeight()/2);
        mat4.translate(this.headBotTransform, this.headBotTransform, headBotHeight);

        this.headMidTransform = mat4.create();
        z += (this.headMidSection.getHeight()/2);
        let headMidHeight = vec3.fromValues (0, 0, z);
        z += (this.headMidSection.getHeight()/2);
        mat4.translate(this.headMidTransform, this.headMidTransform, headMidHeight);

        this.headTopTransform = mat4.create();
        let headTopHeight = vec3.fromValues (0, 0, z);
        mat4.translate(this.headTopTransform, this.headTopTransform, headTopHeight);

        this.eyeRing1Transform = mat4.create();
        let eyeRing1Location = vec3.fromValues (0, headRadius*0.8, z+(headRadius/2));
        mat4.translate(this.eyeRing1Transform, this.eyeRing1Transform, eyeRing1Location);
        mat4.rotateX(this.eyeRing1Transform, this.eyeRing1Transform, Math.PI/2*1.3);
        this.eyeRing2Transform = mat4.create();
        let eyeRing2Location = vec3.fromValues (-headRadius*0.66, headRadius*0.66, z+(headRadius/3));
        mat4.translate(this.eyeRing2Transform, this.eyeRing2Transform, eyeRing2Location);
        mat4.rotateX(this.eyeRing2Transform, this.eyeRing2Transform, Math.PI/2*1.23);
        mat4.rotateY(this.eyeRing2Transform, this.eyeRing2Transform, Math.PI/4);

        this.antenna1Transform = mat4.create();
        let antenna1Location = vec3.fromValues (-0.03, 0, z+headRadius);
        mat4.translate(this.antenna1Transform, this.antenna1Transform, antenna1Location);
        this.antenna2Transform = mat4.create();
        let antenna2Location = vec3.fromValues (0.03, 0, z+headRadius);
        mat4.translate(this.antenna2Transform, this.antenna2Transform, antenna2Location);

        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.headBotTransform);
        this.headBotSection.draw(vertexAttr, colorAttr, modelUniform, this.tmp, 0.7, 15);

        mat4.mul (this.tmp, coordFrame, this.headMidTransform);
        this.headMidSection.draw(vertexAttr, colorAttr, modelUniform, this.tmp, 0.7, 15);

        mat4.mul (this.tmp, coordFrame, this.headTopTransform);
        this.headTopSection.draw(vertexAttr, colorAttr, modelUniform, this.tmp, 0.6, 10);

        mat4.mul (this.tmp, coordFrame, this.eyeRing1Transform);
        this.eyeRing1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.eyeRing2Transform);
        this.eyeRing2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.antenna1Transform);
        this.antenna1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
        mat4.mul (this.tmp, coordFrame, this.antenna2Transform);
        this.antenna2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }

}
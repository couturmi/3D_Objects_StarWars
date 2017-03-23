/**
 * Created by mitchcout on 3/5/2017.
 */
class Hut {
    constructor(gl, prog) {
        let domeRadius = 0.4;

        //define colors
        let hutColor = vec3.fromValues (186/255,188/255,133/255);

        //define objects
        this.domeTop = new Hemisphere(gl, prog, domeRadius, 28, hutColor, hutColor);
        this.domeBottom = new Cylinder(gl, prog, domeRadius, domeRadius*1.1, domeRadius/2, 100, hutColor, hutColor);
        this.doorwayTop = new RingHalf(gl, prog, domeRadius/3, domeRadius/3-0.05, 0.3, 20, 1, hutColor, hutColor);
        this.doorwayRight = new Cube(gl, prog, 0.05, 1, hutColor, hutColor, hutColor);
        this.doorwayLeft = new Cube(gl, prog, 0.05, 1, hutColor, hutColor, hutColor);

        //define tranformations
        this.domeTopTransformation = mat4.create();
        let domeTopHeightOffset = vec3.fromValues (0, 0, domeRadius/2);
        mat4.translate(this.domeTopTransformation, this.domeTopTransformation, domeTopHeightOffset);

        this.domeBotTransformation = mat4.create();
        let domeBotHeightOffset = vec3.fromValues (0, 0, domeRadius/4);
        mat4.translate(this.domeBotTransformation, this.domeBotTransformation, domeBotHeightOffset);

        this.doorwayTopTransformation = mat4.create();
        let doorwayTopHeightOffset = vec3.fromValues (0, 0.5, domeRadius/3);
        mat4.translate(this.doorwayTopTransformation, this.doorwayTopTransformation, doorwayTopHeightOffset);
        mat4.rotateX(this.doorwayTopTransformation, this.doorwayTopTransformation, Math.PI/2);

        this.doorwayRightTransformation = mat4.create();
        let doorwayRightHeightOffset = vec3.fromValues (0.3/2-0.040, 0.5, domeRadius/6);
        mat4.translate(this.doorwayRightTransformation, this.doorwayRightTransformation, doorwayRightHeightOffset);
        let doorwayScaling = vec3.fromValues (1, 0.3/0.05, (domeRadius/3)/0.05);
        mat4.scale(this.doorwayRightTransformation, this.doorwayRightTransformation, doorwayScaling);

        this.doorwayLeftTransformation = mat4.create();
        let doorwayLeftHeightOffset = vec3.fromValues (-0.3/2+0.040, 0.5, domeRadius/6);
        mat4.translate(this.doorwayLeftTransformation, this.doorwayLeftTransformation, doorwayLeftHeightOffset);
        mat4.scale(this.doorwayLeftTransformation, this.doorwayLeftTransformation, doorwayScaling);

        this.tmp = mat4.create();
    }

    draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.domeBotTransformation);
        this.domeBottom.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.domeTopTransformation);
        this.domeTop.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.doorwayTopTransformation);
        this.doorwayTop.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.doorwayRightTransformation);
        this.doorwayRight.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.doorwayLeftTransformation);
        this.doorwayLeft.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}
/**
 * Created by mitchcout on 3/5/2017.
 */
class RockType1 {
    constructor(gl, size) {
        //define colors
        let rockColor = vec3.fromValues (101/255,102/255,92/255);

        //define objects
        this.part1 = new Cylinder(gl, size*0.6, size*0.7, size*0.3, 15, rockColor, rockColor);
        this.part2 = new Cylinder(gl, size*0.4, size*0.6, size*0.1, 15, rockColor, rockColor);
        this.part3 = new Cylinder(gl, size*0.3, size*0.4, size*0.5, 15, rockColor, rockColor);
        this.part4 = new Cylinder(gl, size*0.2, size*0.5, size*0.2, 15, rockColor, rockColor);

        //define tranformations
        this.part1Transformation = mat4.create();
        let part1Height = vec3.fromValues (0, 0, size*0.15);
        mat4.translate(this.part1Transformation, this.part1Transformation, part1Height);

        this.part2Transformation = mat4.create();
        let part2Height = vec3.fromValues (0, 0, size*0.3+size*0.05);
        mat4.translate(this.part2Transformation, this.part2Transformation, part2Height);

        this.part3Transformation = mat4.create();
        let part3Height = vec3.fromValues (0, size*0.4, size*0.5/2);
        mat4.translate(this.part3Transformation, this.part3Transformation, part3Height);

        this.part4Transformation = mat4.create();
        let part4Height = vec3.fromValues (-size*0.1, -size*0.5, size*0.2/2);
        mat4.translate(this.part4Transformation, this.part4Transformation, part4Height);

        this.tmp = mat4.create();
    }

    draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.part1Transformation);
        this.part1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.part2Transformation);
        this.part2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.part3Transformation);
        this.part3.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.part4Transformation);
        this.part4.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}
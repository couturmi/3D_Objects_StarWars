/**
 * Created by mitchcout on 2/27/2017.
 */
class bbBottom {
    constructor(gl, prog, radius, color) {
        this.radius = radius;

        //define colors
        let bodyColor = vec3.fromValues(250/255,240/255,230/255);
        let uniqueColor = color;

        //define objects
        this.body = new UniSphere(gl, prog, this.radius, 6, bodyColor, bodyColor);
        this.rings1 = new BodyRings(gl, prog, this.radius+0.005, uniqueColor);
        this.rings2 = new BodyRings(gl, prog, this.radius+0.005, uniqueColor);
        this.rings3 = new BodyRings(gl, prog, this.radius+0.005, uniqueColor);

        //define tranformations
        // this.bodyTransform = mat4.create();
        // let bodyHeight = vec3.fromValues (0, 0, this.body.getRadius());
        // mat4.translate(this.bodyTransform, this.bodyTransform, bodyHeight);

        this.ringsTransform1 = mat4.create();
        // mat4.translate(this.ringsTransform1, this.ringsTransform1, bodyHeight);
        mat4.rotateZ(this.ringsTransform1, this.ringsTransform1, Math.PI/4);
        mat4.rotateY(this.ringsTransform1, this.ringsTransform1, Math.PI/4+Math.PI/2);


        this.ringsTransform2 = mat4.create();
        // mat4.translate(this.ringsTransform2, this.ringsTransform2, bodyHeight);
        mat4.rotateZ(this.ringsTransform2, this.ringsTransform2, Math.PI/4);
        mat4.rotateX(this.ringsTransform2, this.ringsTransform2, Math.PI/2);

        this.ringsTransform3 = mat4.create();
        // mat4.translate(this.ringsTransform3, this.ringsTransform3, bodyHeight);
        mat4.rotateZ(this.ringsTransform3, this.ringsTransform3, Math.PI/4);
        mat4.rotateY(this.ringsTransform3, this.ringsTransform3, Math.PI/4);

        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {

        // mat4.mul (this.tmp, coordFrame, this.bodyTransform);
        this.body.draw(vertexAttr, colorAttr, modelUniform, coordFrame);

        mat4.mul (this.tmp, coordFrame, this.ringsTransform1);
        this.rings1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.ringsTransform2);
        this.rings2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.ringsTransform3);
        this.rings3.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }

    getRadius() {
        return this.radius;
    }
}

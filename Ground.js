/**
 * Created by mitchcout on 2/27/2017.
 */
class Ground extends GeometricObject {
    constructor (gl, prog) {
        super(gl);
        objTintUnif = gl.getUniformLocation(prog, "objectTint");
        ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
        diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
        specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
        shininessUnif = gl.getUniformLocation(prog, "shininess");
        isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");

        let width = 10;
        let radius = width / 2;

        //ground
        /* calculate the tangent vectors */
        let n1 = vec3.create();
        let n2 = vec3.create();
        let norm = vec3.create();
        vec3.set (n1, -Math.sin(Math.PI/2), Math.cos(Math.PI/2), 0);
        vec3.set (n2, -Math.sin(Math.PI/2) * Math.cos(Math.PI/2),
            -Math.sin(Math.PI/2) * Math.sin(Math.PI/2),
            Math.cos(Math.PI/2));
        /* n1 is tangent along major circle, n2 is tangent along the minor circle */
        vec3.cross (norm, n1, n2);
        vec3.normalize(norm, norm);
        // console.log(norm[0]+" , "+norm[1]+" , "+norm[2]);
        this.vertices = [
            radius, radius, 0, 0.2, 0.2, 1,
            radius, -radius, 0, 0.2, -0.2, 1,
            -radius, radius, 0, -0.2, 0.2, 1,
            -radius, -radius, 0, -0.2, -0.2, 1
        ];

        this.normalCount = 16;

        let normalLines = [];
        normalLines.push(radius, radius, 0, 1, 1, 1);  /* (x,y,z)   (r,g,b) */
        normalLines.push (
            radius,
            radius,
            0.5, 1, 1, 1);
        normalLines.push(radius, -radius, 0, 1, 1, 1);  /* (x,y,z)   (r,g,b) */
        normalLines.push (
            radius,
            -radius,
            0.5, 1, 1, 1);
        normalLines.push(-radius, radius, 0, 1, 1, 1);  /* (x,y,z)   (r,g,b) */
        normalLines.push (
            -radius,
            radius,
            0.5, 1, 1, 1);
        normalLines.push(-radius, -radius, 0, 1, 1, 1);  /* (x,y,z)   (r,g,b) */
        normalLines.push (
            -radius,
            -radius,
            0.5, 1, 1, 1);

        this.vbuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(this.vertices), gl.STATIC_DRAW);

        this.nbuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(normalLines), gl.STATIC_DRAW);

        let index = [0,1,2,3];

        this.indexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(index), gl.STATIC_DRAW);

        this.indices = [];
        this.indices.push({"primitive": gl.TRIANGLE_STRIP, "buffer": this.indexBuff, "numPoints": index.length});
    }

    draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
        gl.uniform3fv(objTintUnif, vec3.fromValues(214/255,216/255,162/255));
        gl.uniform1f(ambCoeffUnif, 0.35);
        gl.uniform1f(diffCoeffUnif, 0.75);
        gl.uniform1f(specCoeffUnif, 0.0);
        gl.uniform1f(shininessUnif, 100);

        /* copy the coordinate frame matrix to the uniform memory in shader */
        gl.uniformMatrix4fv(modelUniform, false, coordFrame);
        /* binder the (vertex+color) buffer */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);

        /* with the "packed layout"  (x,y,z,r,g,b),
         the stride distance between one group to the next is 24 bytes */
        gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0); /* (x,y,z) begins at offset 0 */
        gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12); /* (r,g,b) begins at offset 12 */

        for (let k = 0; k < this.indices.length; k++) {
            let obj = this.indices[k];
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
        }
    }

}
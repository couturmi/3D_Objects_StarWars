/**
 * Created by mitchcout on 3/5/2017.
 */
class RingHalf {

    constructor (gl, prog, outRadius, inRadius, height, radialDiv, verticalDiv, col1, col2) {
        objTintUnif = gl.getUniformLocation(prog, "objectTint");
        ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
        diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
        specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
        shininessUnif = gl.getUniformLocation(prog, "shininess");
        isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");

        /* if colors are undefined, generate random colors */
        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        let randColor = vec3.create();
        vec3.lerp(randColor, col1, col2, Math.random());
        this.color = randColor;
        let vertices = [];

        let n1 = vec3.create();
        let n2 = vec3.create();
        let norm = vec3.create();
        for (let s = 0; s <= verticalDiv; s++) {
            let h = height/2 - s * height / (verticalDiv);
            for (let k = 0; k <= radialDiv/2; k++) {
                let angle = k * 2 * Math.PI / radialDiv;
                let x = outRadius * Math.cos(angle);
                let y = outRadius * Math.sin(angle);

                /* the first three floats are 3D (x,y,z) position */
                vertices.push(x, y, h);
                /* the next three floats are vertex normal */
                vertices.push (x, y, 0);
            }
            for (let k = 0; k <= radialDiv/2; k++) {
                let angle = k * 2 * Math.PI / radialDiv;
                let x = inRadius * Math.cos(angle);
                let y = inRadius * Math.sin(angle);

                /* the first three floats are 3D (x,y,z) position */
                vertices.push(x, y, h);
                /* the next three floats are vertex normal */
                vertices.push (-x, -y, 0);
            }
        }

        /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
        this.vbuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

        var index;

        this.indices = [];
        /* outer shell */
        for (let s = 0; s < verticalDiv; s++) {
            index = [];
            let start = s * 2 * (radialDiv/2+1);
            for (let k = 0; k < (radialDiv/2+1); k++) {
                index.push(start + k, start + k + 2 * (radialDiv/2+1));
            }
            let buff = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(index), gl.STATIC_DRAW);
            this.indices.push({primitive: gl.TRIANGLE_STRIP, buffer: buff, numPoints: index.length});
        }

        /* inner shell */
        for (let s = 0; s < verticalDiv; s++) {
            index = [];
            let start = (2 * s + 1) * (radialDiv/2+1);
            for (let k = 0; k < (radialDiv/2+1); k++) {
                index.push(start + k + 2 * (radialDiv/2+1), start + k);
            }
            let buff = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(index), gl.STATIC_DRAW);
            this.indices.push({primitive: gl.TRIANGLE_STRIP, buffer: buff, numPoints: index.length});
        }

        /* top cover */
        index = [];
        for (let k = 0; k < (radialDiv/2+1); k++) {
            index.push (k + (radialDiv/2+1), k);
        }
        let buff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(index), gl.STATIC_DRAW);
        this.indices.push({primitive: gl.TRIANGLE_STRIP, buffer: buff, numPoints: index.length});

        /* bottom cover */
        index = [];
        let start = (2 * verticalDiv) * (radialDiv/2+1);
        for (let k = 0; k < (radialDiv/2+1); k++) {
            index.push (start + k, start + (radialDiv/2+1) + k);
        }
        let zbuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, zbuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(index), gl.STATIC_DRAW);
        this.indices.push({primitive: gl.TRIANGLE_STRIP, buffer: zbuff, numPoints: index.length});
    }

    /**
     * Draw the object
     * @param {Number} vertexAttr a handle to a vec3 attribute in the vertex shader for vertex xyz-position
     * @param {Number} colorAttr  a handle to a vec3 attribute in the vertex shader for vertex rgb-color
     * @param {Number} modelUniform a handle to a mat4 uniform in the shader for the coordinate frame of the model
     * @param {mat4} coordFrame a JS mat4 variable that holds the actual coordinate frame of the object
     */
    draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
        gl.uniform3fv(objTintUnif, vec3.fromValues(this.color[0], this.color[1], this.color[2]));
        gl.uniform1f(ambCoeffUnif, 0.35);
        gl.uniform1f(diffCoeffUnif, 0.75);
        gl.uniform1f(specCoeffUnif, 0.6);
        gl.uniform1f(shininessUnif, 20);

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
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_SHORT, 0);
        }
    }
}

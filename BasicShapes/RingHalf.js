/**
 * Created by mitchcout on 3/5/2017.
 */
class RingHalf {

    constructor (gl, outRadius, inRadius, height, radialDiv, verticalDiv, col1, col2) {

        /* if colors are undefined, generate random colors */
        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        let randColor = vec3.create();
        let vertices = [];

        for (let s = 0; s <= verticalDiv; s++) {
            let h = height/2 - s * height / (verticalDiv);
            for (let k = 0; k <= radialDiv/2; k++) {
                let angle = k * 2 * Math.PI / radialDiv;
                let x = outRadius * Math.cos(angle);
                let y = outRadius * Math.sin(angle);

                /* the first three floats are 3D (x,y,z) position */
                vertices.push(x, y, h);
                vec3.lerp(randColor, col1, col2, Math.random());
                /* linear interpolation between two colors */
                /* the next three floats are RGB */
                vertices.push(randColor[0], randColor[1], randColor[2]);
            }
            for (let k = 0; k <= radialDiv/2; k++) {
                let angle = k * 2 * Math.PI / radialDiv;
                let x = inRadius * Math.cos(angle);
                let y = inRadius * Math.sin(angle);

                /* the first three floats are 3D (x,y,z) position */
                vertices.push(x, y, h);
                vec3.lerp(randColor, col1, col2, Math.random());
                /* linear interpolation between two colors */
                /* the next three floats are RGB */
                vertices.push(randColor[0], randColor[1], randColor[2]);
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

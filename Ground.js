/**
 * Created by mitchcout on 2/27/2017.
 */
class Ground {
    constructor (gl) {
        let width = 10;
        let radius = width / 2;
        let groundCol = vec3.fromValues (214/255,216/255,162/255);
        let skyCol = vec3.fromValues (112/255,166/255,255/255);
        //ground
        let vertices = [
            radius, radius, 0, groundCol[0], groundCol[1], groundCol[2],
            radius, -radius, 0, groundCol[0], groundCol[1], groundCol[2],
            -radius, radius, 0, groundCol[0], groundCol[1], groundCol[2],
            -radius, -radius, 0, groundCol[0], groundCol[1], groundCol[2]
        ];
        //sky
        vertices.push(
            radius, radius, 0, skyCol[0], skyCol[1], skyCol[2],
            radius, -radius, 0, skyCol[0], skyCol[1], skyCol[2],
            radius, radius, radius, skyCol[0], skyCol[1], skyCol[2],
            radius, -radius, radius, skyCol[0], skyCol[1], skyCol[2]
        );
        vertices.push(
            radius, -radius, 0, skyCol[0], skyCol[1], skyCol[2],
            -radius, -radius, 0, skyCol[0], skyCol[1], skyCol[2],
            radius, -radius, radius, skyCol[0], skyCol[1], skyCol[2],
            -radius, -radius, radius, skyCol[0], skyCol[1], skyCol[2]
        );
        vertices.push(
            -radius, -radius, 0, skyCol[0], skyCol[1], skyCol[2],
            -radius, radius, 0, skyCol[0], skyCol[1], skyCol[2],
            -radius, -radius, radius, skyCol[0], skyCol[1], skyCol[2],
            -radius, radius, radius, skyCol[0], skyCol[1], skyCol[2]
        );
        vertices.push(
            -radius, radius, 0, skyCol[0], skyCol[1], skyCol[2],
            radius, radius, 0, skyCol[0], skyCol[1], skyCol[2],
            -radius, radius, radius, skyCol[0], skyCol[1], skyCol[2],
            radius, radius, radius, skyCol[0], skyCol[1], skyCol[2]
        );
        this.vbuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

        let index = [0,1,2,3];
        let skyIndex1 = [4,5,6,7];
        let skyIndex2 = [8,9,10,11];
        let skyIndex3 = [12,13,14,15];
        let skyIndex4 = [16,17,18,19];

        this.indexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(index), gl.STATIC_DRAW);
        this.skyIndexBuff1 = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.skyIndexBuff1);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(skyIndex1), gl.STATIC_DRAW);
        this.skyIndexBuff2 = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.skyIndexBuff2);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(skyIndex2), gl.STATIC_DRAW);
        this.skyIndexBuff3 = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.skyIndexBuff3);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(skyIndex3), gl.STATIC_DRAW);
        this.skyIndexBuff4 = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.skyIndexBuff4);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(skyIndex4), gl.STATIC_DRAW);

        this.indices = [];
        this.indices.push({"primitive": gl.TRIANGLE_STRIP, "buffer": this.indexBuff, "numPoints": index.length});
        this.indices.push({"primitive": gl.TRIANGLE_STRIP, "buffer": this.skyIndexBuff1, "numPoints": skyIndex1.length});
        this.indices.push({"primitive": gl.TRIANGLE_STRIP, "buffer": this.skyIndexBuff2, "numPoints": skyIndex2.length});
        this.indices.push({"primitive": gl.TRIANGLE_STRIP, "buffer": this.skyIndexBuff3, "numPoints": skyIndex3.length});
        this.indices.push({"primitive": gl.TRIANGLE_STRIP, "buffer": this.skyIndexBuff4, "numPoints": skyIndex4.length});
    }

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
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
        }
    }
}
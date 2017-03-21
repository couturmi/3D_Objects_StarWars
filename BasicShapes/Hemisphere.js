/**
 * Created by Mitch Couturier on 2/27/17.
 */
class Hemisphere {
    constructor (gl, radius, subDiv, col1, col2) {

        /* if colors are undefined, generate random colors */
        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        let randColor = vec3.create();
        let vertices = [];
        this.vbuff = gl.createBuffer();

        let seg_height, seg_radius;
        let seg_angle = 2 * Math.PI / subDiv;

        /* Instead of allocating two separate JS arrays (one for position and one for color),
         in the following loop we pack both position and color
         so each tuple (x,y,z,r,g,b) describes the properties of a vertex
         */
        vertices.push(0,0,radius); /* tip of sphere */
        vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
        vertices.push(randColor[0], randColor[1], randColor[2]);
        for(let i = 0; i <= ((subDiv / 4)-1); i++) {
            seg_height = radius * Math.sin(seg_angle*(((subDiv / 4)-1) - i));
            seg_radius = radius * Math.cos(seg_angle*(((subDiv / 4)-1) - i));
            for (let k = 0; k < subDiv; k++) {
                let angle = k * 2 * Math.PI / subDiv;
                let x = seg_radius * Math.cos(angle);
                let y = seg_radius * Math.sin(angle);

                /* the first three floats are 3D (x,y,z) position */
                vertices.push(x, y, seg_height);
                /* perimeter of base */
                vec3.lerp(randColor, col1, col2, Math.random());
                /* linear interpolation between two colors */
                /* the next three floats are RGB */
                vertices.push(randColor[0], randColor[1], randColor[2]);
            }
        }
        // vertices.push(0, 0, -radius);
        // vec3.lerp(randColor, col1, col2, Math.random());
        // vertices.push(randColor[0], randColor[1], randColor[2]);

        /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

        // Generate index order for top of sphere
        let topIndex = [];
        topIndex.push(0);
        for (let k = 1; k <= subDiv; k++)
            topIndex.push(k);
        topIndex.push(1);
        this.topIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.topIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(topIndex), gl.STATIC_DRAW);

        // Generate index order for middle sections of sphere
        let midIndexList = [];
        for (let i = 0; i <= ((subDiv / 4)-1); i++){
            let temp = [];
            for(let k = (subDiv*i)+1; k < (subDiv*(i+1)+1); k++){
                temp.push(k);
                temp.push(k+subDiv);
            }
            temp.push((subDiv*i)+1);
            temp.push((subDiv*(i+1))+1);
            midIndexList.push(temp);
        }

        /* Put the indices as an array of objects. Each object has three attributes:
         primitive, buffer, and numPoints */
        this.indices = [{"primitive": gl.TRIANGLE_FAN, "buffer": this.topIdxBuff, "numPoints": topIndex.length}];
        for(let i = 0; i < ((subDiv / 4)-1); i++) {
            let tempBuff = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tempBuff);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(midIndexList[i]), gl.STATIC_DRAW);
            this.indices.push({"primitive": gl.TRIANGLE_STRIP, "buffer": tempBuff, "numPoints": midIndexList[i].length});
        }
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

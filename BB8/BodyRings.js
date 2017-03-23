/**
 * Created by mitchcout on 3/5/2017.
 */
class BodyRings {
    constructor(gl, prog, radius, color) {
        this.color = color;
        objTintUnif = gl.getUniformLocation(prog, "objectTint");
        ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
        diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
        specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
        shininessUnif = gl.getUniformLocation(prog, "shininess");
        isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");

        let subDiv = 35;
        let vertices = [];
        this.vbuff = gl.createBuffer();

        let seg_height, seg_radius;
        let seg_angle = 2 * Math.PI / subDiv;


        vertices.push(0,0,radius); /* tip of sphere */
        vertices.push(color[0], color[1], color[2]);
        for(let i = 1; i <= 2; i++){
            seg_height = radius * Math.sin(seg_angle*(((subDiv / 4)-1) - i));
            seg_radius = radius * Math.cos(seg_angle*(((subDiv / 4)-1) - i));
            for (let k = 0; k < subDiv; k++) {
                let angle = k * 2 * Math.PI / subDiv;
                let x = seg_radius * Math.cos(angle);
                let y = seg_radius * Math.sin(angle);

                vertices.push(x, y, seg_height);
                /* perimeter of base */
                vertices.push(color[0], color[1], color[2]);
            }
        }
        for(let i = (subDiv / 4)*2-4; i <= (subDiv / 4)*2-3; i++){
            seg_height = radius * Math.sin(seg_angle*(((subDiv / 4)-1) - i));
            seg_radius = radius * Math.cos(seg_angle*(((subDiv / 4)-1) - i));
            for (let k = 0; k < subDiv; k++) {
                let angle = k * 2 * Math.PI / subDiv;
                let x = seg_radius * Math.cos(angle);
                let y = seg_radius * Math.sin(angle);

                vertices.push(x, y, seg_height);
                /* perimeter of base */
                vertices.push(color[0], color[1], color[2]);
            }
        }

        /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);


        // Generate index order for middle sections of sphere
        let midIndexList = [];
        for (let i = 0; i <= 2; i++){
            if(i != 1) {
                let temp = [];
                for (let k = (subDiv * i) + 1; k < (subDiv * (i + 1) + 1); k++) {
                    temp.push(k);
                    temp.push(k + subDiv);
                }
                temp.push((subDiv * i) + 1);
                temp.push((subDiv * (i + 1)) + 1);
                midIndexList.push(temp);
            }
        }

        /* Put the indices as an array of objects. Each object has three attributes:
         primitive, buffer, and numPoints */
        this.indices = [];
            // {"primitive": gl.TRIANGLE_FAN, "buffer": this.topIdxBuff, "numPoints": topIndex.length}];
        for(let i = 0; i < midIndexList.length; i++) {
            let tempBuff = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tempBuff);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(midIndexList[i]), gl.STATIC_DRAW);
            this.indices.push({"primitive": gl.TRIANGLE_STRIP, "buffer": tempBuff, "numPoints": midIndexList[i].length});
        }
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
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
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
        }
    }
}
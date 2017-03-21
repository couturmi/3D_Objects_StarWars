/**
 * Created by Hans Dulimarta on 2/1/17.
 */
class Torus {
  /**
   * Create a torus around the Z+ axis
   * @param {Object} gl      the current WebGL context
   * @param {Number} majRadius  major radius of the torus
   * @param {Number} minRadius  minor radius of the torus
   * @param {Number} majDiv  number of subdivisions of the major circle
   * @param {Number} minDiv  number of subdivisions of the minor circle
   * @param {vec3}   [col1]    color #1 to use
   * @param {vec3}   [col2]    color #2 to use
   */
  constructor (gl, majRadius, minRadius, majDiv, minDiv, col1, col2) {

    /* if colors are undefined, generate random colors */
    if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    let randColor = vec3.create();
    let vertices = [];
    for (let s = 0; s < minDiv; s++) {
      let minAngle = s * 2 * Math.PI / minDiv;
      let h = minRadius * Math.sin(minAngle);
      let r = majRadius + minRadius * Math.cos(minAngle);
      for (let k = 0; k < majDiv; k++) {
        let majAngle = k * 2 * Math.PI / majDiv;
        let x = r * Math.cos(majAngle);
        let y = r * Math.sin(majAngle);

        /* the first three floats are 3D (x,y,z) position */
        vertices.push(x, y, h);
        vec3.lerp(randColor, col1, col2, Math.random());
        /* linear interpolation between two colors */
        /* the next three floats are RGB */
        vertices.push(randColor[0], randColor[1], randColor[2]);
      }
    }

    this.vbuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

    this.indices = [];
    var startIndex = 0;
    for (let s = 0; s < minDiv - 1; s++) {
      let index = [];
      for (let k = 0; k < majDiv; k++) {
        index.push (startIndex + k + majDiv);
        index.push (startIndex + k);
      }
      index.push (startIndex + majDiv);
      index.push (startIndex);
      let iBuff = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuff);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(index), gl.STATIC_DRAW);
      this.indices.push({primitive: gl.TRIANGLE_STRIP, buffer: iBuff, numPoints: index.length});
      startIndex += majDiv;
    }
    let index = [];
    let NPOINTS = majDiv * minDiv;
    for (let k = 0; k < majDiv; k++) {
      index.push (k, NPOINTS - majDiv + k);
    }
    index.push (0, NPOINTS - majDiv);
    let iBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(index), gl.STATIC_DRAW);
    this.indices.push({primitive: gl.TRIANGLE_STRIP, buffer: iBuff, numPoints: index.length});
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
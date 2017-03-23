/**
 * Created by Hans Dulimarta on 2/1/17.
 */
class Cube {
  /**
   * Create a cube
   * @param {Object} gl      the current WebGL context
   * @param {Number} size  size of the cube
   * @param {Number} subDiv number of subdivisions
   * @param {vec3}   [col1]    color #1 to use
   * @param {vec3}   [col2]    color #2 to use
   */
  constructor (gl, prog, size, subDiv, col1, col2, col3) {
    objTintUnif = gl.getUniformLocation(prog, "objectTint");
    ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
    diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
    specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
    shininessUnif = gl.getUniformLocation(prog, "shininess");
    isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");

    /* if colors are undefined, generate random colors */
    if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    if (typeof col3 === "undefined") col3 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    let randColor = vec3.create();
    vec3.lerp(randColor, col1, col2, Math.random());
    this.colorShader = randColor;

    let n1 = vec3.create();
    let n2 = vec3.create();
    let norm = vec3.create();
    this.vex = [
      vec3.fromValues(-size / 2, -size / 2, +size / 2),  // 0
      vec3.fromValues(+size / 2, -size / 2, +size / 2),  // 1
      vec3.fromValues(+size / 2, +size / 2, +size / 2),  // 2
      vec3.fromValues(-size / 2, +size / 2, +size / 2),  // 3
      vec3.fromValues(-size / 2, -size / 2, -size / 2),  // 4
      vec3.fromValues(+size / 2, -size / 2, -size / 2),  // 5
      vec3.fromValues(+size / 2, +size / 2, -size / 2),  // 6
      vec3.fromValues(-size / 2, +size / 2, -size / 2)   // 7
    ];
    this.color = [col1, col2, col3, col1, col2, col3, col1, col2];

    this.index = [];

    this.split (subDiv, 0, 1, 2, 3, col1); /* top: Z+ */
    this.split (subDiv, 0, 4, 5, 1, col2); /* front: Y- */
    this.split (subDiv, 4, 7, 6, 5, col1); /* bottom: Z- */
    this.split (subDiv, 2, 6, 7, 3, col2); /* back: Y+ */
    this.split (subDiv, 1, 5, 6, 2, col3); /* right: X+ */
    this.split (subDiv, 0, 3, 7, 4, col3); /* left: X- */
    let vertices = [];
    for (let k = 0; k < this.vex.length; k++)
    {
      vertices.push(this.vex[k][0], this.vex[k][1], this.vex[k][2]);
      /* the next three floats are vertex normal */
        vertices.push (this.vex[k][0], this.vex[k][1], 0);
    }
    this.vbuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

    let ibuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(this.index), gl.STATIC_DRAW)
    this.indices = [{primitive: gl.TRIANGLES, buffer: ibuff, numPoints: this.index.length}];
  }

  split (N, a, b, c, d, col) {
    if (N > 0) {
      let mid_ab = vec3.lerp(vec3.create(), this.vex[a], this.vex[b], 0.5);
      this.vex.push(mid_ab);
      this.color.push(col);
      let n_ab = this.vex.length - 1;

      let mid_bc = vec3.lerp(vec3.create(), this.vex[b], this.vex[c], 0.5);
      this.vex.push(mid_bc);
      this.color.push(col);
      let n_bc = this.vex.length - 1;

      let mid_cd = vec3.lerp(vec3.create(), this.vex[c], this.vex[d], 0.5);
      this.vex.push(mid_cd);
      this.color.push(col);
      let n_cd = this.vex.length - 1;

      let mid_da = vec3.lerp(vec3.create(), this.vex[d], this.vex[a], 0.5);
      this.vex.push(mid_da);
      this.color.push(col);
      let n_da = this.vex.length - 1;

      let ctr = vec3.lerp(vec3.create(), this.vex[n_ab], this.vex[n_cd], 0.5);
      this.vex.push(ctr);
      this.color.push(col);
      let n_ctr = this.vex.length - 1;

      this.split (N - 1, a, n_ab, n_ctr, n_da, col);
      this.split (N - 1, n_da, n_ctr, n_cd, d, col);
      this.split (N - 1, n_ab, b, n_bc, n_ctr, col);
      this.split (N - 1, n_ctr, n_bc, c, n_cd, col);
    } else {
      /* stop recursion */
      this.index.push(a, b, c);
      this.index.push(a, c, d);
    }
  }
  /**
   * Draw the object
   * @param {Number} vertexAttr a handle to a vec3 attribute in the vertex shader for vertex xyz-position
   * @param {Number} colorAttr  a handle to a vec3 attribute in the vertex shader for vertex rgb-color
   * @param {Number} modelUniform a handle to a mat4 uniform in the shader for the coordinate frame of the model
   * @param {mat4} coordFrame a JS mat4 variable that holds the actual coordinate frame of the object
   */
  draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
    gl.uniform3fv(objTintUnif, vec3.fromValues(this.colorShader[0], this.colorShader[1], this.colorShader[2]));
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
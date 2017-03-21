/**
 * Created by Hans Dulimarta on 2/1/17.
 */
// Create a cylinder whose Z-axis as its axis of symmetry, base at Z=-h/2, top at Z=+h/2
class Cylinder {
  /* subDiv: number of subdivisions for the circle/cone base */
  constructor (gl, topRadius, botRadius, height, subDiv, col1, col2) {
    if (typeof col1 === "undefined") col1 = vec3.fromValues(0xff/255, 0x59/255, 0x59/255);
    if (typeof col2 === "undefined") col2 = vec3.fromValues(0xFF/255, 0xC5/255, 0x6C/255);
    let vertices = [];
    let randColor = vec3.create();
    this.vbuff = gl.createBuffer();
    this.heightVar = height;

    /* create the top points */
    vertices.push(0,0,height/2);
    vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
    vertices.push(randColor[0], randColor[1], randColor[2]);
    for (let k = 0; k < subDiv; k++) {
      let angle = k * 2 * Math.PI / subDiv;
      let x = topRadius * Math.cos (angle);
      let y = topRadius * Math.sin (angle);
      vertices.push (x, y, height/2); /* perimeter */
      vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
      vertices.push(randColor[0], randColor[1], randColor[2]);
    }
    /* create the bottom points */
    vertices.push(0,0, -height/2);
    vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
    vertices.push(randColor[0], randColor[1], randColor[2]);
    for (let k = 0; k < subDiv; k++) {
      let angle = k * 2 * Math.PI / subDiv;
      let x = botRadius * Math.cos (angle);
      let y = botRadius * Math.sin (angle);
      vertices.push (x, y, -height/2); /* perimeter */
      vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
      vertices.push(randColor[0], randColor[1], randColor[2]);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

    // Generate index for top circle
    let topIndex = [];
    topIndex.push(0);
    for (let k = 1; k <= subDiv; k++)
      topIndex.push(k);
    topIndex.push(1);
    let topIdxBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, topIdxBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(topIndex), gl.STATIC_DRAW);

    // Generate index for bottom of cone
    let botIndex = [];
    botIndex.push(subDiv + 1);
    for (let k = 2*subDiv - 1; k >= subDiv + 2; k--)
      botIndex.push(k);
    botIndex.push(2*subDiv - 1);
    let botIdxBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, botIdxBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(botIndex), gl.STATIC_DRAW);

    // Generate index for the side
    let sideIndex = [];
    for (let k = 1; k <= subDiv; k++) {
      sideIndex.push (k, k + subDiv + 1);
    }
    sideIndex.push (1, subDiv + 2);
    let sideIdxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sideIdxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(sideIndex), gl.STATIC_DRAW);

    /* Put the indices as an array of objects */
    this.indices = [
      {"primitive": gl.TRIANGLE_FAN, "buffer": topIdxBuff, "numPoints": topIndex.length},
      {"primitive": gl.TRIANGLE_FAN, "buffer": botIdxBuff, "numPoints": botIndex.length},
      {"primitive": gl.TRIANGLE_STRIP, "buffer": sideIdxBuf, "numPoints": sideIndex.length}
    ];
  }

  getData() {
    return {"vertex" : this.vbuff,
            "index"  : this.indices};   /* this field is actually an array */
  }

  getHeight() {
    return this.heightVar;
  }

  draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
    gl.uniformMatrix4fv(modelUniform, false, coordFrame);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12);
    for (let k = 0; k < this.indices.length; k++) {
      let obj = this.indices[k];
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
      gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
    }
  }
}
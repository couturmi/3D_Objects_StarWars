/**
 * Created by mitchcout on 2/27/2017.
 */

class BB8 {

    constructor(gl, radius, color) {
        this.radius = radius;

        this.movingLeft = false;
        this.movingRight = false;
        this.movingUp = false;
        this.movingDown = false;
        this.direction = "";

        //define colors
        let uniqueColor = color;

        //define objects
        this.body = new bbBottom(gl, radius, uniqueColor);
        this.head = new bbHead(gl, this.body.getRadius()*2, uniqueColor);

        //define tranformations
        this.bodyTransform = mat4.create();
        let bodyHeight = vec3.fromValues (0, 0, this.body.getRadius());
        mat4.translate(this.bodyTransform, this.bodyTransform, bodyHeight);

        this.bodyCoorFrame = mat4.create();
        this.bodyCoorFrameInverted = mat4.create();
        mat4.mul (this.bodyCoorFrame, this.bodyCoorFrame, this.bodyTransform); //position body up
        this.headCoorFrame = mat4.create();
        this.spinCountMax = 200; //represents the range the head will spin
        this.spinCount = this.spinCountMax/2; //represent the current position within the range spinCountMax
        this.rotationDirection = -Math.PI / 270;
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        //spin body (constant)
        if(this.movingDown) {
            this.a = vec3.fromValues(10,0,0);
            if(this.direction != "down") {
                this.bodyCoorFrameInverted = mat4.create();
                mat4.invert(this.bodyCoorFrameInverted, this.bodyCoorFrame);
            }
            vec3.transformMat4(this.a, this.a, this.bodyCoorFrameInverted);
            mat4.rotate(this.bodyCoorFrame,this.bodyCoorFrame, -Math.PI/45, this.a);
            this.direction = "down";
        } if(this.movingUp) {
            let a = vec3.fromValues(-10,0,0);
            if(this.direction != "up") {
                this.bodyCoorFrameInverted = mat4.create();
                mat4.invert(this.bodyCoorFrameInverted, this.bodyCoorFrame);
            }
            vec3.transformMat4(a, a, this.bodyCoorFrameInverted);
            mat4.rotate(this.bodyCoorFrame,this.bodyCoorFrame, -Math.PI/45, a);
            this.direction = "up";
        } if(this.movingLeft) {
            let a = vec3.fromValues(0,-10,0);
            if(this.direction != "left") {
                this.bodyCoorFrameInverted = mat4.create();
                mat4.invert(this.bodyCoorFrameInverted, this.bodyCoorFrame);
            }
            vec3.transformMat4(a, a, this.bodyCoorFrameInverted);
            mat4.rotate(this.bodyCoorFrame,this.bodyCoorFrame, -Math.PI/45, a);
            this.direction = "left";
        } if(this.movingRight) {
            let a = vec3.fromValues(0,10,0);
            if(this.direction != "right") {
                this.bodyCoorFrameInverted = mat4.create();
                mat4.invert(this.bodyCoorFrameInverted, this.bodyCoorFrame);
            }
            vec3.transformMat4(a, a, this.bodyCoorFrameInverted);
            mat4.rotate(this.bodyCoorFrame,this.bodyCoorFrame, -Math.PI/45, a);
            this.direction = "right";
        }
        this.body.draw(vertexAttr, colorAttr, modelUniform, this.bodyCoorFrame);

        //spin head (not constant)
        if(this.spinCount >= this.spinCountMax){
            if(this.rotationDirection == Math.PI / 270)
                this.rotationDirection = -Math.PI / 270;
            else if(this.rotationDirection == -Math.PI / 270)
                this.rotationDirection = Math.PI / 270;
            //spinCountMax will change after every direction change
            this.spinCountMax = Math.floor((Math.random() * 200) + 51);
            this.spinCount = 0;
        }
        if(this.spinCount < this.spinCountMax*(3/4) && this.spinCount > this.spinCountMax*(1/4))
            mat4.rotateZ(this.headCoorFrame, this.headCoorFrame, this.rotationDirection);
        this.spinCount++;
        this.head.draw(vertexAttr, colorAttr, modelUniform, this.headCoorFrame);
    }

    updateCoorFrames(coordFrame) {
        mat4.mul (this.bodyCoorFrame, coordFrame, this.bodyCoorFrame);
        mat4.mul (this.headCoorFrame, coordFrame, this.headCoorFrame);
    }

    updateMovingDirection(left, right, up, down) {
        this.movingLeft = left;
        this.movingRight = right;
        this.movingUp = up;
        this.movingDown = down;
    }

    getRadius() {
        return this.radius;
    }
}
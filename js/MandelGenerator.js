let MandelGenerator = (() => {
    "use strict";
    var BOUNDARY = 2;
    var MAX_ITERATIONS = 100;
    /**
    * ComplexNumber object showing a basic complex number in our x-y axis
    */
    class ComplexNumber {
        constructor(realNumber, imaginaryNumber) {
            this.realNumber = realNumber;
            this.imaginaryNumber = imaginaryNumber;
        }
        getRealPart() {
            return this.realNumber;
        }
        getImaginaryPart() {
            return this.imaginaryNumber;
        }
    }
    /**
    * @param canvas html object on which we are going to render our set
    * @returns Promise to when the rendering finishes
    */
    function generate(canvas, oPlaneDef) {
        let ctx = canvas.getContext('webgl');
        if (!ctx) {
            return cpuRender(canvas, oPlaneDef);
        }
        return gpuRender(canvas, oPlaneDef);
    }
    function gpuRender(canvas, oPlaneDef) {
        return new Promise((done) => {
            // Get A WebGL context
            var gl = canvas.getContext("webgl");
            if (!gl) {
                return;
            }
            // Get the strings for our GLSL shaders
            var vertexShaderSource = document.getElementById("2d-vertex-shader").text;
            var fragmentShaderSource = document.getElementById("2d-fragment-shader")
                .text.replace(/MAX_ITERATIONS\ ([0-9]*)/, "MAX_ITERATIONS " + oPlaneDef.iDefinition);
            // create GLSL shaders, upload the GLSL source, compile the shaders
            var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
            // Link the two shaders into a program
            var program = createProgram(gl, vertexShader, fragmentShader);
            // look up where the vertex data needs to go.
            var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
            var positionClipUniform = gl.getUniformLocation(program, "clip");
            // Create a buffer and put three 2d clip space points in it
            var positionBuffer = gl.createBuffer();
            // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            var positions = [
                -1.0, 1.0,
                -1.0, -1.0,
                1.0, -1.0,
                -1.0, 1.0,
                1.0, -1.0,
                1.0, 1.0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
            // code above this line is initialization code.
            // code below this line is rendering code.
            // Tell WebGL how to convert from clip space to pixels
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            // Clear the canvas
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            // Tell it to use our program (pair of shaders)
            gl.useProgram(program);
            // Turn on the attribute
            gl.enableVertexAttribArray(positionAttributeLocation);
            // Bind the position buffer.
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
            var size = 2; // 2 components per iteration
            var type = gl.FLOAT; // the data is 32bit floats
            var normalize = false; // don't normalize the data
            var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
            var offset = 0; // start at the beginning of the buffer
            gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
            gl.uniform4fv(positionClipUniform, [oPlaneDef.xStart, oPlaneDef.yStart,
                (oPlaneDef.xEnd - oPlaneDef.xStart) / 2.0, (oPlaneDef.yEnd - oPlaneDef.yStart) / 2.0]);
            // draw
            var primitiveType = gl.TRIANGLES;
            var offset = 0;
            var count = 6;
            gl.drawArrays(primitiveType, offset, count);
            done();
        });
        function createShader(gl, type, source) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (success) {
                return shader;
            }
            console.log(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
        }
        function createProgram(gl, vertexShader, fragmentShader) {
            var program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            var success = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (success) {
                return program;
            }
            console.log(gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
        }
    }
    function cpuRender(canvas, oPlaneDef) {
        var ctx = canvas.getContext("2d");
        var x = oPlaneDef.xStart;
        for (var i = 0; i < canvas.width; i++) {
            x += oPlaneDef.xStep;
            (function (x, i) {
                setTimeout(function () {
                    var y = oPlaneDef.yStart;
                    for (var j = canvas.height - 1; j >= 0; j--) {
                        y += oPlaneDef.yStep;
                        var oComplexNumber = new ComplexNumber(x, y);
                        var depth = processPoint(oComplexNumber);
                        ctx.fillStyle = "rgb(0, 0, " + Math.floor(depth * (255 / (MAX_ITERATIONS + 1))) + ")";
                        ctx.fillRect(i, j, 1, 1);
                    }
                });
            })(x, i);
        }
        var promise = new Promise((r) => r());
        return promise;
    }
    /**
    * @param oComplexNumber ComplexNumber is the initial point c
    * @return the level at which that point escapes
    */
    function processPoint(oComplexNumber) {
        var iCounter = 0;
        var oAccum = new ComplexNumber(0, 0);
        while (distanceToOrigin(oAccum) <= BOUNDARY && iCounter <= MAX_ITERATIONS) {
            iCounter++;
            powOf2(oAccum);
            addComplexTo(oAccum, oComplexNumber);
        }
        return iCounter;
    }
    function addComplexTo(oAccum, oPoint) {
        oAccum.realNumber = oAccum.getRealPart() + oPoint.getRealPart();
        oAccum.imaginaryNumber = oAccum.getImaginaryPart() + oPoint.getImaginaryPart();
    }
    function powOf2(oComplexNumber) {
        var real = oComplexNumber.getRealPart();
        var imaginary = oComplexNumber.getImaginaryPart();
        oComplexNumber.realNumber = real * real - imaginary * imaginary;
        oComplexNumber.imaginaryNumber = 2 * real * imaginary;
    }
    function distanceToOrigin(oComplexNumber) {
        return Math.sqrt(Math.pow(oComplexNumber.getRealPart(), 2)
            + Math.pow(oComplexNumber.getImaginaryPart(), 2));
    }
    return {
        generate: generate
    };
})();

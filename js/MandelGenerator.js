/// <reference path="../typings/modules/es6-promise/index.d.ts" />
var MandelGenerator = (function () {
    "use strict";
    var BOUNDARY = 2;
    var MAX_ITERATIONS = 100;
    /**
     * ComplexNumber object showing a basic complex number in our x-y axis
     */
    var ComplexNumber = (function () {
        function ComplexNumber(realNumber, imaginaryNumber) {
            this.realNumber = realNumber;
            this.imaginaryNumber = imaginaryNumber;
        }
        ComplexNumber.prototype.getRealPart = function () {
            return this.realNumber;
        };
        ComplexNumber.prototype.getImaginaryPart = function () {
            return this.imaginaryNumber;
        };
        return ComplexNumber;
    })();
    /**
     * @param canvas html object on which we are going to render our set
     * @returns Promise to when the rendering finishes
     */
    function generate(canvas, oPlaneDef) {
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
        var promise = new Promise(function (r) { return r(); });
        setTimeout(promise.resolve);
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

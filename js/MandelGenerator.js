var MandelGenerator;

(function () {
    "use strict";
    
    var BOUNDARY=2;
    var MAX_ITERATIONS = 100;
    
    /**
     * Prototype of a basic complex number in our x-y axis
     */
    var ComplexNumber = function ComplexNumber(realNumber, imaginaryNumber) {
        this.realNumber = realNumber;
        this.imaginaryNumber = imaginaryNumber;
        
        this.getRealPart = function () {
            return this.realNumber;
        }
        
        this.getImaginaryPart = function () {
            return this.imaginaryNumber
        }
    }
    
    /**
     * @param canvas html object on which we are going to render our set
     * @returns Promise to when the rendering finishes
     */
    function generate(canvas, xStart, yStart, zoomLevel) {
        
        var xEnd = (canvas.width / canvas.height) * (1 / zoomLevel) + xStart;
        var yEnd = Math.abs(xEnd - xStart) + yStart;
        
        var yStep = (yEnd - yStart) / canvas.height;
        var xStep = yStep;
        
        var ctx = canvas.getContext("2d");
        
        var x = xStart;
        for(var i = 0; i < canvas.width; i++) {
            x += xStep;
            (function(x, i){
                setTimeout(function () {
                    var y = yStart;
                    for (var j = 0; j < canvas.height; j++) {
                        y += yStep;
                        var oComplexNumber = new ComplexNumber(x, y);
                        var depth = processPoint(oComplexNumber);
                        ctx.fillStyle = "rgb(0, 0, " + parseInt(depth * (255 / (MAX_ITERATIONS + 1)), 10) + ")";
                        ctx.fillRect(i, j, 1, 1);
                    }
                });
            })(x, i);
        }
        var promise = new Promise(function(resolve){resolve();});
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
        while(distanceToOrigin(oAccum) <= BOUNDARY && iCounter <= MAX_ITERATIONS) {
            iCounter ++;
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
        
        oComplexNumber.realNumber = real*real - imaginary*imaginary;
        oComplexNumber.imaginaryNumber = 2*real*imaginary;
    }
    
    function distanceToOrigin(oComplexNumber) {
        return Math.sqrt(Math.pow(oComplexNumber.getRealPart(),2) 
        + Math.pow(oComplexNumber.getImaginaryPart(), 2));
    }

    MandelGenerator = {
        generate: generate
    }
})();
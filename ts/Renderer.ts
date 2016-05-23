/**
 * PlaneDefinition
 */
class PlaneDefinition {
    public yStep;
    public xStep;
    constructor(canvas: HTMLCanvasElement, public zoomLevel: number, public xStart: number, public yStart: number, public xEnd?, public yEnd?) {
        if (yEnd === undefined) {
            this.yEnd = (canvas.height / canvas.width ) * 1 / zoomLevel + yStart; 
        }
        this.yStep = (this.yEnd - this.yStart) / canvas.height;
        if (xEnd === undefined) {
            this.xStep = this.yStep; // to set a uniform scale
            this.xEnd = this.xStep * canvas.width + this.xStart;
        } else { // xEnd has been passed, recalculate xStep
            this.xStep = (this.xEnd - this.xStart) / canvas.width;
        }
    }

}

var Renderer;
(function () {
    "use strict";


    function init() {
        var canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.height = Math.max(document.documentElement.clientHeight, 0);
        canvas.width = Math.max(document.documentElement.clientWidth, 0);
        var oPlaneDefinition = new PlaneDefinition(canvas, 0.25, -2, -1);
        var renderPromise = render(canvas, oPlaneDefinition);
        renderPromise.then(function () {
            setTimeout(function () {
                var oPlaneDefinition = new PlaneDefinition(canvas, 70, -0.937, 0.286)
                render(canvas, oPlaneDefinition);
            }, 100);
        })
        return canvas;
    }

    function render(canvas, oPlaneDefinition) {
        var oMandelRenderPromise = MandelGenerator.generate(canvas, oPlaneDefinition);
        oMandelRenderPromise.then(() => {
            AxisGenerator.generate(canvas, oPlaneDefinition, true);
        });
        return oMandelRenderPromise
    }

    Renderer = init();

})();
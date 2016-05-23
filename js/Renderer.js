/**
 * PlaneDefinition
 */
var PlaneDefinition = (function () {
    function PlaneDefinition(canvas, zoomLevel, xStart, yStart, xEnd, yEnd) {
        this.zoomLevel = zoomLevel;
        this.xStart = xStart;
        this.yStart = yStart;
        this.xEnd = xEnd;
        this.yEnd = yEnd;
        if (xEnd === undefined) {
            this.xEnd = (canvas.width / canvas.height) * (1 / zoomLevel) + xStart;
        }
        if (yEnd === undefined) {
            this.yEnd = Math.abs(this.xEnd - xStart) + yStart;
        }
    }
    return PlaneDefinition;
})();
var Renderer;
(function () {
    "use strict";
    function init() {
        var canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.height = Math.max(document.documentElement.clientHeight, 0);
        canvas.width = Math.max(document.documentElement.clientWidth, 0);
        var oPlaneDefinition = new PlaneDefinition(canvas, 1, -2, -1);
        var renderPromise = render(canvas, oPlaneDefinition);
        renderPromise.then(function () {
            setTimeout(function () {
                var oPlaneDefinition = new PlaneDefinition(canvas, 50, -0.912, -0.27);
                render(canvas, oPlaneDefinition);
            }, 10000);
        });
        return canvas;
    }
    function render(canvas, oPlaneDefinition) {
        var oMandelRenderPromise = MandelGenerator.generate(canvas, oPlaneDefinition);
        oMandelRenderPromise.then(function () {
            AxisGenerator.generate(canvas, oPlaneDefinition);
        });
        return oMandelRenderPromise;
    }
    Renderer = init();
})();

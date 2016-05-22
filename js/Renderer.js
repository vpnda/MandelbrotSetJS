var Renderer;

(function () {
    "use strict";
    function init() {
        var canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.height = Math.max(document.documentElement.clientHeight, 0);
        canvas.width =  Math.max(document.documentElement.clientWidth, 0);
        var zoomLevel = 1, xStart = -2, yStart = -1;
        var renderPromise = MandelGenerator.generate(canvas, xStart, yStart, zoomLevel);
        zoomLevel = 50;
        xStart = -0.912;
        yStart = -0.27;
        renderPromise.then(function () {
            setTimeout(function() {
                MandelGenerator.generate(canvas, xStart, yStart, zoomLevel);
            }, 10000);
        })
        return canvas;
    }
    Renderer = init(); 
})();
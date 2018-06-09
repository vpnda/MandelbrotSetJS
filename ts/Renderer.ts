/**
 * PlaneDefinition
 */
class PlaneDefinition {
    public yStep;
    public xStep;
    constructor(canvas: HTMLCanvasElement, public zoomLevel: number, public xStart: number, public yStart: number, public xEnd?, public yEnd?) {
        if (yEnd === undefined) {
            this.yEnd = (canvas.height / canvas.width ) * 1 / (zoomLevel + 0.25) + yStart; 
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

    var oPosnInfo = {
        start: [0.0, 0.0],
        end: [0.0, 0,0]
    };
    var bChanging = false;
    var canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    var oPlaneDefinition = new PlaneDefinition(canvas, 0, -2, -1);

    function init() {
        canvas.height = Math.max(document.documentElement.clientHeight, 0);
        canvas.width = Math.max(document.documentElement.clientWidth, 0);
        var renderPromise = render(canvas, oPlaneDefinition);
        canvas.addEventListener('mousedown', onDocumentMouseDown)
        canvas.addEventListener('mousemove', onDocumentMouseMove)
        canvas.addEventListener('mouseup', onDocumentMouseUp)
        canvas.addEventListener('mousewheel', onDocumentWheelMove)
        return canvas;
    }

    function render(canvas, oPlaneDefinition) {
        var oMandelRenderPromise = MandelGenerator.generate(canvas, oPlaneDefinition);
        oMandelRenderPromise.then(() => {
            AxisGenerator.generate(canvas, oPlaneDefinition, true);
        });
        return oMandelRenderPromise
    }

    function onDocumentMouseDown(event: MouseEvent) {
        event.preventDefault();
        // Get mouse position
        var mouseX = (event.clientX) ;
        var mouseY = -(event.clientY);
        oPosnInfo.start = [mouseX, mouseY];
        oPosnInfo.end = [mouseX, mouseY];
        bChanging = true;
    }

    function onDocumentMouseMove(event: MouseEvent) {
        event.preventDefault();
        // Get mouse position
        var mouseX = (event.clientX) ;
        var mouseY = -(event.clientY) ;
        if (bChanging) {
            oPosnInfo.end = [mouseX, mouseY]
        }
    }

    function onDocumentMouseUp(event: MouseEvent) {
        event.preventDefault();
        if (bChanging) {
            oPlaneDefinition = new PlaneDefinition(canvas, 
                oPlaneDefinition.zoomLevel, (oPosnInfo.start[0] - oPosnInfo.end[0]) * oPlaneDefinition.xStep + oPlaneDefinition.xStart , 
                (oPosnInfo.start[1] - oPosnInfo.end[1]) * oPlaneDefinition.yStep + oPlaneDefinition.yStart);
            var renderPromise = render(canvas, oPlaneDefinition);
        }
    }

    function onDocumentWheelMove(event: WheelEvent) {
        event.preventDefault();
        let relCoords = relMouseCoords(event)
        
        console.log("New Scale Factor: " + (oPlaneDefinition.zoomLevel - event.deltaY / 100.0))
        let fNewScaleFactor = Math.max((oPlaneDefinition.zoomLevel * ((-event.deltaY / 100.0) > 0 ? 1.2 : 0.833 )) - event.deltaY / 100.0, 0.0)
        let fRePart = oPlaneDefinition.xStart + oPlaneDefinition.xStep * relCoords.x;
        let fImmPart = oPlaneDefinition.yStart + oPlaneDefinition.yStep * (canvas.height - relCoords.y) ;
        let oTmpPlaneDef = new PlaneDefinition(canvas, 
            fNewScaleFactor, fRePart, fImmPart);
        let fReNewStart = fRePart - (relCoords.x) * oTmpPlaneDef.xStep;
        let fImmNewStart = fImmPart - (canvas.height - relCoords.y) * oTmpPlaneDef.yStep;
        oPlaneDefinition = new PlaneDefinition(canvas, 
            fNewScaleFactor, fReNewStart, fImmNewStart);
        console.log("Start: (" + fReNewStart + "," + fImmNewStart + ")" )
        console.log("(" + oPlaneDefinition.xEnd + "," + oPlaneDefinition.yEnd + ")")
        render(canvas, oPlaneDefinition)
        
    }

    function relMouseCoords(event: MouseEvent){
        var totalOffsetX = 0;
        var totalOffsetY = 0;
        var canvasX = 0;
        var canvasY = 0;
        var currentElement: HTMLElement = canvas;
    
        do{
            totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
            totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
        }
        while(currentElement = <HTMLElement> currentElement.offsetParent)
    
        canvasX = event.pageX - totalOffsetX;
        canvasY = event.pageY - totalOffsetY;
    
        return {x:canvasX, y:canvasY}
    }
    

    Renderer = init();

})();
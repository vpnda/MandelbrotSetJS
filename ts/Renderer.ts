/**
 * PlaneDefinition
 */
class PlaneDefinition {
    public yStep;
    public xStep;
    public iDefinition = 100;
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
        end: [0.0, 0,0],
        dist: 0.0
    };
    var bChanging = false;
    var canvas = document.createElement("canvas");
    var oPlaneDefinition;

    function init(parentElement: HTMLElement = document.body) {
        // Set the plane defn
        parentElement.appendChild(canvas);
        updateCanvasSize();
        let yRange = (canvas.height / canvas.width ) / 0.25
        let xRange =  4.
        let yStart = -yRange / 2
        let xStart = -xRange / 2
        oPlaneDefinition = new PlaneDefinition(canvas, 0, xStart, yStart)

        // Initial render & listeners
        render();
        canvas.addEventListener('mousedown', onDocumentMouseDown)
        canvas.addEventListener('mousemove', onDocumentMouseMove)
        canvas.addEventListener('mouseup', onDocumentMouseUp)
        canvas.addEventListener('mousewheel', onDocumentWheelMove)

        canvas.addEventListener('touchstart', onTouchStart)
        canvas.addEventListener('touchmove', onTouchMove)
        canvas.addEventListener('touchcancel', onTouchCancel)
        canvas.addEventListener('touchend', onTouchEnd)

        return {
            render: render,
            getPlaneDefinition: () => oPlaneDefinition
        }
    }
    function genterateMockMe(ev: TouchEvent): MouseEvent {
        let event: any = ev;
        event.clientX = ev.targetTouches[0].clientX;
        event.clientY = ev.targetTouches[0].clientY;
        return event;
    }

    function genterateMockWe(ev: TouchEvent, zoom: Boolean): WheelEvent {
        let event: any = ev;
        event.deltaY = zoom ? 1. : -1.;
        event.pageX = ev.targetTouches[0].clientX;
        event.pageY = ev.targetTouches[0].clientY;
        return event;
    }

    function calculateDistance(ev: TouchEvent): number {
        return Math.sqrt(
            Math.pow(ev.targetTouches[1].clientX - ev.targetTouches[0].clientX, 2) 
            + Math.pow(ev.targetTouches[1].clientY - ev.targetTouches[0].clientY, 2) )
    }

    function onTouchStart(ev: TouchEvent) {
        switch (ev.touches.length) {
            case 1: handle_one_touch(); break;
            case 2: handle_two_touches(); break;
        }

        function handle_one_touch() {
            onDocumentMouseDown(genterateMockMe(ev));
        }

        function handle_two_touches() {
            onDocumentMouseDown(genterateMockMe(ev));
            oPosnInfo.dist = calculateDistance(ev);
        }
    }

    function onTouchMove(ev: TouchEvent) {
        switch (ev.touches.length) {
            case 1: handle_one_touch(); break;
            case 2: handle_two_touches(); break;
        }

        function handle_one_touch() {
            onDocumentMouseMove(genterateMockMe(ev))
        }

        function handle_two_touches() {
            onDocumentMouseMove(genterateMockMe(ev), false)
            let iNewDist = calculateDistance(ev);
            let iDeltaDist = iNewDist - oPosnInfo.dist
            oPosnInfo.dist = iNewDist;
            onDocumentWheelMove(genterateMockWe(ev, iDeltaDist < 0), 1., Math.abs(iDeltaDist) * 0.000001)
        }
    }

    function onTouchEnd(ev: TouchEvent) {
        onDocumentMouseUp(<any> ev)
    }

    function onTouchCancel(ev: TouchEvent) {
        bChanging = false;
    }

    function updateCanvasSize() {
        canvas.height = Math.max(document.documentElement.clientHeight, 0);
        canvas.width = Math.max(document.documentElement.clientWidth, 0);
    }

    function render(customPlaneDefinition: PlaneDefinition = oPlaneDefinition) {
        var oMandelRenderPromise = MandelGenerator.generate(canvas, customPlaneDefinition);
        oMandelRenderPromise.then(() => {
            AxisGenerator.generate(canvas, customPlaneDefinition, true);
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

    function onDocumentMouseMove(event: MouseEvent, willRender: boolean = true) {
        event.preventDefault();
        // Get mouse position
        var mouseX = (event.clientX) ;
        var mouseY = -(event.clientY) ;
        if (bChanging) {
            oPosnInfo.end = [mouseX, mouseY]
            if (willRender) {
                var customPlaneDefn = new PlaneDefinition(canvas, 
                    oPlaneDefinition.zoomLevel, (oPosnInfo.start[0] - oPosnInfo.end[0]) * oPlaneDefinition.xStep + oPlaneDefinition.xStart , 
                    (oPosnInfo.start[1] - oPosnInfo.end[1]) * oPlaneDefinition.yStep + oPlaneDefinition.yStart);
                customPlaneDefn.iDefinition = 25;
                render(customPlaneDefn);
            }
        }
    }

    function onDocumentMouseUp(event: MouseEvent) {
        event.preventDefault();
        if (bChanging) {
            oPlaneDefinition = new PlaneDefinition(canvas, 
                oPlaneDefinition.zoomLevel, (oPosnInfo.start[0] - oPosnInfo.end[0]) * oPlaneDefinition.xStep + oPlaneDefinition.xStart , 
                (oPosnInfo.start[1] - oPosnInfo.end[1]) * oPlaneDefinition.yStep + oPlaneDefinition.yStart);
            var renderPromise = render();
        }
        bChanging = false;
    }

    function onDocumentWheelMove(event: WheelEvent, deltaDivisor: number = 100., scaleStep: number = 0.2 ) {
        event.preventDefault();
        let relCoords = relMouseCoords(event)
        
        console.log("New Scale Factor: " + (oPlaneDefinition.zoomLevel - event.deltaY / deltaDivisor))
        let fNewScaleFactor = Math.max((oPlaneDefinition.zoomLevel * ((-event.deltaY / deltaDivisor) > 0 ? 1. + scaleStep : 1. - scaleStep )) - event.deltaY / deltaDivisor, 0.0)
        let fRePart = oPlaneDefinition.xStart + oPlaneDefinition.xStep * relCoords.x;
        let fImmPart = oPlaneDefinition.yStart + oPlaneDefinition.yStep * (canvas.height - relCoords.y) ;
        let oTmpPlaneDef = new PlaneDefinition(canvas, 
            fNewScaleFactor, fRePart, fImmPart);
        let fReNewStart = fRePart - (relCoords.x) * oTmpPlaneDef.xStep;
        let fImmNewStart = fImmPart - (canvas.height - relCoords.y) * oTmpPlaneDef.yStep;
        oPlaneDefinition = new PlaneDefinition(canvas, 
            fNewScaleFactor, fReNewStart, fImmNewStart);
        render()
        
    }

    function onScreenResize(){
        updateCanvasSize();
        render()
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

    window.addEventListener("resize", onScreenResize)

    Renderer = init

})();

window.onload = (ev: Event) => {
    Renderer()
}
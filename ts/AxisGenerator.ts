let AxisGenerator = (() => {

    enum LimitType {
        "BOTTOM",
        "TOP",
        "NONE"
    }

    /**
     * Border padding settings
     */
    
    let LINE_PADDING = 20;

    /**
     * Line settings
     */
    let LINE_WIDTH = 2;                             // px
    let LINE_COLOR = 'rgb(255,255,255)'             // White color
    let PADDING_BETWEEN_LINE_AND_NUMBERS = 30;      // px
    
    let NUMBER_OF_X_AXIS_STEPS = 10;                // number of steps in the X_AXIS
    let PADDING_BEFORE_START_NUMBERING_X_AXIS = 10; // Approximate padding before staring axis
    let PADDING_BEFORE_END_NUMBERING_X_AXIS = 10;   // Approximate padding before ending axis


    interface SyntheticCenter {
        value: number;
        limit: LimitType;
    }

    /**
     * Generates a basic line in the canvas with given a plane definition
     * @param canvas HTMLCanvasElement
     * @param oPlaneDef PlaneDefinition
     * @return Promise that will resolve once the rendering of this element finishes
     */

    function generate(canvas: HTMLCanvasElement, oPlaneDef: PlaneDefinition) {
        setTimeout(() => {
            _generate(canvas, oPlaneDef);
        });
    }
    /**
     * Private method to generate the canvas element
     */
    function _generate(canvas: HTMLCanvasElement, oPlaneDef: PlaneDefinition) {

        var yStep = (oPlaneDef.yEnd - oPlaneDef.yStart) / canvas.height;
        var xStep = yStep;
        
        generateXAxis();
        generateYAxis();

        function generateXAxis() {
            var oSyntheticYCenter: SyntheticCenter = getSyntheticYCenter();
            drawXLine(oSyntheticYCenter.value);
            switch (oSyntheticYCenter.limit) {
                case LimitType.BOTTOM:
                case LimitType.NONE:
                    drawNumbersBelowLine(oSyntheticYCenter.value);
                    break;
                case LimitType.TOP:
                    drawNumbersAboveLine(oSyntheticYCenter.value);
                    break;
            }
        }

        function drawXLine(iCanvasYSynthCenter: number) {
            var ctx = canvas.getContext("2d");
            var oldStrokeStyle = ctx.strokeStyle;
            try {
                ctx.strokeStyle = LINE_COLOR;
                ctx.beginPath();
                ctx.moveTo(0, iCanvasYSynthCenter);
                ctx.lineTo(canvas.width, iCanvasYSynthCenter);
                ctx.stroke();
            } finally {
                ctx.strokeStyle = oldStrokeStyle;
            }
        }

        function drawNumbersBelowLine(iCanvasYSynthCenter: number) {
            drawNumbersHorizontally(iCanvasYSynthCenter - PADDING_BETWEEN_LINE_AND_NUMBERS);
        }

        function drawNumbersAboveLine(iCanvasYSynthCenter: number) {
            drawNumbersHorizontally(iCanvasYSynthCenter + PADDING_BETWEEN_LINE_AND_NUMBERS);
        }
        
        function drawNumbersHorizontally(iCanvasYSynthCenter: number) {
            if(oPlaneDef.xEnd < 0 && oPlaneDef.xStart > 0) {
                handleDrawingNumbersWithZero(iCanvasYSynthCenter);
            }
            handleDrawingNumbersWithoutZero(iCanvasYSynthCenter);
        }
        
        function handleDrawingNumbersWithZero(iCanvasYSynthCenter : number) {
            
        }
        
        function handleDrawingNumbersWithoutZero(iCanvasYSynthCenter : number) {
            
        }

        function getSyntheticYCenter(): SyntheticCenter {
            if (oPlaneDef.yStart + LINE_PADDING * yStep >= 0) {
                return {
                    value: canvas.height - LINE_PADDING,
                    limit: LimitType.BOTTOM
                }
            }
            if (oPlaneDef.yEnd - LINE_PADDING * yStep <= 0) {
                return {
                    value: LINE_PADDING,
                    limit: LimitType.TOP
                }
            }
            return {
                value: Math.abs(oPlaneDef.yStart) / yStep ,
                limit: LimitType.NONE
            };
        }

        function generateYAxis() {

        }

    }
    
    return {
        generate: generate
    };

})();
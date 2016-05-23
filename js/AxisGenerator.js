var AxisGenerator = (function () {
    var LimitType;
    (function (LimitType) {
        LimitType[LimitType["BOTTOM"] = 0] = "BOTTOM";
        LimitType[LimitType["TOP"] = 1] = "TOP";
        LimitType[LimitType["NONE"] = 2] = "NONE";
    })(LimitType || (LimitType = {}));
    /**
     * Border padding settings
     */
    var LINE_PADDING = 20;
    /**
     * Line settings
     */
    var LINE_WIDTH = 2; // px
    var LINE_COLOR = 'rgb(255,255,255)'; // White color
    /**
     * Generates a basic line in the canvas with given a plane definition
     * @param canvas HTMLCanvasElement
     * @param oPlaneDef PlaneDefinition
     * @return Promise that will resolve once the rendering of this element finishes
     */
    function generate(canvas, oPlaneDef) {
        setTimeout(function () {
            _generate(canvas, oPlaneDef);
        });
    }
    /**
     * Private method to generate the canvas element
     */
    function _generate(canvas, oPlaneDef) {
        var yStep = (oPlaneDef.yEnd - oPlaneDef.yStart) / canvas.height;
        var xStep = yStep;
        generateXAxis();
        generateYAxis();
        function generateXAxis() {
            var oSyntheticYCenter = getSyntheticYCenter();
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
        function drawXLine(iCanvasYSynthCenter) {
            var ctx = canvas.getContext("2d");
            var oldStrokeStyle = ctx.strokeStyle;
            try {
                ctx.strokeStyle = LINE_COLOR;
                ctx.beginPath();
                ctx.moveTo(0, iCanvasYSynthCenter);
                ctx.lineTo(canvas.width, iCanvasYSynthCenter);
                ctx.stroke();
            }
            finally {
                ctx.strokeStyle = oldStrokeStyle;
            }
        }
        function drawNumbersBelowLine(iCanvasYSynthCenter) {
        }
        function drawNumbersAboveLine(iCanvasYSynthCenter) {
        }
        function getSyntheticYCenter() {
            if (oPlaneDef.yStart + LINE_PADDING * yStep >= 0) {
                return {
                    value: canvas.height - LINE_PADDING,
                    limit: LimitType.BOTTOM
                };
            }
            if (oPlaneDef.yEnd - LINE_PADDING * yStep <= 0) {
                return {
                    value: LINE_PADDING,
                    limit: LimitType.TOP
                };
            }
            return {
                value: Math.abs(oPlaneDef.yStart) / yStep,
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

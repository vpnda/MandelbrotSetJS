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
    var TEXT_COLOR = 'rgb(255,255,255)'; // White color
    var PADDING_BETWEEN_LINE_AND_NUMBERS = 15; // px
    var NUMBER_OF_X_AXIS_STEPS = 10; // number of steps in the X_AXIS
    var PADDING_BEFORE_START_NUMBERING_X_AXIS = 10; // Approximate padding before staring axis
    var PADDING_BEFORE_END_NUMBERING_X_AXIS = 10; // Approximate padding before ending axis
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
        generateXAxis();
        generateYAxis();
        function generateXAxis() {
            var oSyntheticYCenter = getSyntheticYCenter();
            drawXLine(oSyntheticYCenter.value);
            switch (oSyntheticYCenter.limit) {
                case LimitType.BOTTOM:
                case LimitType.NONE:
                    drawNumbersAboveLine(oSyntheticYCenter.value);
                    break;
                case LimitType.TOP:
                    drawNumbersBelowLine(oSyntheticYCenter.value);
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
            drawNumbersHorizontally(iCanvasYSynthCenter + PADDING_BETWEEN_LINE_AND_NUMBERS);
        }
        function drawNumbersAboveLine(iCanvasYSynthCenter) {
            drawNumbersHorizontally(iCanvasYSynthCenter - PADDING_BETWEEN_LINE_AND_NUMBERS + 10);
        }
        function drawNumbersHorizontally(iCanvasYSynthCenter) {
            var iAllowablePx = canvas.width - PADDING_BEFORE_START_NUMBERING_X_AXIS - PADDING_BEFORE_END_NUMBERING_X_AXIS;
            var iGetBase = oPlaneDef.xEnd - oPlaneDef.xStart;
            var aNumberArray = getNumberArray(oPlaneDef.xStart, iGetBase);
            var aPositionArray = getPositionOfNumberArray(aNumberArray);
            aNumberArray.forEach(function (iNumber, iIndex) {
                var ctx = canvas.getContext("2d");
                ctx.font = "15px Arial";
                ctx.fillStyle = TEXT_COLOR;
                ctx.fillText(iNumber.toString().substring(0, 5), aPositionArray[iIndex], iCanvasYSynthCenter);
            });
        }
        function getPositionOfNumberArray(aNumberArray) {
            var aRes = [];
            aNumberArray.forEach(function (fNum) {
                aRes.push((fNum - oPlaneDef.xStart) / oPlaneDef.xStep);
            });
            return aRes;
        }
        function getNumberArray(iInitValue, iNumberToGetBase) {
            var iBase = getBaseOfNumber(iNumberToGetBase);
            var iInc = Math.pow(10, iBase);
            var initalVal = Math.ceil(iInitValue * Math.pow(10, -iBase)) * iInc;
            var aRes = [];
            for (var i = 0; i < NUMBER_OF_X_AXIS_STEPS; i++) {
                aRes.push(initalVal);
                initalVal += iInc;
            }
            return aRes;
        }
        function getBaseOfNumber(num) {
            num = Math.abs(num);
            if (num < 10 && num >= 1) {
                return 0;
            }
            else if (num < 1) {
                return -1 + getBaseOfNumber(num * 10);
            }
            return 1 + getBaseOfNumber(num / 10);
        }
        function getSyntheticYCenter() {
            if (oPlaneDef.yStart + LINE_PADDING * oPlaneDef.yStep >= 0) {
                return {
                    value: canvas.height - LINE_PADDING,
                    limit: LimitType.BOTTOM
                };
            }
            if (oPlaneDef.yEnd - LINE_PADDING * oPlaneDef.yStep <= 0) {
                return {
                    value: LINE_PADDING,
                    limit: LimitType.TOP
                };
            }
            return {
                value: Math.abs(oPlaneDef.yStart) / oPlaneDef.yStep,
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

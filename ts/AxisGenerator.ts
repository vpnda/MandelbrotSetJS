let AxisGenerator = (() => {

    enum LimitType {
        "BOTTOM",
        "TOP",
        "NONE",
        "LEFT",
        "RIGHT"
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
    let TEXT_COLOR = 'rgb(255,255,255)'             // White color
    let PADDING_BETWEEN_LINE_AND_NUMBERS = 5;     // px
    let NUMBER_OF_NUMS = 3;
    let FONT_SIZE = 15;                             // px

    let NUMBER_OF_X_AXIS_STEPS = 10;                // number of steps in the X_AXIS


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
    function generate(canvas: HTMLCanvasElement, oPlaneDef: PlaneDefinition, bAsync?: boolean) {
        if (bAsync) {
            setTimeout(() => {
                _generate(canvas, oPlaneDef);
            });
        } else {
            _generate(canvas, oPlaneDef);
        }

    }
    /**
     * Private method to generate the canvas element
     */
    function _generate(canvas: HTMLCanvasElement, oPlaneDef: PlaneDefinition) {

        generateXAxis();
        generateYAxis();

        function generateXAxis() {
            var oSyntheticYCenter: SyntheticCenter = getSyntheticYCenter();
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
            var aPosArray = drawNumbersHorizontally(iCanvasYSynthCenter + PADDING_BETWEEN_LINE_AND_NUMBERS);
            drawGridXLines(aPosArray, iCanvasYSynthCenter);
        }

        function drawNumbersAboveLine(iCanvasYSynthCenter: number) {
            var aPosArray = drawNumbersHorizontally(iCanvasYSynthCenter - PADDING_BETWEEN_LINE_AND_NUMBERS - FONT_SIZE);
            drawGridXLines(aPosArray, iCanvasYSynthCenter);
        }

        function drawNumbersHorizontally(iCanvasYSynthCenter: number) {
            var iGetBase = oPlaneDef.xEnd - oPlaneDef.xStart;
            var aNumberArray = getNumberArray(oPlaneDef.xStart, iGetBase);
            var aPositionArray = getPositionOfNumberArray(aNumberArray, oPlaneDef.xStart, oPlaneDef.xStep);

            aNumberArray.forEach((iNumber, iIndex) => {
                var ctx = canvas.getContext("2d");
                ctx.font = "15px Arial";
                ctx.fillStyle = TEXT_COLOR;
                ctx.fillText(iNumber, aPositionArray[iIndex] - FONT_SIZE / 2, iCanvasYSynthCenter);
            });
            return aPositionArray;
        }

        function getPositionOfNumberArray(aNumberArray: number[], iStartPos: number, iStep: number) {
            var aRes = [];
            aNumberArray.forEach((fNum: number) => {
                aRes.push((fNum - iStartPos) / iStep);
            });
            return aRes;
        }

        function getNumberArray(iInitValue, iNumberToGetBase) {
            var iBase = getBaseOfNumber(iNumberToGetBase);
            var iInc = Math.pow(10, iBase);
            var initalVal = Math.ceil(iInitValue * Math.pow(10, - iBase)) * iInc;
            var aRes = [];
            for (var i = 0; i < NUMBER_OF_X_AXIS_STEPS; i++) {
                var adjustedNum = decimalAdjust(ADJUSTMENT_TYPE.round, initalVal, iBase);
                if (adjustedNum) { // ignore zero
                    aRes.push(adjustedNum);
                }
                initalVal += iInc;
            }
            return aRes;
        }

        function getBaseOfNumber(num: number) {
            num = Math.abs(num);
            if (num < 10 && num >= 1) {
                return 0;
            } else if (num < 1) {
                return -1 + getBaseOfNumber(num * 10);
            }
            return 1 + getBaseOfNumber(num / 10);
        }

        function getSyntheticYCenter(): SyntheticCenter {
            if (oPlaneDef.yStart + LINE_PADDING * oPlaneDef.yStep >= 0) {
                return {
                    value: canvas.height - LINE_PADDING,
                    limit: LimitType.BOTTOM
                }
            }
            if (oPlaneDef.yEnd - LINE_PADDING * oPlaneDef.yStep <= 0) {
                return {
                    value: LINE_PADDING,
                    limit: LimitType.TOP
                }
            }
            return {
                value: Math.abs(oPlaneDef.yEnd) / oPlaneDef.yStep,
                limit: LimitType.NONE
            };
        }

        function generateYAxis() {
            var oSyntheticXCenter: SyntheticCenter = getSyntheticXCenter();
            drawYLine(oSyntheticXCenter.value);
            switch (oSyntheticXCenter.limit) {
                case LimitType.RIGHT:
                    drawNumbersLeftToLine(oSyntheticXCenter.value);
                    break;
                case LimitType.NONE:
                case LimitType.LEFT:
                    drawNumbersRightToLine(oSyntheticXCenter.value);
                    break;
            }
        }

        function drawNumbersLeftToLine(iCanvasXSynthCenter: number) {
            var aPosArray = drawNumbersVertically(iCanvasXSynthCenter - PADDING_BETWEEN_LINE_AND_NUMBERS - FONT_SIZE * NUMBER_OF_NUMS);
            drawGridYLines(aPosArray, iCanvasXSynthCenter);
        }

        function drawNumbersRightToLine(iCanvasXSynthCenter: number) {
            var aPosArray = drawNumbersVertically(iCanvasXSynthCenter + PADDING_BETWEEN_LINE_AND_NUMBERS);
            drawGridYLines(aPosArray, iCanvasXSynthCenter);
        }

        function drawGridYLines(aPosArray: number[], iCanvasXSynthCenter: number) {
            var ctx = canvas.getContext("2d");
            var oldStrokeStyle = ctx.fillStyle;
            ctx.strokeStyle = LINE_COLOR;
            aPosArray.forEach((iPosition) => {
                ctx.beginPath();
                ctx.moveTo(iCanvasXSynthCenter - 5, iPosition);
                ctx.lineTo(iCanvasXSynthCenter + 5, iPosition);
                ctx.stroke();
            });
            ctx.strokeStyle = oldStrokeStyle;
        }

        function drawNumbersVertically(iCanvasXSynthCenter: number) {
            var iGetBase = oPlaneDef.yEnd - oPlaneDef.yStart;
            var aNumberArray = getNumberArray(oPlaneDef.yStart, iGetBase);
            var aPositionArray = getPositionOfNumberArray(aNumberArray, oPlaneDef.yEnd, -oPlaneDef.yStep);

            aNumberArray.forEach((iNumber, iIndex) => {
                var ctx = canvas.getContext("2d");
                ctx.font = FONT_SIZE + "px Arial";
                ctx.fillStyle = TEXT_COLOR;
                ctx.fillText(iNumber, iCanvasXSynthCenter, aPositionArray[iIndex] + FONT_SIZE / 2);
            });
            return aPositionArray;
        }
        
        function drawGridXLines(aPosArray: number[], iCanvasYSynthCenter: number) {
            var ctx = canvas.getContext("2d");
            var oldStrokeStyle = ctx.fillStyle;
            ctx.strokeStyle = LINE_COLOR;
            aPosArray.forEach((iPosition) => {
                ctx.beginPath();
                ctx.moveTo(iPosition, iCanvasYSynthCenter - 5);
                ctx.lineTo(iPosition, iCanvasYSynthCenter + 5);
                ctx.stroke();
            });
            ctx.strokeStyle = oldStrokeStyle;
        }

        function drawYLine(iCanvasXSynthCenter: number) {
            var ctx = canvas.getContext("2d");
            var oldStrokeStyle = ctx.strokeStyle;
            try {
                ctx.strokeStyle = LINE_COLOR;
                ctx.beginPath();
                ctx.moveTo(iCanvasXSynthCenter, 0);
                ctx.lineTo(iCanvasXSynthCenter, canvas.height);
                ctx.stroke();
            } finally {
                ctx.strokeStyle = oldStrokeStyle;
            }
        }

        function getSyntheticXCenter(): SyntheticCenter {
            if (oPlaneDef.xStart + LINE_PADDING * oPlaneDef.xStep >= 0) {
                return {
                    value: LINE_PADDING,
                    limit: LimitType.LEFT
                }
            }
            if (oPlaneDef.xEnd - LINE_PADDING * oPlaneDef.xStep <= 0) {
                return {
                    value: canvas.width - LINE_PADDING,
                    limit: LimitType.RIGHT
                }
            }
            return {
                value: Math.abs(oPlaneDef.xStart) / oPlaneDef.xStep,
                limit: LimitType.NONE
            };
        }

    }

    enum ADJUSTMENT_TYPE {
        'ciel',
        'round',
        'floor'
    }

    /**
     * Decimal adjustment of a number.
     * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil
     * @param {String}  type  The type of adjustment.
     * @param {Number}  value The number.
     * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
     * @returns {Number} The adjusted value.
     */
    function decimalAdjust(type: ADJUSTMENT_TYPE, value: any, exp: number): number {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[ADJUSTMENT_TYPE[type]](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[ADJUSTMENT_TYPE[type]](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    return {
        generate: generate
    };

})();
import { runeStyle, vowelStyle } from './constants.js';
import { sin60, cos60, csc60 } from './trig.js';
import { runeCircleRatio } from './constants.js';

const noShift = { x: 0, y: 0 };

// runeStyle > pointId > shift
export const styleShift = {
    [runeStyle.SMALL]: {
        8: { x: 0, y: -2 * cos60 },
        9: { x: 0, y: -2 * cos60 },
        10: { x: 0, y: -2 * cos60 },
        11: { x: 0, y: -2 * cos60 },
        12: { x: 0, y: -2 * cos60 }
    }
}

export function getStyleShift(segment, pointId) {
    const currentStyle = segment.props.runeStyle;

    if (styleShift[currentStyle] != null && styleShift[currentStyle][pointId] != null) {
        return styleShift[currentStyle][pointId];
    }

    return noShift;
}

// vowelStyle > pointId > segId > shift
export const vowelShift = {
    [vowelStyle.HIGH_CIRCLE]: {
        12: {
            8: { x: -cos60 * runeCircleRatio, y: -(csc60 * cos60 ** 2) * runeCircleRatio },
            9: { x: 0, y: -(1 + csc60) * runeCircleRatio },
            10: { x: +cos60 * runeCircleRatio, y: -(csc60 * cos60 ** 2) * runeCircleRatio },
            circle: { x: 0, y: -csc60 * runeCircleRatio }
        }
    },
    [vowelStyle.MID_CIRCLE]: {
        12: {
            8: { x: -sin60 * runeCircleRatio, y: -cos60 * runeCircleRatio },
            9: { x: 0, y: -runeCircleRatio },
            10: { x: +sin60 * runeCircleRatio, y: -cos60 * runeCircleRatio },
        }
    },
    [vowelStyle.LOW_CIRCLE]: {
        12: {
            circle: { x: 0, y: runeCircleRatio }
        }
    },
    [vowelStyle.HIGH_DIAMOND]: {// Fix
        12: {
            8: { x: -sin60 / 2, y: -cos60 / 2 },
            9: { x: 0, y: - 1 / 2 },
            10: { x: +sin60 / 2, y: -cos60 / 2 },
            diamond: { x: 0, y: -cos60 / 2 }
        }
    },
    [vowelStyle.MID_DIAMOND]: { // Check
        12: {
            8: { x: -sin60 / 4, y: -cos60 / 4 },
            9: { x: 0, y: - 1 / 4 },
            10: { x: +sin60 / 4, y: -cos60 / 4 },
        }
    },
    [vowelStyle.LOW_DIAMOND]: { // Fix
        12: {
            diamond: { x: 0, y: cos60 / 2 }
        }
    }
}

export function getVowelShift(segment, pointId) {
    const currentStyle = segment.props.vowelStyle;
    const segId = segment.segId;

    if (vowelShift[currentStyle] != null && vowelShift[currentStyle][pointId] != null && vowelShift[currentStyle][pointId][segId] != null) {
        return vowelShift[currentStyle][pointId][segId];
    }

    return noShift;
}

export const styleOpacity = {
    [runeStyle.SMALL]: {
        x: 0,
        midline: 0,
        '5l': 0
    }
}

export function getVowelOpacity(segment) {
    const segId = segment.segId;
    const currentStyle = segment.props.vowelStyle;

    console.log(segId === 'circle' && [vowelStyle.LOW_CIRCLE, vowelStyle.MID_CIRCLE, vowelStyle.HIGH_CIRCLE].includes(currentStyle))
    console.log(segId === 'diamond' && [vowelStyle.MID_DIAMOND].includes(currentStyle))
    if (segId === 'circle' && [vowelStyle.LOW_CIRCLE, vowelStyle.MID_CIRCLE, vowelStyle.HIGH_CIRCLE].includes(currentStyle) ||
        segId === 'diamond' && [vowelStyle.MID_DIAMOND].includes(currentStyle)) {
        return 1.0;
    }

    return 0.0;
}

export function getStyleOpacity(segment) {
    const currentStyle = segment.props.runeStyle;


}
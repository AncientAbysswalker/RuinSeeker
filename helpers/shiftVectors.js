import { runeStyle, vowelStyle } from './constants.js';
import { sin60, cos60 } from './trig.js';

const noShift = { x: 0, y: 0 };

// By point not segId
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

export const circleShift = {

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
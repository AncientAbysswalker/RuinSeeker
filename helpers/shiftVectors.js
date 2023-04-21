import { runeStyle, vowelStyle } from './constants.js';
import { sin60, cos60 } from './trig.js';

export const styleShift = {
    [runeStyle.SMALL]: {
        8: { x: 0, y: -2 * cos60 },
        9: { x: 0, y: -2 * cos60 },
        10: { x: 0, y: -2 * cos60 },
        11: { x: 0, y: -2 * cos60 },
        12: { x: 0, y: -2 * cos60 },
        c: { x: 0, y: -2 * cos60 }
    }
}

export const styleOpacity = {
    [runeStyle.SMALL]: {
        x: 0,
        midline: 0,
        '5l': 0
    }
}
import Vector from '../Vector.js';
import { sin60, cos60 } from '../helpers/trig.js';
import { runeCircleRatio } from '../helpers/constants.js';
import { getStyleShift, getVowelShift, styleOpacity } from '../helpers/shiftVectors.js';

// Vectors representing the vertices of the Rune model - see image
const runeVert = [
    new Vector(sin60, 0),
    new Vector(0, cos60),
    new Vector(2 * sin60, cos60),
    new Vector(sin60, 2 * cos60),

    new Vector(0, 3 * cos60),
    new Vector(sin60, 3 * cos60),
    new Vector(2 * sin60, 3 * cos60),

    new Vector(0, 4 * cos60),
    new Vector(sin60, 4 * cos60),
    new Vector(2 * sin60, 4 * cos60),

    new Vector(0, 5 * cos60),
    new Vector(2 * sin60, 5 * cos60),
    new Vector(sin60, 6 * cos60)
]

// SVG Lines representing the lines of the Rune model by byte - see image
const bitToPos = {
    '0': [runeVert[0], runeVert[1]],
    '1': [runeVert[0], runeVert[3]],
    '2': [runeVert[0], runeVert[2]],
    '3': [runeVert[1], runeVert[3]],
    '4': [runeVert[2], runeVert[3]],

    '5u': [runeVert[1], runeVert[4]],
    '5l': [runeVert[7], runeVert[10]],

    'x': [runeVert[3], runeVert[5]],
    'midline': [runeVert[4], runeVert[6]],

    '6': [runeVert[8], runeVert[10]],
    '7': [runeVert[8], runeVert[11]],
    '8': [runeVert[10], runeVert[12]],
    '9': [runeVert[8], runeVert[12]],
    '10': [runeVert[11], runeVert[12]],
    'circle': runeVert[12]
}

const bitToInd = {
    '0': [0, 1],
    '1': [0, 3],
    '2': [0, 2],
    '3': [1, 3],
    '4': [2, 3],

    '5u': [1, 4],
    '5l': [7, 10],

    'x': [3, 5],
    'midline': [4, 6],

    '6': [8, 10],
    '7': [8, 11],
    '8': [10, 12],
    '9': [8, 12],
    '10': [11, 12],
    'circle': 12
}

/**
 * A point with associated point id
 * @typedef {Object} IdPoint
 * @property {string} id Id of the point
 * @property {number} x X position
 * @property {number} y Y position
 */

/**
 * `SVG`
 * 
 * SVG Class defining the straight lines that make up a rune
 * 
 * @property {ControllerProps} props
 * @property {string} segId Segment ID
 * @property {boolean} respectVowel Does this Rune have a vowel marker to respect?
 * @property {IdPoint} p1 First point of the line
 * @property {IdPoint} p2 Second point of the line
 */
SVG.RuneLine = class extends SVG.Line {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     * 
     * @param {ControllerProps} props
     * @param {string} segId Segment ID
     * @param {boolean} respectVowel Does this Rune have a vowel marker to respect?
     */
    init(props, segId, respectVowel) {
        this.props = props;

        this.segId = segId;
        this.respectVowel = respectVowel || false;
        this.data('segId', segId, true)
        this.p1 = {
            id: bitToInd[segId][0],
            x: 0,
            y: 0
        };
        this.p2 = {
            id: bitToInd[segId][1],
            x: 0,
            y: 0
        };
        this.active = true;

        return this.updateSegment();
    }

    /**
     * Triggers an update to all the features of the figure. Depends on data contained in ControllerProps
     * 
     * @param {boolean=} animate Whether to animate this update or not.
     * 
     * @returns this
     */
    updateSegment(animate) {
        const a = animate || false;

        // Property Updates
        this.updateStroke();
        this.updateRuneStyle();
        this.updateBasePositions();

        // Run SVG Update
        this.updateSVG(a);

        return this;
    }

    /**
     * Update the stroke thickness to the current value. Depends on sizing data contained in ControllerProps
     * 
     * @returns this
     */
    updateStroke() {
        const lineWidth = this.props.lineWidth;
        this.stroke({ width: lineWidth });

        return this;
    }

    /**
     * Update the endpoints of this segment based on thickness and character size values
     * 
     * @returns this
     */
    updateBasePositions() {
        this.p1.x = bitToPos[this.segId][0].x;
        this.p1.y = bitToPos[this.segId][0].y;
        this.p2.x = bitToPos[this.segId][1].x;
        this.p2.y = bitToPos[this.segId][1].y;

        // Style Shift - Both points equally affected (for now)
        const styleShiftP1 = getStyleShift(this, this.p1.id);
        const styleShiftP2 = getStyleShift(this, this.p2.id);
        this.p1.x += styleShiftP1.x;
        this.p1.y += styleShiftP1.y;
        this.p2.x += styleShiftP2.x;
        this.p2.y += styleShiftP2.y;

        // Vowel Shift
        if (this.respectVowel) {
            const vowelShiftP1 = getVowelShift(this, this.p1.id);
            const vowelShiftP2 = getVowelShift(this, this.p2.id);
            this.p1.x += vowelShiftP1.x;
            this.p1.y += vowelShiftP1.y;
            this.p2.x += vowelShiftP2.x;
            this.p2.y += vowelShiftP2.y;
        }

        return this;
    }

    /**
     * Triggers an update to the sizing of the figure. Depends on sizing data contained in ControllerProps
     * 
     * @param {boolean=} animate Whether to animate this update or not.
     * 
     * @returns this
     */
    updateSVG(animate) {
        const r = animate ? this.animate() : this;

        const segmentLength = this.props.segmentLength;
        const lineWidth = this.props.lineWidth;

        r.plot(
            lineWidth / 2 + (segmentLength * this.p1.x),
            lineWidth / 2 + (segmentLength * this.p1.y),
            lineWidth / 2 + (segmentLength * this.p2.x),
            lineWidth / 2 + (segmentLength * this.p2.y)
        ).opacity(
            +this.active
        );

        return this;
    }

    /**
     * Update the style of the segment. Depends on data contained in ControllerProps
     * 
     * @returns this
     */
    updateRuneStyle() {
        // Style
        const currentStyle = this.props.runeStyle;
        const currentStyleOpacity = styleOpacity[currentStyle];

        this.active = (currentStyleOpacity && currentStyleOpacity[this.segId] != null) ? currentStyleOpacity[this.segId] : 1;

        return this;
    }
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    runeline: function (props, segId, respectVowel) {
        return this.put(new SVG.RuneLine).init(props, segId, respectVowel);
    }
});
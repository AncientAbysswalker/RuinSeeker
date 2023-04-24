import Vector from '../Vector.js';
import { sin60, cos60 } from '../helpers/trig.js';
import { runeCircleRatio } from '../helpers/constants.js';
import { getStyleShift, styleOpacity } from '../helpers/shiftVectors.js';

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

        return this.updateStroke().updateBasePositions().updateSizing();
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

        // TODO: I hate this - make this better soon
        if (this.respectVowel) {
            if (this.p1.id === 12 && this.segId === 8) {
                this.p1.x -= sin60 * runeCircleRatio;
                this.p1.y -= cos60 * runeCircleRatio;
            }
            if (this.p2.id === 12 && this.segId === 8) {
                this.p2.x -= sin60 * runeCircleRatio;
                this.p2.y -= cos60 * runeCircleRatio;
            }
            if (this.p1.id === 12 && this.segId === 9) {
                this.p1.y -= runeCircleRatio;
            }
            if (this.p2.id === 12 && this.segId === 9) {
                this.p2.y -= runeCircleRatio;
            }
            if (this.p1.id === 12 && this.segId === 10) {
                this.p1.x += sin60 * runeCircleRatio;
                this.p1.y -= cos60 * runeCircleRatio;
            }
            if (this.p2.id === 12 && this.segId === 10) {
                this.p2.x += sin60 * runeCircleRatio;
                this.p2.y -= cos60 * runeCircleRatio;
            }
        }

        return this;
    }

    /**
     * Triggers an update to the sizing of the figure. Depends on sizing data contained in ControllerProps
     * 
     * @param {SVG.Runner} runner If this event is to be animated, pass it an SVG.Runner to control the animation
     * 
     * @returns this
     */
    updateSizing(runner) {
        const r = runner || this;

        const segmentLength = this.props.segmentLength;
        const lineWidth = this.props.lineWidth;

        r.plot(
            lineWidth / 2 + (segmentLength * this.p1.x),
            lineWidth / 2 + (segmentLength * this.p1.y),
            lineWidth / 2 + (segmentLength * this.p2.x),
            lineWidth / 2 + (segmentLength * this.p2.y)
        )

        return this;
    }

    /**
     * Update the style of the RuneLine. This will update the base positions of the RuneLine's points
     * 
     * @returns this
     */
    updateRuneStyle() {
        const runner = this.animate();

        // Style
        const currentStyle = this.props.runeStyle;
        const currentStyleOpacity = styleOpacity[currentStyle];

        // Handle opacity
        runner.opacity((currentStyleOpacity && currentStyleOpacity[this.segId] != null) ? currentStyleOpacity[this.segId] : 1);
        // if (this.segId === 'x' || this.segId === 'midline' || this.segId === '5l') {
        //     if (this.props.runeStyle === 1) {
        //         runner.opacity(0);
        //     } else if (this.opacity() === 0) {
        //         runner.opacity(1);
        //     }
        // }

        this.updateBasePositions().updateSizing(runner);

        return this;
    }
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    runeline: function (props, segId, respectVowel) {
        return this.put(new SVG.RuneLine).init(props, segId, respectVowel);
    }
});
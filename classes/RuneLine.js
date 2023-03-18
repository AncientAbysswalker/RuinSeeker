import Vector from '../Vector.js';
import { sin60, cos60 } from '../helpers/constants.js';

// Vectors representing the vertices of the Rune model - see image
const diagFactor = Math.sqrt(3) / 2;
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
 * `SVG`
 * 
 * SVG Class defining the straight lines that make up a rune
 * 
 * @property {string} segId Segment ID
 */
SVG.RuneLine = class extends SVG.Line {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     * 
     * @param {props} props Props passed from the constructor
     * @param {string} segId Segment ID
     */
    init(props, segId) {
        this.props = props;

        this.segId = segId;
        this.data('segId', segId, true)
        this.p1 = {
            id: bitToInd[segId][0]
        };
        this.p2 = {
            id: bitToInd[segId][1]
        };

        // Style choices
        this.runeStyle = 0;

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
        if (this.runeStyle === 0) {
            this.p1.x = bitToPos[this.segId][0].x;
            this.p1.y = bitToPos[this.segId][0].y;
            this.p2.x = bitToPos[this.segId][1].x;
            this.p2.y = bitToPos[this.segId][1].y;

            console.log(this.p1.id)
            console.log(this.p2.id)
            if (this.p1.id == 12 && this.segId == 8) {
                this.p1.x -= cos60 * cos60 / 2;
                this.p1.y -= sin60 * cos60 / 2;
            }
            if (this.p2.id == 12 && this.segId == 8) {
                this.p2.x -= sin60 / 4;
                this.p2.y -= cos60 / 4;
            }
            if (this.p1.id == 12 && this.segId == 9) {
                this.p1.x -= cos60 * cos60 / 2;
                this.p1.y -= sin60 * cos60 / 2;
            }
            if (this.p1.id == 12 && this.segId == 9) {
                console.log(9)
                this.p1.y -= cos60 / 2;
            }
            if (this.p2.id == 12 && this.segId == 9) {
                console.log(8)
                this.p2.y -= cos60 / 2;
            }
        } else {
            console.log('special')
            console.log(this.p1.id)
            console.log(this.p2.id)
            this.p1.x = bitToPos[this.segId][0].x;
            this.p1.y = bitToPos[this.segId][0].y - (this.p1.id > 7 ? 2 * cos60 : 0);
            this.p2.x = bitToPos[this.segId][1].x;
            this.p2.y = bitToPos[this.segId][1].y - (this.p2.id > 7 ? 2 * cos60 : 0);
        }

        return this;
    }

    /**
     * Update the endpoints of this segment based on thickness and character size values
     * 
     * @returns this
     */
    updateBasePositionsE(x1, y1, x2, y2) {
        console.log(9999)
        this.p1.x = x1
        this.p1.y = y1
        this.p2.x = x2
        this.p2.y = y2

        return this;
    }

    /**
     * Triggers an update to the sizing of the figure. Depends on sizing data contained in ControllerProps
     * 
     * @returns this
     */
    updateSizing(shouldAnimate) {
        const runeScale = this.props.runeScale;
        const lineWidth = this.props.lineWidth;
        const newPlot = [
            lineWidth / 2 + (runeScale * this.p1.x),
            lineWidth / 2 + (runeScale * this.p1.y),
            lineWidth / 2 + (runeScale * this.p2.x),
            lineWidth / 2 + (runeScale * this.p2.y)
        ];

        // Oddly animate() does not work externally on updateSizing(), so it is invoked as an argument for now
        if (shouldAnimate) {
            this.animate().plot(...newPlot)
        } else {
            this.plot(...newPlot)
        }

        return this;
    }

    /**
     * Update the style of the RuneLine. This will update the base positions of the RuneLine's points
     * 
     * @returns this
     */
    updateRuneStyle() {
        this.runeStyle = this.props.runeStyle;

        // Handle opacity
        if (this.segId === 'x' || this.segId === 'midline' || this.segId === '5l') {
            if (this.runeStyle === 1) {
                this.animate().opacity(0);
            } else if (this.opacity() === 0) {
                this.animate().opacity(1);
            }
        }

        this.updateBasePositions().updateSizing(true);

        return this;
    }
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    runeline: function (props, segId) {
        return this.put(new SVG.RuneLine).init(props, segId);
    }
});
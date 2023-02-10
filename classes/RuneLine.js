import Vector from '../Vector.js';

// Vectors representing the vertices of the Rune model - see image
const diagFactor = Math.sqrt(3) / 2;
const runeVert = [
    new Vector(diagFactor, 0),
    new Vector(0, 0.5),
    new Vector(2 * diagFactor, 0.5),
    new Vector(diagFactor, 1),

    new Vector(0, 1.5),
    new Vector(diagFactor, 1.5),
    new Vector(2 * diagFactor, 1.5),

    new Vector(0, 2),
    new Vector(diagFactor, 2),
    new Vector(2 * diagFactor, 2),

    new Vector(0, 2.5),
    new Vector(2 * diagFactor, 2.5),
    new Vector(diagFactor, 3)
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
        this.stroke({ linecap: 'round', color: '#000000' });

        return this.updateStroke().updateAnchors();
    }
    /**
     * `Method`
     * 
     * Update the stroke thickness to the current value
     */
    updateStroke() {
        const lineWidth = this.props.lineWidth
        this.stroke({ width: lineWidth });

        return this;
    }
    /**
     * `Method`
     * 
     * Update the endpoints of this segment based on thickness and character size values
     */
    updateAnchors() {
        const runeScale = this.props.runeScale
        const lineWidth = this.props.lineWidth
        this.attr({
            x1: lineWidth / 2 + (runeScale * bitToPos[this.segId][0].x),
            y1: lineWidth / 2 + (runeScale * bitToPos[this.segId][0].y),
            x2: lineWidth / 2 + (runeScale * bitToPos[this.segId][1].x),
            y2: lineWidth / 2 + (runeScale * bitToPos[this.segId][1].y)
        });

        return this;
    }
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    runeline: function (props, segId) {
        return this.put(new SVG.RuneLine).init(props, segId);
    }
});
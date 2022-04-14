

const RUNE_WIDTH_FACTOR = Math.sqrt(3) / 2;
let RUNE_SCALE = 25; // Runes are 3 * RUNE_SCALE tall
let RUNE_LINE_WIDTH = 5;
let RUNE_WIDTH_PERCENT_SPACE = 50;
let RUNE_HEIGHT_PERCENT_NEWLINE = 50;

// Delete above later

import Vector from './Vector.js';

// Vectors representing the vertices of the Rune model - see image
const runeVert = [
    new Vector(RUNE_WIDTH_FACTOR * RUNE_SCALE, 0),
    new Vector(0, 0.5 * RUNE_SCALE),
    new Vector(2 * RUNE_WIDTH_FACTOR * RUNE_SCALE, 0.5 * RUNE_SCALE),
    new Vector(RUNE_WIDTH_FACTOR * RUNE_SCALE, 1 * RUNE_SCALE),

    new Vector(0, 1.5 * RUNE_SCALE),
    new Vector(RUNE_WIDTH_FACTOR * RUNE_SCALE, 1.5 * RUNE_SCALE),
    new Vector(2 * RUNE_WIDTH_FACTOR * RUNE_SCALE, 1.5 * RUNE_SCALE),

    new Vector(0, 2 * RUNE_SCALE),
    new Vector(RUNE_WIDTH_FACTOR * RUNE_SCALE, 2 * RUNE_SCALE),
    new Vector(2 * RUNE_WIDTH_FACTOR * RUNE_SCALE, 2 * RUNE_SCALE),

    new Vector(0, 2.5 * RUNE_SCALE),
    new Vector(2 * RUNE_WIDTH_FACTOR * RUNE_SCALE, 2.5 * RUNE_SCALE),
    new Vector(RUNE_WIDTH_FACTOR * RUNE_SCALE, 3 * RUNE_SCALE)
]

// SVG Lines representing the lines of the Rune model by byte - see image
const bitToLine = [
    [CreateLineSVG(runeVert[0], runeVert[1])],
    [CreateLineSVG(runeVert[0], runeVert[3])],
    [CreateLineSVG(runeVert[0], runeVert[2])],
    [CreateLineSVG(runeVert[1], runeVert[3])],
    [CreateLineSVG(runeVert[2], runeVert[3])],

    [CreateLineSVG(runeVert[1], runeVert[4]), CreateLineSVG(runeVert[7], runeVert[10])],

    [CreateLineSVG(runeVert[8], runeVert[10])],
    [CreateLineSVG(runeVert[8], runeVert[11])],
    [CreateLineSVG(runeVert[10], runeVert[12])],
    [CreateLineSVG(runeVert[8], runeVert[12])],
    [CreateLineSVG(runeVert[11], runeVert[12])],
    [CreateLittleCircle()]
]

// Special SVG Lines - see image
const middleLine = CreateLineSVG(runeVert[4], runeVert[6]);
const specialLine = CreateLineSVG(runeVert[3], runeVert[5]);

/**
 * Helper function to generate an SVG group
 * @return {Element} - SVG <g> tag
 */
function CreateSVGGroup() {
    var runeSVG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    runeSVG.setAttribute('stroke', 'black');
    runeSVG.setAttribute('stroke-width', RUNE_LINE_WIDTH);
    runeSVG.setAttribute('stroke-linecap', 'round');

    return runeSVG;
}

/**
 * Helper function to generate an SVG line
 * @param {Vector} v1 - Line starting point
 * @param {Vector} v2 - Line ending point
 * @return {Element} - SVG <line> tag
 */
function CreateLineSVG(v1, v2) {
    var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    newLine.setAttribute('x1', v1.x);
    newLine.setAttribute('y1', v1.y);
    newLine.setAttribute('x2', v2.x);
    newLine.setAttribute('y2', v2.y);
    return newLine;
}

/**
 * Helper function to generate a small circle for vowel-reversal
 * @return {Element} - SVG <circle> tag
 */
function CreateLittleCircle() {
    var newCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    newCircle.setAttribute('cx', RUNE_WIDTH_FACTOR * RUNE_SCALE);
    newCircle.setAttribute('cy', 3 * RUNE_SCALE);
    newCircle.setAttribute('r', RUNE_WIDTH_FACTOR * RUNE_SCALE / 4);
    newCircle.setAttribute('fill', 'white');

    return newCircle;
}

/**
 * Class representing a standard Rune
 * @prop {binary} byteCode - The binary representation of the Rune
 * @prop {Element} runeSVG - Overall SVG <g> Element of the Rune
 * @prop {Element[]} runeSubSVGList - List of SVG Elements making up runeSVG
 * @prop {number} runeIndex - Index of the Rune in a given word. Used to determine shift when combining with other Runes
 */
class RunicChar {
    /**
     * Create a RunicChar.
     * @param {binary} byteCode - The binary representation of the Rune
     * @param {number} runeIndex - Index of the Rune in a given word. Used to determine shift when combining with other Runes
     */
    constructor(byteCode, runeIndex) {
        this.byteCode = byteCode;
        this.runeIndex = runeIndex;
        this.runeSVG = CreateSVGGroup();
        this.runeSubSVGList = [];

        // Standard 11 Lines and Inversion Circle based on byteCode
        for (let i = 0; i < bitToLine.length; i++) {
            if (byteCode & 2 ** i) {
                this.runeSubSVGList.push.apply(this.runeSubSVGList, bitToLine[i].map((node) => {
                    return node.cloneNode(true);
                }));
            }
        }

        // Little Extra Line if either Vertical Line Present
        if ((byteCode & 2) || (byteCode & 2 ** 9)) {
            this.runeSubSVGList.push(specialLine.cloneNode(true))
        }

        // Horizontal Line, always present
        this.runeSubSVGList.push(middleLine.cloneNode(true))

        // Attach to SVG grouping
        this.runeSubSVGList.forEach((svg) => {
            this.runeSVG.appendChild(svg);
        });

        // Shift the rune based on its index
        this.setPosition(runeIndex * 2 * RUNE_WIDTH_FACTOR * RUNE_SCALE, 0);
    }

    /**
     * Set the position of the Rune explicitly withing it's relative grouping
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    setPosition(x, y) {
        this.runeSVG.setAttribute('transform', 'translate (' + x + ' ' + y + ')');
    }

    /**
     * Sets the color attribute of the RunicChar.
     * @param {string} color - Any acceptable HTML color string, uncluding 'red' and '#456543'
     */
    setColor(color) {
        this.runeSVG.setAttribute('stroke', color);
    }

    /**
     * Clears the color attribute of the RunicChar, allowing the color of the word to take precedence
     */
    clearColor() {
        this.runeSVG.setAttribute('stroke', 'currentColor');
    }
}

export default RunicChar;
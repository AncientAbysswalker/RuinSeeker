const RUNE_WIDTH_FACTOR = Math.sqrt(3) / 2;
let RUNE_SCALE = 25; // Runes are 3 * RUNE_SCALE tall
let RUNE_LINE_WIDTH = 5;
let RUNE_WIDTH_PERCENT_SPACE = 50;
let RUNE_HEIGHT_PERCENT_NEWLINE = 50;

/**
 * SVG Metadata for the custom Runes
 * @typedef {Object} UniqueRuneSVGReference
 * @property {Element} svg - SVG Data in the form of a <g> tag
 * @property {number} height - Base height of the original SVG
 * @property {number} width - Base width of the original SVG
 * @property {number} pad - Preferred padding one left and right of Rune
 * @property {number} defaultScale - Preferred scaling if not intended to fill full-height of 3 * RUNE_SCALE. Decimal value with 1 being 100%
 */

/**
 * @type {UniqueRuneSVGReference} 
 */
let oldKey = {
    svg: generateUniqueCharSVGReference('assets/svg/oldkey.svg'),
    height: 100,
    width: 40.990597,
    pad: 10,
    defaultScale: 1
}
/**
 * @type {UniqueRuneSVGReference} 
 */
let prisonKey = {
    svg: generateUniqueCharSVGReference('assets/svg/prisonkey.svg'),
    height: 90,
    width: 97.175446,
    pad: 10,
    defaultScale: 0.8
}
/**
 * @type {UniqueRuneSVGReference} 
 */
let skull = {
    svg: generateUniqueCharSVGReference('assets/svg/skull.svg'),
    height: 100,
    width: 78.880165,
    pad: 10,
    defaultScale: 1
}

/**
 * Helper function to generate the reference SVG data given a path to an SVG source file
 * @param {string} srcPath - Path to the SVG source data file
 * @return {Element} - SVG Data in the form of a <g> tag
 */
function generateUniqueCharSVGReference(srcPath) {
    let svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svgGroup.setAttribute('id', 'layer1')
    svgGroup.onload = () => {
        console.log("load");
    };
    let svgSrc = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    svgSrc.setAttribute('href', srcPath + '#layer1');
    svgGroup.appendChild(svgSrc);

    return svgGroup;
}

let UniqueRunes = {
    '💀': skull,
    '🗝': oldKey,
    '🔅': prisonKey
};

class SpecialRunicChar {
    constructor(originChar, currentLeftMargin) {
        this.originChar = originChar;
        let metadata = UniqueRunes[originChar];
        this.svg = metadata.svg;
        this.height = metadata.height;
        this.width = metadata.width;
        this.pad = metadata.pad;
        this.defaultScale = metadata.defaultScale;
        this.runeSubSVGList = [];
        this.runeSVG = null;

        // Horizontal Line
        //this.runeSubSVGList.push(metadata.svg.cloneNode(true))

        // Attach to SVG Tag and set initial shift position
        this.runeSVG = this.svg.cloneNode(true);
        // this.runeSVG.addEventListener('load', function () {
        //     console.log(9999)
        // });
        //this.attachToTAG_SVG(TAG_SVG);
        this.adjustCharacterPosition(currentLeftMargin);

        // this.setColor.bind(this)
        // this.clearColor.bind(this)
        // this.runeSVG.addEventListener('mouseover', () => this.setColor('red'));
        // this.runeSVG.addEventListener('mouseout', () => this.clearColor());
    }

    attachToTAG_SVG(TAG_SVG) {
        this.runeSubSVGList.forEach((svg) => {
            this.runeSVG.appendChild(svg);
        });
        //TAG_SVG.appendChild(this.runeSVG);
    }

    adjustCharacterPosition(currentLeftMargin) {
        console.log("scale" + ((RUNE_SCALE * 3 + RUNE_LINE_WIDTH) * this.defaultScale) / this.height)
        this.runeSVG.setAttribute("transform", "translate (" + (currentLeftMargin + 1 * (RUNE_SCALE * 3 + RUNE_LINE_WIDTH) * this.pad * this.defaultScale / this.height) + ' ' + ((RUNE_SCALE * 3 + RUNE_LINE_WIDTH) * (1 - this.defaultScale)) / 2 + ") scale(" + ((RUNE_SCALE * 3 + RUNE_LINE_WIDTH) * this.defaultScale) / this.height + ")");
        //currentLeftMargin += this.width + 2 * this.pad;
    }

    /**
     * Sets the color attribute of the RunicChar.
     * @param {string} color - Any acceptable HTML color string, uncluding 'red' and '#456543'
     */
    setColor(color) {
        console.log(9)
        this.runeSVG.setAttribute('fill', color);
    }

    /**
     * Clears the color attribute of the RunicChar, allowing the color of the word to take precedence
     */
    clearColor() {
        this.runeSVG.setAttribute('fill', 'currentColor');
    }
}


export default SpecialRunicChar;
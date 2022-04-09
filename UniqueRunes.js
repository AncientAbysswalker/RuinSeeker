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
    let svgSrc = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    svgSrc.setAttribute('href', srcPath + '#layer1');
    svgGroup.appendChild(svgSrc);

    return svgGroup;
}

let UniqueRunes = {
    skull,
    oldKey,
    prisonKey
};
export default UniqueRunes;
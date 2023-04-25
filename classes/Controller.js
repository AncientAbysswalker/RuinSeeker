import './RuneWord.js';
import './Whitespace.js';
import './SpecialRune.js';
import { sin60 } from '../helpers/trig.js';
import { runeStyle, vowelStyle } from '../helpers/constants.js';
import { regexIdentifyGroups, regexValidComposite } from '../helpers/regex.js';

const regexWord = new RegExp(/[a-zA-Z]+/);
const regexWhitespace = new RegExp(/\s+/);
const regexSpecialRune = new RegExp(/\{\{[a-zA-Z]+\}\}/);
const regexValidComposition = regexValidComposite(regexWord, regexWhitespace, regexSpecialRune);
const regexIdentifyFigures = regexIdentifyGroups(regexWord, regexWhitespace, regexSpecialRune);

// TODO REMOVE
let RUNE_WIDTH_PERCENT_SPACE = 50;
let RUNE_HEIGHT_PERCENT_NEWLINE = 50;


/**
 * A point with associated point id
 * @typedef {Object} ControllerProps
 * @property {enum} runeStyle Style of the rune
 * @property {enum} vowelStyle Style of the vowel markers
 * @property {number} segmentLength Scale for the RuneLine segments
 * @property {number} fullHeight Full height of a rune, including segment lengths and line width
 * @property {number} fullWidth Full width of a rune, including segment lengths and line width
 * @property {number} innerWidth Inner width of a rune, including segment lengths and excluding line width
 * @property {number} lineWidth Stroke width for the RuneLine segments
 * @property {Object} ipaDict Dictionary of words to phoneme representations
 */

/**
 * `SVG`
 * 
 * SVG Class defining the controller. The controller is the top level SVG that controls the positioning of RuneWords, whitespace, and SpecialRuneGroups
 * 
 * @property {string} fullText Full string text that is being translated
 * @property {SVG.Figure[]} allFiguresList List of all figures contained in the translation
 * @property {Object} specialRuneSVGMap Dictionary of special rune names to string representations of SVG data
 * @property {ControllerProps} props ControllerProps
 */
SVG.Controller = class extends SVG.Svg {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     * 
     * @param {number} segmentLength Initial scale for the RuneLine segments
     * @param {number} lineWidth Initial stroke width for the RuneLine segments
     * @param {Object} ipaDict Dictionary of words to phoneme representations
     * @param {Object} specialRuneSVGMap Dictionary of special rune names to string representations of SVG data
     */
    init(segmentLength, lineWidth, ipaDict, specialRuneSVGMap) {
        this.fullText = '';
        this.allFiguresList = [];
        this.specialRuneSVGMap = specialRuneSVGMap;
        this.props = {
            runeStyle: runeStyle.STANDARD,
            vowelStyle: vowelStyle.MID_CIRCLE,
            segmentLength: segmentLength,
            lineWidth: lineWidth,
            ipaDict: ipaDict
        };

        this.stroke({ color: '#000000' }).updateScaleProps(segmentLength, lineWidth);

        return this;
    }

    /**
     * Generate a translation of the provided text
     * 
     * @param {string} rawText Raw string to translate
     * 
     * @returns this
     */
    generate(rawText, successCallback, failureCallback) {
        // Clear previous contents before generating new ones
        this.clear();

        // Lists of things with no proper translation
        let noTranslation = [];

        // Exit early if there is nothing to generate off of
        if (rawText.length === 0) {
            failureCallback('');
            return this;
        }

        // Validate the user input passes requirements for generation
        if (regexValidComposition.test(rawText)) {
            let textSplitToGroups = rawText.match(regexIdentifyFigures);

            // Address each group
            textSplitToGroups.forEach((groupText) => {
                if (regexWhitespace.test(groupText)) {
                    this.pushWhiteSpace(groupText);
                } else if (regexSpecialRune.test(groupText)) {
                    let successful = this.pushSpecialRune(groupText);
                    if (!successful) {
                        noTranslation.push(groupText);
                    }
                } else {
                    let successful = this.pushRuneWord(groupText);
                    if (!successful) {
                        noTranslation.push(groupText);
                    }
                }
            });

            // Update the positioning of each Figure
            this.updateFigureRoots();

            if (noTranslation.length > 0) {
                failureCallback('The following cannot be tranlated: ' + noTranslation.join(', '));
                console.error('The current string fails to pass the generation requirements.');
                return this;
            }
        } else {
            failureCallback('The current string fails to pass the generation requirements.');
            console.error('The current string fails to pass the generation requirements.');
            return this;
        }

        successCallback();
        this.creationFadeIn();

        return this;
    }

    /**
     * Push a new RuneWord onto the allFiguresList. Returns if the translation was successful
     * 
     * @param {string} groupText Text to translate into a Figure
     * 
     * @returns boolean
     */
    pushRuneWord(groupText) {
        let newRuneWord = this.runeword(this.props, groupText);

        this.allFiguresList.push(newRuneWord);

        return newRuneWord.currentPhones !== undefined
    }

    /**
     * Push a new Whitespace onto the allFiguresList
     * 
     * @param {string} groupText Text to translate into a Figure
     */
    pushWhiteSpace(groupText) {
        let newWhitespace = this.whitespace(this.props, groupText);

        this.allFiguresList.push(newWhitespace);
        return true;
    }

    /**
     * Push a new SpecialRune onto the allFiguresList. Returns if the translation was successful
     * 
     * @param {string} groupText Text to translate into a Figure
     * 
     * @returns boolean
     */
    pushSpecialRune(groupText) {
        const specialRuneName = groupText.replace(/^\{+/, '').replace(/\}+$/, '').toLowerCase(); // Strip '{' and '}' characters
        const svgText = this.specialRuneSVGMap[specialRuneName];

        // Check if the special rune is valid - TODO: Should this be handled WITHIN the special rune??? 
        if (svgText) {
            let newSpecialRune = this.specialrune(this.props, specialRuneName, svgText);

            this.allFiguresList.push(newSpecialRune);
            return true;
        } else {
            console.error(`Special Rune ${groupText} does not have a defined SVG.`)
            return false;
        }
    }

    /**
     * Update the positioning of each Figure
     * 
     * @returns this
     */
    updateFigureRoots() {
        let rootX = 0;
        let rootY = 0;
        for (const currentFigure of this.allFiguresList) {
            if (currentFigure.isRuneWord() || currentFigure.isSpecialRune()) {
                // Set current position based on root
                currentFigure.x(rootX - currentFigure.leftDatum);
                currentFigure.y(rootY + currentFigure.topDatum);

                // Set next root
                rootX += currentFigure.rightDatum - currentFigure.leftDatum;
            } else if (currentFigure.isWhitespace()) {
                if (currentFigure.relevantNewlines > 0) {
                    // Set current position - special case of ignoring root
                    currentFigure.x(0);
                    currentFigure.y(currentFigure.relevantNewlines * 3 * this.props.segmentLength);

                    // Set next root
                    rootX = currentFigure.relevantSpaces * this.props.fullWidth * (RUNE_WIDTH_PERCENT_SPACE / 100); //TODO: Fix size and constants 
                    rootY += currentFigure.relevantNewlines * this.props.fullHeight * (1 + RUNE_HEIGHT_PERCENT_NEWLINE / 100);
                } else if (currentFigure.relevantSpaces > 0) {
                    // Set current position based on root
                    currentFigure.x(rootX);
                    currentFigure.y(rootX);

                    // Set next root
                    rootX += currentFigure.relevantSpaces * this.props.fullWidth * (RUNE_WIDTH_PERCENT_SPACE / 100); //TODO: Fix size and constants 
                } else {
                    console.error('How the heck did you get here?')
                }
            } else {
                console.error('How the heck did you get here?')
            }
        }
    }

    /**
     * Triggers an update to the sizing of all figures. Depends on sizing data contained in ControllerProps
     * 
     * @returns this
     */
    updateFigureSizing() {
        for (const currentFigure of this.allFiguresList) {
            currentFigure.updateSizing();
        }
    }

    /**
     * Triggers an update event. This will update the sizing and positioning of all figures, as well as update sizing data contained in ControllerProps
     * 
     * @param {number} segmentLength Scale for the RuneLine segments
     * @param {number} lineWidth Stroke width for the RuneLine segments
     * 
     * @returns this
     */
    resizeEvent(segmentLength, lineWidth) {
        // Update the scale props
        this.updateScaleProps(segmentLength, lineWidth);

        // Invoke a rescale event in all figures
        this.updateFigureSizing();
        this.updateFigureRoots();

        return this;
    }

    /**
     * Update scale properties based on passed parameters
     * 
     * @param {number} segmentLength Scale for the RuneLine segments
     * @param {number} lineWidth Stroke width for the RuneLine segments
     * 
     * @returns this
     */
    updateScaleProps(segmentLength, lineWidth) {
        this.props.segmentLength = segmentLength;
        this.props.fullHeight = 3 * segmentLength + lineWidth;
        this.props.innerWidth = 2 * sin60 * segmentLength;
        this.props.fullWidth = 2 * sin60 * segmentLength + lineWidth;
        this.props.lineWidth = lineWidth;

        return this
    }

    /**
     * Sets the color of this SVG to the provided value
     * 
     * @param {string} color HEX format color value - e.g. "DCA272" or "#DCA272"
     * 
     * @returns this
     */
    updateColor(color) {
        for (const currentFigure of this.allFiguresList) {
            currentFigure.updateColor(color);
        }

        return this;
    }

    /**
     * Clears the color of this SVG, falling back to the value of the parent SVG element
     * 
     * @returns this
     */
    clearColor() {
        for (const currentFigure of this.allFiguresList) {
            currentFigure.clearColor();
        }

        return this;
    }

    /**
     * Delete all Figures currently within the controller
     */
    clear() {
        for (const currentFigure of this.allFiguresList) {
            currentFigure.remove();
        }
        this.allFiguresList = [];
    }

    /** 
     * Update the style of all Figures
     * 
     * @param {number} runeStyle TODO: Actually pull from props in future!
     * 
     * @returns this
     */
    updateRuneStyle(runeStyle) {
        this.props.runeStyle = runeStyle;

        for (const currentFigure of this.allFiguresList) {
            currentFigure.updateRuneStyle();
        }

        return this;
    }

    /** 
     * Update the style of all Figures
     * 
     * @param {number} vowelStyle TODO: Actually pull from props in future!
     * 
     * @returns this
     */
    updateVowelStyle(vowelStyle) {
        this.props.vowelStyle = vowelStyle;

        for (const currentFigure of this.allFiguresList) {
            currentFigure.updateRuneStyle();
        }

        return this;
    }
}

// Extend the SVG definition to include a constructor for the controller as well as a creation fade in method
SVG.extend(SVG.Container, {
    controller: function (startingSegmentLength, startingLineWidth, ipaDict, specialRuneSVGMap) {
        // return this.put(new SVG.Controller).init(+slider.value, +slider2.value, 'assets/svg', ['skull']);
        return this.put(new SVG.Controller).init(startingSegmentLength, startingLineWidth, ipaDict, specialRuneSVGMap);
    },
    creationFadeIn: function () {
        return this.opacity(0).animate().opacity(1);
    }
});
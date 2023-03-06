import './RuneWord.js';
import './Whitespace.js';
import './SpecialRune.js';
import { sin60 } from '../helpers/constants.js';
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
 * `SVG`
 * 
 * SVG Class defining the controller. The controller is the top level SVG that controls the positioning of RuneWords, whitespace, and SpecialRuneGroups
 * 
 * @property {string[]} phones List of phones contained in this rune - length of the list is 1 or 2 phonemes
 * @property {binary} byteCode 12-bit binary representation of what segments are included in the rune
 */
SVG.Controller = class extends SVG.Svg {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     * 
     * @param {string[]} phones List of phones contained in this word - phones will be grouped according to rune phoneme rules
     */
    init(runeScale, lineWidth, ipaDict, specialRuneSVGMap) {
        this.fullText = '';
        this.allFiguresList = [];
        this.specialRuneSVGMap = specialRuneSVGMap;
        this.props = {
            runeScale: runeScale,
            lineWidth: lineWidth,
            ipaDict: ipaDict
        };

        this.stroke({ color: '#000000' }).updateScaleProps(runeScale, lineWidth);

        return this;
    }

    generate(rawText) {
        // Clear previous contents before generating new ones
        this.clear();

        // Exit early if there is nothing to generate off of
        if (rawText.length === 0) {
            console.error('No string length')
        }

        // Validate the user input passes requirements for generation
        if (regexValidComposition.test(rawText)) {
            // let textSplitToGroupsOld = (cleanedText.trim() === '') ? [] : cleanedText.replace(/[^\S\r\n]+$/g, '').split(/(\s+)|([\!\.\?\-\🗝\💀\🔅]+)/g).filter(element => element); // Split on spaces, removing any qty of spaces between 'words'
            // console.log(rawText.split(/(\s+)|(\{\{[a-zA-Z\s]+\}\})|([\!\.\?\-\🗝\💀\🔅]+)/g));
            let textSplitToGroups = rawText.match(regexIdentifyFigures);//.filter(element => element); // Filter removes phantom empty entries
            // let textSplitToGroups = rawText.split(/(\s+)|(\{\{[a-zA-Z\s]+\}\})|([\!\.\?\-\🗝\💀\🔅]+)/g).filter(element => element); // Filter removes phantom empty entries

            console.log('checker', textSplitToGroups);
            //let lastWordVector = SVG_BASE_COORDINATES;
            // Strip out punctuation?

            //for (let i = 0; i < bitToLine.length; i++) {
            // normally translate here?
            textSplitToGroups.forEach((tempOneWord) => {
                if (tempOneWord.match(/(\s+)/)) {
                    generateWhiteSpace(this, tempOneWord);
                } else if (/\{\{[a-zA-Z\s]+\}\}/.test(tempOneWord)) {
                    generateSpecialRune(this, tempOneWord);
                } else {
                    generateRuneWord(this, tempOneWord);
                }
            });

            this.updateFigureRoots();

            function generateRuneWord(par, tempOneWord) {
                let newWord = par.runeword(par.props, { word: tempOneWord });

                console.log(newWord instanceof SVG.RuneWord);

                // if (lastWord !== null) {
                //     newWord.x(lastWord.x() + lastWord.width());
                // }

                par.allFiguresList.push(newWord);
                // lastWord = newWord;
            }

            function generateWhiteSpace(par, tempOneWord) {
                let newWhiteSpaceFigure = par.whitespace(par.props, { word: tempOneWord });

                par.allFiguresList.push(newWhiteSpaceFigure);
            }

            function generateSpecialRune(par, tempOneWord) {
                const specialRuneName = tempOneWord.replace(/^\{+/, '').replace(/\}+$/, '');
                const svgText = par.specialRuneSVGMap[specialRuneName];

                if (svgText) {
                    let newSpecialRune = par.specialrune(par.props, specialRuneName, svgText);

                    par.allFiguresList.push(newSpecialRune);
                } else {
                    console.error(`Special Rune ${tempOneWord} does not have a defined SVG.`)
                }
            }
        } else {
            console.error('The current string fails to pass the generation requirements.')
        }

        return this;
    }

    updateFigureRoots() {

        let rootX = 0;
        let rootY = 0;
        for (const currentFigure of this.allFiguresList) {
            if (currentFigure.isRuneWord()) {
                // Set current position based on root
                currentFigure.x(rootX);
                currentFigure.y(rootY);

                // Set next root
                rootX += currentFigure.width();
            } else if (currentFigure.isWhitespace()) {
                if (currentFigure.relevantNewlines > 0) {
                    // Set current position - special case of ignoring root
                    currentFigure.x(0);
                    currentFigure.y(currentFigure.relevantNewlines * 3 * this.props.runeScale);

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
            } else if (currentFigure.isSpecialRune()) {
                // Set current position based on root
                currentFigure.x(rootX - currentFigure.leftDatum);
                currentFigure.y(rootY + currentFigure.topDatum);

                // Set next root
                rootX += currentFigure.rightDatum - currentFigure.leftDatum;
            } else {
                console.error('How the heck did you get here?')
            }
        }
    }

    updateFigureSizing() {
        for (const currentFigure of this.allFiguresList) {
            currentFigure.updateSizing();
        }
    }

    resizeEvent(runeScale, lineWidth) {
        // Update the scale props
        this.updateScaleProps(runeScale, lineWidth);

        // Invoke a rescale event in all figures
        this.updateFigureSizing();
        this.updateFigureRoots();

        return this;
    }

    updateScaleProps(runeScale, lineWidth) {
        this.props.runeScale = runeScale;
        this.props.segmentLength = lineWidth;
        this.props.fullHeight = 3 * runeScale + lineWidth;
        this.props.fullWidth = 2 * sin60 * runeScale + lineWidth;
        this.props.lineWidth = lineWidth;

        return this
    }

    /**
     * `Method`
     * 
     * TODO: Description
     */
    updateColor(color) {
        for (const currentFigure of this.allFiguresList) {
            currentFigure.updateColor(color);
        }
    }

    /**
     * `Method`
     * 
     * TODO: Description
     */
    clearColor() {
        for (const currentFigure of this.allFiguresList) {
            currentFigure.clearColor();
        }
    }

    /**
     * `Method`
     * 
     * Delete all Figures currently within the controller
     */
    clear() {
        for (const currentFigure of this.allFiguresList) {
            currentFigure.remove();
        }
        this.allFiguresList = [];
    }
}

// Extend the SVG definition to include a constructor for the controller as well as a creation fade in method
SVG.extend(SVG.Container, {
    controller: function (startingRuneScale, startingLineWidth, ipaDict, specialRuneSVGMap) {
        // return this.put(new SVG.Controller).init(+slider.value, +slider2.value, 'assets/svg', ['skull']);
        return this.put(new SVG.Controller).init(startingRuneScale, startingLineWidth, ipaDict, specialRuneSVGMap);
    },
    creationFadeIn: function () {
        return this.opacity(0).animate().opacity(1);
    }
});
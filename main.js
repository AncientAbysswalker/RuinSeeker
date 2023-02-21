// HTML Tags
const TAG_SVG = document.getElementById('svg');
const TAG_INFO_PANE = document.getElementById('info-pane');
const TAG_INFO_PANE_TOGGLE = document.getElementById('info-toggle-btn');
const TAG_TRANSLATE = document.getElementById('btn-translate');
const TAG_DL_SVG = document.getElementById('btn-dl-as-svg');
const TAG_DL_PNG = document.getElementById('btn-dl-as-png');
const TAG_TEXT_AREA = document.getElementById('text-to-translate');
const TAG_SUPPORT_ETH = document.getElementById('support-eth');
const TAG_SUPPORT_BTC = document.getElementById('support-btc');
const TAG_BTN_KEY = document.getElementById('btn-key');
const TAG_BTN_PRISONKEY = document.getElementById('btn-prisonkey');
const TAG_BTN_SKULL = document.getElementById('btn-skull');

const TAG_T1 = document.getElementById('text10');
const TAG_B1 = document.getElementById('btn1');
const TAG_T2 = document.getElementById('text20');
const TAG_B2 = document.getElementById('btn2');
const bits = document.getElementById('bits');
const bitbut = document.getElementById('bitbut');
const numbbb = document.getElementById('numbbb');
const bumbut = document.getElementById('bumbut');
const bumbut2 = document.getElementById('bumbut2');
var slider = document.getElementById("myRange");
var slider2 = document.getElementById("myRange2");
var myRangeD = document.getElementById("myRangeD");
var myRange2D = document.getElementById("myRange2D");

// Page Refresh, clearing cached changes and disable buttons
TAG_TEXT_AREA.value = '';
disableDownloadButtons();

// Imports for SVG Builders for Unique Runes
import Vector from './Vector.js';
import Trie from './Trie.js';

// SVG Class Imports
import './classes/RuneWord.js';
import './classes/Whitespace.js';
import './classes/SpecialRune.js';

// Runic Global Variables - let so future changes can be made to allow user input on the RUNE_SCALE they want
const RUNE_WIDTH_FACTOR = Math.sqrt(3) / 2;
let RUNE_SCALE = 25; // Runes are 3 * RUNE_SCALE tall
let RUNE_LINE_WIDTH = 5;
let RUNE_WIDTH_PERCENT_SPACE = 50;
let RUNE_HEIGHT_PERCENT_NEWLINE = 50;
let SVG_BASE_COORDINATES = new Vector(0, 0);

// Data Download URIs
let URI_SVG = null;
let URI_PNG = null;

// Libraries for translation
import ipaPhonemeToByteCodeAndVowel from './assets/ipa/ipa_phoneme_to_bytecode.js';

let allFiguresList = [];

let ipaDict = {};
fetch('assets/ipa/ipa_dict.json')
    .then(response => response.json())
    .then(json => { ipaDict = json; console.log('IPA Dictionary was successfully loaded') })
    .catch(error => console.error('An error occured loading the IPA Dictionary'));


// const validSpecialRuneNames = [
//     'skull'
// ];
// let specialRuneSVGMap = {};

// async function loadSpecialRuneSVGData() {
//     for (const validSpecialRuneName of validSpecialRuneNames) {
//         await fetch(`assets/svg/${validSpecialRuneName}.svg`)
//             .then(response => response.text())
//             .then(svgText => { specialRuneSVGMap[validSpecialRuneName] = svgText })
//             .catch(error => console.error(`An error occured loading the SVG text for '${validSpecialRuneName}'`, error));
//     }
// }

// async function cacheAllSpecialRunes() {
//     for (validSpecialRuneName of validSpecialRuneNames) {
//         await fetch(`assets/svg/${validSpecialRuneName}.svg`)
//             .then(response => response.text())
//             .then(svgText => { specialRuneSVGMap[validSpecialRuneName] = svgText })
//             .catch(error => console.error(`An error occured loading the SVG text for '${validSpecialRuneName}'`, error));
//     }
// }

// loadSpecialRuneSVGData()
//     .then();

let skull = '';
let skulltext = '';
fetch('assets/svg/skull.svg')
    .then(response => response.text())
    .then(svgText => { skulltext = svgText; skull = new SVG(svgText) })
    .catch(error => console.error('An error occured loading the SVG', error));

function getAttribute(baseStr, attribute) {
    return baseStr.match(/(?<=height\=\")(.*?)(?=\")/)
}


let ipaDict2 = {};
fetch('assets/ipa/en_US_base.json')
    .then(response => response.json())
    .then(json => { ipaDict2 = json; console.log('IPA Dictionary was successfully loaded') })
    .catch(error => console.error('An error occured loading the IPA Dictionary'));

function CreateTextSVG(text) {
    var newText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    newText.setAttribute('x', 0);
    newText.setAttribute('y', 1.5 * RUNE_SCALE);
    newText.setAttribute('dominant-baseline', 'middle');
    newText.setAttribute('font-size', 3 * RUNE_SCALE);
    newText.setAttribute('height', 3 * RUNE_SCALE);
    newText.setAttribute('stroke-width', 0);
    newText.setAttribute('font-family', 'Linux Libertine MONO'); //'Odin Rounded');//
    newText.textContent = text;

    return newText;
}

function clearPaneAndWords() {
    allFiguresList = [];
    TAG_SVG.innerHTML = '';
}

/**
 * Clear the SVG pane and translate the text of the user-entry field
 */
function translateOnClick() {
    clearPaneAndWords();

    // Translate Raw Text
    directTranslate(TAG_TEXT_AREA.value);
}

function directTranslate(rawText) {
    let cleanedText = rawText.replace(/[^a-zA-Z\n \!\.\?\-\🗝\💀\🔅]/g, ''); // Remove all numbers and special characters for now. Probably add them in little by little
    if (cleanedText.length > 0) {
        let textSplitToGroups = (cleanedText.trim() === '') ? [] : cleanedText.replace(/[^\S\r\n]+$/g, '').split(/(\s+)|([\!\.\?\-\🗝\💀\🔅]+)/g).filter(element => element); // Split on spaces, removing any qty of spaces between 'words'
        console.log(textSplitToGroups);

        let lastWordVector = SVG_BASE_COORDINATES;
        // Strip out punctuation?

        //for (let i = 0; i < bitToLine.length; i++) {
        // normally translate here?
        var i = 0;
        textSplitToGroups.forEach((tempOneWord) => {
            let newWord = new CharacterGrouping(tempOneWord, lastWordVector);
            lastWordVector = newWord.wordEndCoordinates;

            //newWord.shiftStart(new Vector(i, 0))

            allFiguresList.push(newWord);
            i += 1;
        });

        enableDownloadButtons();
    } else {
        disableDownloadButtons();
    }

    // Clear previous SVG/PNG definitions
    URI_SVG = null;
    URI_PNG = null;

    // Resize the SVG canvas and prepare the download button
    resizeSVGCanvas();
}

/**
 * Enable Download Buttons
 */
function enableDownloadButtons() {
    TAG_DL_PNG.removeAttribute('disabled');
    TAG_DL_SVG.removeAttribute('disabled');
}

/**
 * Disable Download Buttons
 */
function disableDownloadButtons() {
    TAG_DL_PNG.setAttribute('disabled', 'true');
    TAG_DL_SVG.setAttribute('disabled', 'true');
}

/**
 * Prepare and download the translation as an SVG
 */
function downloadSVG() {
    prepareSVG().then(uri => downloadURI(uri));
}

/**
 * Prepare and download the translation as a PNG
 */
function downloadPNG() {
    preparePNG().then(uri => downloadURI(uri));
}

/**
 * Download data encapsulated by a URI
 * @param {string} uri - URI to download
 */
function downloadURI(uri) {
    // Create virtual link, auto-download, and dispose of link
    let link = document.createElement('a');
    link.download = 'RuinSeeker_Translation';
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link = null;
}

/**
 * Encode the data in the <svg> tag and return the URI
 */
function prepareSVG() {
    return new Promise(resolve => {
        // If no SVG URI Exists, generate it! Otherwise short-circuit it!
        if (URI_SVG === null) {
            let serializer = new XMLSerializer();
            let source = serializer.serializeToString(TAG_SVG);

            // Add namespaces
            if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
                source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
                source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
            }

            // Add XML declaration
            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

            // Convert SVG source to URI data scheme
            URI_SVG = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

            resolve(URI_SVG);
        } else {
            resolve(URI_SVG);
        }
    });
}

/**
 * Encode the data in the <svg> tag and return the URI
 */
function preparePNG() {
    return new Promise(resolve => {
        // If no PNG URI Exists, generate it! Otherwise short-circuit it!
        if (URI_PNG === null) {
            prepareSVG().then(uri_svg => {
                let tempCanvas = document.createElement('canvas');
                document.body.appendChild(tempCanvas);
                let tempImage = new Image();
                tempImage.src = uri_svg;
                tempCanvas.width = TAG_SVG.clientWidth;
                tempCanvas.height = TAG_SVG.clientHeight;

                // When the image is actually prepared, then return the URI
                tempImage.onload = function () {
                    tempCanvas.getContext('2d').drawImage(tempImage, 0, 0, TAG_SVG.clientWidth, TAG_SVG.clientHeight);
                    URI_PNG = tempCanvas.toDataURL('image/png');
                    document.body.removeChild(tempCanvas);
                    tempCanvas = null;

                    resolve(URI_PNG);
                };
            });
        } else {
            resolve(URI_PNG);
        }
    });
}

/**
 * Resizes the <svg> tag to fit its contents. This makes the page scrollbars act as intended depending on window and SVG size
 */
function resizeSVGCanvas() {
    // Get the bounding box of the svg contents
    setTimeout(() => { // IDK why a delay is needed. Apparently loading the SVGs for Special Runes is async, but I can't find the requisite callback or event to properly handle for this...
        var boundingBox = TAG_SVG.getBBox();
        console.log(boundingBox) // NOTE THERE IS AN ASYNC ISSUE> NEED SVG CALC/CREATE TO COMPLETE BEFORE RESIZE!?!

        // Update the width and height using the size of the contents - need to include the x,y of the bounding box as well, since the bounding box is only counting the actual contents
        TAG_SVG.setAttribute('width', RUNE_LINE_WIDTH / 2 + boundingBox.width + boundingBox.x);
        TAG_SVG.setAttribute('height', RUNE_LINE_WIDTH / 2 + boundingBox.height + boundingBox.y);
    }, 100);
}

/**
 * Toggle info bar visibility
 */
function toggleInfoBar() {
    TAG_INFO_PANE.classList.toggle('show');
}

/**
 * Copy text to clipboard and create a success popup next to the clicked 
 * @param {element} elem - Element to make popup next to
 * @param {string} text - Text to copy to the clipdoard
 */
function copyText(elem, text) {
    /* Copy text into clipboard */
    let successPopup = document.createElement('span')
    successPopup.innerHTML = "Success!"
    successPopup.classList.add('success_message')
    navigator.clipboard.writeText(text);
    elem.insertBefore(successPopup, null);

    // Fadeout and deletion
    setTimeout(() => {
        successPopup.classList.add('fade_out')
        setTimeout(() => {
            successPopup.remove();
        }, 2000);
    }, 1000);
}

function insertSpecialCharacter(specialChar) {
    //IE support
    if (document.selection) {
        TAG_TEXT_AREA.focus();
        sel = document.selection.createRange();
        sel.text = specialChar;
    }
    //MOZILLA and others
    else if (TAG_TEXT_AREA.selectionStart || TAG_TEXT_AREA.selectionStart == '0') { //(TAG_TEXT_AREA === document.activeElement && 
        var startPos = TAG_TEXT_AREA.selectionStart;
        var endPos = TAG_TEXT_AREA.selectionEnd;
        TAG_TEXT_AREA.value = TAG_TEXT_AREA.value.substring(0, startPos)
            + specialChar
            + TAG_TEXT_AREA.value.substring(endPos, TAG_TEXT_AREA.value.length);
        TAG_TEXT_AREA.selectionStart = startPos + specialChar.length;
        TAG_TEXT_AREA.selectionEnd = startPos + specialChar.length;
        TAG_TEXT_AREA.focus();
    } else {
        TAG_TEXT_AREA.value += specialChar;
    }
}

// Handlers for onClicks
TAG_TRANSLATE.addEventListener('click', translateOnClick);
TAG_DL_SVG.addEventListener('click', downloadSVG);
TAG_DL_PNG.addEventListener('click', downloadPNG);
TAG_DL_PNG.addEventListener('click', downloadPNG);
TAG_INFO_PANE_TOGGLE.addEventListener('click', toggleInfoBar);
TAG_SUPPORT_ETH.addEventListener('click', () => copyText(TAG_SUPPORT_ETH, '0xFA31ABf3ac4D03b97dF709cd79EC9d1002079A8B'));
TAG_SUPPORT_BTC.addEventListener('click', () => copyText(TAG_SUPPORT_BTC, 'bc1qaz5wna7mvxyq2hqx4jnunuqw49f2482zqj274y'));
TAG_BTN_KEY.addEventListener('click', () => insertSpecialCharacter('🗝'));
TAG_BTN_PRISONKEY.addEventListener('click', () => insertSpecialCharacter('🔅'));
TAG_BTN_SKULL.addEventListener('click', () => insertSpecialCharacter('💀'));




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

TAG_B1.addEventListener('click', pastePhone);
TAG_B2.addEventListener('click', validateAndSplitIPA222);
bumbut.addEventListener('click', updateCharacterColor);
bumbut2.addEventListener('click', clearCharacterColor);
bitbut.addEventListener('click', testTopLevel);
slider.oninput = function () {
    updateCharacterSize();
}
slider2.oninput = function () {
    updateCharacterSize();
}

function pastePhone() {
    let word = translateWordToIPA(TAG_T1.value);
    console.log(word);

    TAG_T2.value = word;
}

function translateWordToIPA(word) {
    return ipaDict2[word.toLowerCase()] ? ipaDict2[word.toLowerCase()] : undefined;
}

function validateAndSplitIPA222() {
    // rect.attr({
    //     fill: '#f06'
    //     , 'fill-opacity': 0.5
    //     , stroke: '#000'
    //     , 'stroke-width': 10
    // })
    rect.animate().size(50, 50)
    // let splirt = validateAndSplitIPA(TAG_T2.value);
    // console.log(splirt);
}

function validateAndSplitIPA(word) {
    return ipaDict2[word.toLowerCase()] ? ipaDict2[word.toLowerCase()] : undefined;
}

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
    init(runeScale, lineWidth, specialRunePath, specialRuneNames) {
        console.log(9)
        this.fullText = '';
        this.allFiguresList = [];
        this.specialRuneSVGData = {};
        this.props = {
            runeScale: runeScale,
            lineWidth: lineWidth,
            ipaDict: ipaDict
        };

        this.stroke({ color: '#000000' }).updateScaleProps(runeScale, lineWidth);

        this.loadSpecialRuneSVGData(specialRunePath, specialRuneNames)
        //.then((specialRuneSVGMap) => this.cacheSpecialRunes(specialRuneSVGMap))

        return this;
    }

    generate(rawText) {
        // const runeWord = this.runeword();
        var size = +slider.value;
        var size2 = +slider2.value;
        let lastWord = null;
        this.clear();


        const regexWord = new RegExp(/[a-zA-Z]+/);
        const regexWhitespace = new RegExp(/\s+/);
        const regexSpecialRune = new RegExp(/\{\{[a-zA-Z]+\}\}/);
        // const regexSpecialRune = new RegExp("\\{\\{[a-zA-Z\s]+\\}\\}");

        // let cleanedText = rawText.replace(/[^a-zA-Z\n \!\.\?\-\🗝\💀\🔅]/g, ''); // Remove all numbers and special characters for now. Probably add them in little by little
        // const fullR = new RegExp("^([a-zA-Z\\s]|(" + regexSpecialRune.source + "))*$")
        const fullR = new RegExp("^(" + regexWord.source + "|" + regexWhitespace.source + "|(" + regexSpecialRune.source + "))*$");
        // const fullR2 = new RegExp("(" + regexWord.source + ")|(" + regexWhitespace.source + ")|((" + regexSpecialRune.source + ")+)", 'g');
        const fullR2 = new RegExp("(" + regexWord.source + ")|(" + regexWhitespace.source + ")|(" + regexSpecialRune.source + ")", 'g');
        console.log("aaa", fullR2)

        if (rawText.length === 0) {
            console.error('No string length')
        }

        // Validate the user input passes requirements for generation
        if (fullR.test(rawText)) {
            // let textSplitToGroupsOld = (cleanedText.trim() === '') ? [] : cleanedText.replace(/[^\S\r\n]+$/g, '').split(/(\s+)|([\!\.\?\-\🗝\💀\🔅]+)/g).filter(element => element); // Split on spaces, removing any qty of spaces between 'words'
            // console.log(rawText.split(/(\s+)|(\{\{[a-zA-Z\s]+\}\})|([\!\.\?\-\🗝\💀\🔅]+)/g));
            let textSplitToGroups = rawText.match(fullR2);//.filter(element => element); // Filter removes phantom empty entries
            // let textSplitToGroups = rawText.split(/(\s+)|(\{\{[a-zA-Z\s]+\}\})|([\!\.\?\-\🗝\💀\🔅]+)/g).filter(element => element); // Filter removes phantom empty entries

            console.log('checker', textSplitToGroups);
            let lastWordVector = SVG_BASE_COORDINATES;
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
                console.log(newWord)
                console.log(newWord.clone())
                // lastWord = newWord;
            }

            function generateWhiteSpace(par, tempOneWord) {
                let newWhiteSpaceFigure = par.whitespace(par.props, { word: tempOneWord });

                par.allFiguresList.push(newWhiteSpaceFigure);
            }

            function generateSpecialRune(par, tempOneWord) {
                const specialRuneName = tempOneWord.replace(/^\{+/, '').replace(/\}+$/, '');
                const svgText = par.specialRuneSVGData[specialRuneName];

                if (svgText) {
                    let newSpecialRune = par.specialrune(par.props, svgText);

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
        var size = +slider.value;
        var size2 = +slider2.value;
        let RUNE_WIDTH_PERCENT_SPACE = 50;

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
                if (currentFigure.trailingNewlines > 0) {
                    // Set current position - special case of ignoring root
                    currentFigure.x(0);
                    currentFigure.y(currentFigure.trailingNewlines * 3 * size);

                    // Set next root
                    rootX = size2 + currentFigure.trailingSpaces * Math.round(RUNE_WIDTH_FACTOR * size * RUNE_WIDTH_PERCENT_SPACE / 50); //TODO: Fix size and constants 
                    rootY += currentFigure.trailingNewlines * Math.round(3 * size * (1 + RUNE_HEIGHT_PERCENT_NEWLINE / 100));
                } else if (currentFigure.trailingSpaces > 0) {
                    // Set current position based on root
                    currentFigure.x(rootX);
                    currentFigure.y(rootX);

                    // Set next root
                    rootX += size2 + currentFigure.trailingSpaces * Math.round(RUNE_WIDTH_FACTOR * size * RUNE_WIDTH_PERCENT_SPACE / 50); //TODO: Fix size and constants 
                } else {
                    console.error('How the heck did you get here?')
                }
            } else if (currentFigure.isSpecialRune()) {
                // Set current position based on root
                currentFigure.x(rootX + currentFigure.leftDatum);
                currentFigure.y(rootY + currentFigure.topDatum);

                // Set next root
                rootX += currentFigure.rightDatum;
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

    async loadSpecialRuneSVGData(specialRunePath, specialRuneNames) {
        let specialRuneSVGMap = {};
        for (const specialRuneName of specialRuneNames) {
            await fetch(`${specialRunePath}/${specialRuneName}.svg`)
                .then(response => response.text())
                .then(svgText => { this.specialRuneSVGData[specialRuneName] = svgText })
                // .then(svgText => { this.cacheSpecialRune(specialRuneName, svgText) })
                .catch(error => console.error(`An error occured loading the SVG text for '${specialRuneName}'`, error));
        }

        return specialRuneSVGMap;
    }

    async cacheSpecialRune(specialRuneName, svgText) {
        this.cache[specialRuneName] = SVG().specialrune(this.props, svgText);
    }
}

// Add a method to create a rounded rect
SVG.extend(SVG.Container, {
    controller: function () {
        return this.put(new SVG.Controller).init(+slider.value, +slider2.value, 'assets/svg', ['skull']);
    },
    creationFadeIn: function () {
        return this.opacity(0).animate().opacity(1);
    }
});


var controller = SVG().controller(+slider.value, +slider2.value).addTo('#svg33');

// SVG.Rune = class extends SVG.Line

function testTopLevel() {
    //let character = draw.rune().creationFadeIn();

    //testing
    console.log(bits.value)
    controller.generate(bits.value);
    controller.creationFadeIn();
    //let char = draw.runeword().creationFadeIn();

    // var line1 = character.line(5 + 50 * runeVert[0].x, 5 + 50 * runeVert[0].y, 5 + 50 * runeVert[1].x, 5 + 50 * runeVert[1].y).opacity(0);
    // var line2 = character.line(5 + 50 * runeVert[0].x, 5 + 50 * runeVert[0].y, 5 + 50 * runeVert[3].x, 5 + 50 * runeVert[3].y).opacity(0);

}

function createLine(parent, tag) {
    parent.line(
        +slider2.value + slider.value * bitToPos[tag][0].x,
        +slider2.value + slider.value * bitToPos[tag][0].y,
        +slider2.value + slider.value * bitToPos[tag][1].x,
        +slider2.value + slider.value * bitToPos[tag][1].y
    ).data('segId', tag, true)
}

// var character = draw.nested();
// var line1 = character.line(5 + 50 * runeVert[0].x, 5 + 50 * runeVert[0].y, 5 + 50 * runeVert[1].x, 5 + 50 * runeVert[1].y).opacity(0);
// var line2 = character.line(5 + 50 * runeVert[0].x, 5 + 50 * runeVert[0].y, 5 + 50 * runeVert[3].x, 5 + 50 * runeVert[3].y).opacity(0);
// character.move(50, 50);
// line1.data('segIndex', 0, true)
// console.log('thepropofseg0: ' + line1.data('segIndex'))

// line1.animate().opacity(1);
// line2.animate().opacity(1);

//controller.colorAll({ color: '#000000' });
// character.stroke({ color: '#f06', width: 4, linecap: 'round' });

function updateCharacterSize() {
    //var size = numbbb.value;
    // var size = +slider.value;
    // var size2 = +slider2.value;
    // myRangeD.innerText = size
    // myRange2D.innerText = size2

    // let runeword = draw.children()[0];

    controller.resizeEvent(+slider.value, +slider2.value);
    // for (const line of rune.children()) {
    //     line.updateEndpoints();
    // }
}

function updateCharacterColor() {
    var color = colorWheel.hex

    controller.updateColor(color)
}

function clearCharacterColor() {
    controller.clearColor()
}


// create a new color picker
var colorWheel = new ReinventedColorWheel({
    // appendTo is the only required property. specify the parent element of the color wheel.
    appendTo: document.getElementById("my-color-picker-container"),

    // followings are optional properties and their default values.

    // initial color (can be specified in hsv / hsl / rgb / hex)
    hsv: [0, 100, 100],
    // hsl: [0, 100, 50],
    // rgb: [255, 0, 0],
    // hex: "#ff0000",

    // appearance
    wheelDiameter: 200,
    wheelThickness: 20,
    handleDiameter: 16,
    wheelReflectsSaturation: true,

    // handler
    onChange: function (color) {
        // the only argument is the ReinventedColorWheel instance itself.
        // console.log("hsv:", color.hsv[0], color.hsv[1], color.hsv[2]);
    },
});

// set color in HSV / HSL / RGB / HEX
colorWheel.hsv = [240, 100, 100];
colorWheel.hsl = [120, 100, 50];
colorWheel.rgb = [255, 128, 64];
colorWheel.hex = '#888888';

// get color in HSV / HSL / RGB / HEX
console.log("hsv:", colorWheel.hsv[0], colorWheel.hsv[1], colorWheel.hsv[2]);
console.log("hsl:", colorWheel.hsl[0], colorWheel.hsl[1], colorWheel.hsl[2]);
console.log("rgb:", colorWheel.rgb[0], colorWheel.rgb[1], colorWheel.rgb[2]);
console.log("hex:", colorWheel.hex);

// please call redraw() after changing some appearance properties.
// colorWheel.wheelDiameter = 400;
// colorWheel.wheelThickness = 40;
colorWheel.redraw();

const trie = new Trie();
for (let phoneme of Object.keys(ipaPhonemeToByteCodeAndVowel)) {
    trie.insert(phoneme);
}

console.log(trie.contains("e‍əʳ"));
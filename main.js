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
import RunicChar from './RunicChar.js';
import SpecialRunicChar from './SpecialRunicChar.js';
import Vector from './Vector.js';
import Trie from './Trie.js';

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

let allWordsList = [];

let ipaDict = {};
fetch('assets/ipa/ipa_dict.json')
    .then(response => response.json())
    .then(json => { ipaDict = json; console.log('IPA Dictionary was successfully loaded') })
    .catch(error => console.error('An error occured loading the IPA Dictionary'));


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

class CharacterGrouping {
    constructor(rawString, wordStartCoordinates) {
        this.wordStartCoordinates = wordStartCoordinates;
        console.log('wordStartCoordinates' + wordStartCoordinates.x + ' ' + wordStartCoordinates.y)
        this.rawString = rawString;
        this.ipaList = ipaDict[rawString.toLowerCase()] ? ipaDict[rawString.toLowerCase()].map((e) => { return e.split(' ') }) : undefined;
        this.svgRawText = CreateTextSVG(this.rawString);
        this.runeSVGOptions = [];
        this.ipaString = [];
        this.runicList = [];
        this.currentChild = 9;
        this.setGroupingTypeFromRawString();
        console.log(this.groupingType, 6)
        console.log(this.ipaList)

        if (this.groupingType === CharacterGrouping.GroupType.word) {
            if (this.ipaList !== undefined) {
                for (let i = 0; i < this.ipaList.length; i++) {
                    let tempSVG = CreateruneSVG();
                    //[0].split(' ')
                    //console.log(this.ipaList)
                    this.ipaString.push(this.ipaList[i].join());
                    let tempRuneList = this.ipaListToRuneList(this.ipaList[i]);
                    this.runicList.push(tempRuneList);
                    tempRuneList.forEach((rune) => {
                        tempSVG.appendChild(rune.runeSVG);
                    });

                    this.runeSVGOptions.push(tempSVG);
                }
                this.runeSVG = this.runeSVGOptions[0];
            } else {
                this.runeSVG.appendChild(this.svgRawText);
            }
            this.currentChild = TAG_SVG.appendChild(this.runeSVG);
            console.log(999, this.currentChild)

            var bbb = this.runeSVG.getBBox();

            let enx = this.wordStartCoordinates.x + bbb.width + RUNE_LINE_WIDTH;
            let eny = this.wordStartCoordinates.y;

            this.wordEndCoordinates = new Vector(enx, eny);

            this.shiftGroupToWordStartOffset()
        } else if (this.groupingType === CharacterGrouping.GroupType.whitespace) {
            let countOfNewlines = (this.rawString.match(/\r\n|\r|\n/g) || []).length;
            if (countOfNewlines > 0) { // Remove preceding whitespaces (before a newline) as they are irrelevant
                this.rawString = this.rawString.replace(/^[^\S\r\n]+/g, '');
                console.log(this.rawString)
            }
            let countOfSpaces = (this.rawString.match(/[^\S\r\n]/g) || []).length; // Might be wrong?
            console.log(countOfNewlines, 'countOfNewlines')
            console.log(countOfSpaces, 'countOfSpaces')

            let enx = ((countOfNewlines > 0) ? (1 / 2 * RUNE_LINE_WIDTH) : this.wordStartCoordinates.x) + (countOfSpaces * Math.round(RUNE_WIDTH_FACTOR * RUNE_SCALE * RUNE_WIDTH_PERCENT_SPACE / 50));
            let eny = this.wordStartCoordinates.y + (countOfNewlines * Math.round(3 * RUNE_SCALE * (1 + RUNE_HEIGHT_PERCENT_NEWLINE / 100)));

            this.wordEndCoordinates = new Vector(enx, eny);
        } else {
            let tempSVG = CreateruneSVG();
            this.charList = unicodeSplit(rawString);
            console.log('special')
            console.log(this.rawString)
            console.log(this.charList)

            let temp = this.specialCharListToRuneList(this.charList);
            this.runicList = temp[0];
            let currentLeftMargin = temp[1];
            this.runicList.forEach((rune) => {
                console.log(rune.runeSVG)
                tempSVG.appendChild(rune.runeSVG);
            });
            this.runeSVG = tempSVG;
            TAG_SVG.appendChild(this.runeSVG);

            let enx = this.wordStartCoordinates.x + currentLeftMargin;
            let eny = this.wordStartCoordinates.y;

            this.wordEndCoordinates = new Vector(enx, eny);

            this.shiftGroupToWordStart()
        }

        function unicodeSplit(str) {
            const arr = [];
            for (const char of str)
                arr.push(char)

            return arr;
        }

        this.test.bind(this);
        this.setColor.bind(this);

        console.log(this)
        console.log(this.runeSVG)
        console.log('this.runeSVG')
        if (this.runeSVG) {
            this.runeSVG.addEventListener('click', () => { this.test() });
            this.runeSVG.addEventListener('mouseover', () => { this.setColor('blue') });
        }
    }

    test() {
        console.log(this)
        //this.currentChild.remove()
        TAG_SVG.removeChild(this.currentChild);
        this.runeSVG = this.runeSVGOptions[1];
        TAG_SVG.appendChild(this.runeSVG);

        allWordsList.forEach((word) => {
            word.shiftGroupToWordStartOffset()
        })
    }

    ipaListToRuneList(ipaList) {
        let byteCodeAndVowelList = [];
        let combinedByteCodeAndVowelList = [];
        let runicCharList = [];

        let prevPartialCharacter = null;
        let curentPartialCharacter = null;

        for (let i = 0; i < ipaList.length; i++) {
            let newByteCodeAndVowel = ipaPhonemeToByteCodeAndVowel[ipaList[i]];

            if (newByteCodeAndVowel === undefined) {
                return undefined;
            }

            byteCodeAndVowelList.push(newByteCodeAndVowel);
        }

        if (byteCodeAndVowelList.length > 0 && byteCodeAndVowelList.length === 1) {
            runicCharList.push(new RunicChar(byteCodeAndVowelList[0].byteCode, 0));
        } else {
            prevPartialCharacter = byteCodeAndVowelList[0];

            for (let i = 1; i < byteCodeAndVowelList.length; i++) {
                curentPartialCharacter = byteCodeAndVowelList[i];

                // If previously both phonemes were combined we don't have something to compare to, so shif this phoneme to previous and next iter of list
                if (prevPartialCharacter === null) {
                    prevPartialCharacter = curentPartialCharacter;
                    continue;
                }

                // Both vowel or both not vowel
                if (curentPartialCharacter.isVowel === prevPartialCharacter.isVowel) {
                    combinedByteCodeAndVowelList.push(prevPartialCharacter.byteCode);
                    prevPartialCharacter = curentPartialCharacter;
                    curentPartialCharacter = null;
                    continue;
                }

                // Characters are different (vowel and consonant)
                if (curentPartialCharacter.isVowel !== prevPartialCharacter.isVowel) {
                    // console.log(prevPartialCharacter.byteCode + curentPartialCharacter.byteCode + 0b100000000000 * prevPartialCharacter.isVowel)
                    combinedByteCodeAndVowelList.push(prevPartialCharacter.byteCode + curentPartialCharacter.byteCode + 0b100000000000 * prevPartialCharacter.isVowel);
                    prevPartialCharacter = null;
                    curentPartialCharacter = null;
                    continue;
                }
                console.log('WTF???')
                //runicCharList.push(new RunicChar(TAG_SVG, byteCodeAndVowelList[i], this.wordStartCoordinates, i));
            }

            // Lastly if there is a remaining phoneme on the prevPartialCharacter, push it!
            if (prevPartialCharacter !== null) {
                combinedByteCodeAndVowelList.push(prevPartialCharacter.byteCode);
            }

            for (let i = 0; i < combinedByteCodeAndVowelList.length; i++) {
                // console.log(this.wordStartCoordinates)
                runicCharList.push(new RunicChar(combinedByteCodeAndVowelList[i], i));
            }
        }

        return runicCharList;
    }

    specialCharListToRuneList(charList) {
        let runicCharList = [];
        let currentLeftMargin = 0;

        for (let i = 0; i < charList.length; i++) {
            let newChar = new SpecialRunicChar(charList[i], currentLeftMargin);
            runicCharList.push(newChar);
            currentLeftMargin += (newChar.width * newChar.defaultScale * (RUNE_SCALE * 3 + RUNE_LINE_WIDTH) / newChar.height + 2 * newChar.pad * newChar.defaultScale * (RUNE_SCALE * 3 + RUNE_LINE_WIDTH) / newChar.height);
            console.log(currentLeftMargin)
        }


        return [runicCharList, currentLeftMargin];
    }

    shiftGroupToWordStart() {
        if (this.runeSVG) {
            this.runeSVG.setAttribute('transform', 'translate (' + this.wordStartCoordinates.x + ' ' + this.wordStartCoordinates.y + ')');
        }
    }

    shiftGroupToWordStartOffset() {
        if (this.runeSVG && this.groupingType === CharacterGrouping.GroupType.word) {
            this.runeSVG.setAttribute('transform', 'translate (' + (this.wordStartCoordinates.x + RUNE_LINE_WIDTH / 2) + ' ' + (this.wordStartCoordinates.y + RUNE_LINE_WIDTH / 2) + ')');
        }
    }

    /**
     * Sets the color attribute of the RunicChar.
     * @param {string} color - Any acceptable HTML color string, uncluding 'red' and '#456543'
     */
    setColor(color) {
        this.runeSVG.childNodes.forEach((node) => node.setAttribute('stroke', color));
    }

    /**
     * Clears the color attribute of the RunicChar, allowing the color of the word to take precedence
     */
    clearColor() {
        this.runeSVG.childNodes.forEach((node) => node.setAttribute('stroke', 'currentColor'));
    }

    setGroupingTypeFromRawString() {
        if (this.rawString.match(/(\s+)/)) {
            console.log(2)
            console.log(CharacterGrouping.GroupType.whitespace)
            this.groupingType = CharacterGrouping.GroupType.whitespace;
        } else if (this.rawString.match(/([\!\.\?\-\🗝]+)/)) {
            console.log(1)
            console.log(CharacterGrouping.GroupType.punctuation)
            this.groupingType = CharacterGrouping.GroupType.punctuation;
        } else {
            console.log(0)
            console.log(CharacterGrouping.GroupType.word)
            this.groupingType = CharacterGrouping.GroupType.word;
        }
    }

    /**
     * Enum for possible character grouping types
     * @readonly
     * @enum {number}
     */
    static GroupType = {
        word: 0,
        punctuation: 1,
        whitespace: 2
    }
}

function CreateruneSVG() {
    var runeSVG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    runeSVG.setAttribute('stroke', 'black');
    runeSVG.setAttribute('stroke-width', RUNE_LINE_WIDTH);
    runeSVG.setAttribute('stroke-linecap', 'round');

    return runeSVG;
}

function clearPaneAndWords() {
    allWordsList = [];
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

            allWordsList.push(newWord);
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
bitbut.addEventListener('click', createChar);
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

function binToStr(bin) {
    return (bin >>> 0).toString(2);
}

function strToBin(str) {
    return parseInt(str, 2);
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
     * @param {string} segId Segment ID
     */
    init(segId) {
        this.segId = segId;
        this.data('segId', segId, true)

        return this.updateStroke().updateAnchors();
    }
    /**
     * `Method`
     * 
     * Update the stroke thickness to the current value
     */
    updateStroke() {
        var size2 = +slider2.value;
        this.stroke({ width: size2 });

        return this;
    }
    /**
     * `Method`
     * 
     * Update the endpoints of this segment based on thickness and character size values
     */
    updateAnchors() {
        var size = +slider.value;
        var size2 = +slider2.value;

        this.attr({
            x1: size2 / 2 + (size * bitToPos[this.segId][0].x),
            y1: size2 / 2 + (size * bitToPos[this.segId][0].y),
            x2: size2 / 2 + (size * bitToPos[this.segId][1].x),
            y2: size2 / 2 + (size * bitToPos[this.segId][1].y)
        });

        return this;
    }
}

/**
 * `SVG`
 * 
 * SVG Class defining the vowel circle of a rune
 * 
 * @property {string} segId Segment ID
 */
SVG.RuneCircle = class extends SVG.Circle {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     */
    init() {
        this.segId = 'circle';
        this.data('segId', 'circle', true);
        this.fill({ opacity: 0 })

        return this.updateStroke().updateAnchors()
    }
    /**
     * `Method`
     * 
     * Update the stroke thickness to the current value
     */
    updateStroke() {
        var size2 = +slider2.value;
        this.stroke({ width: size2 });

        return this;
    }
    /**
     * `Method`
     * 
     * Update the center of this segment based on thickness and character size values
     */
    updateAnchors() {
        var size = +slider.value;
        var size2 = +slider2.value;

        this.cx(diagFactor * size + size2 / 2);
        this.cy(3 * size + size2 / 2);
        this.radius(diagFactor * size / 4);

        return this;
    }
}

/**
 * `SVG`
 * 
 * SVG Class defining a rune. This class is a container for other SVGs that make up the rune
 * 
 * @property {string[]} phones List of phones contained in this rune - length of the list is 1 or 2 phonemes
 * @property {binary} byteCode 12-bit binary representation of what segments are included in the rune
 */
SVG.Rune = class extends SVG.Svg {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     * 
     * @param {string[]} phones List of phones contained in this rune - length of the list is 1 or 2 phonemes
     */
    init(phones) {
        this.phones = phones;
        this.data('phones', phones, true);

        // Get byteCode from phonemes
        if (phones.length === 1) {
            this.byteCode = ipaPhonemeToByteCodeAndVowel[phones[0]].byteCode;
        } else if (phones.length === 2) {
            let char1 = ipaPhonemeToByteCodeAndVowel[phones[0]];
            let char2 = ipaPhonemeToByteCodeAndVowel[phones[1]];

            if (char1.isVowel ^ char2.isVowel) {
                this.byteCode = char1.byteCode + char2.byteCode + 0b100000000000 * char1.isVowel;
            } else {
                console.error('Cannot create rune! Rune cannot contain 2 consonant phonemes or vowel phonemes!');
                return;
            }
        } else {
            console.error('Cannot create rune! Rune can only consist of 1 or 2 phonemes!');
            return;
        }
        this.data('byteCode', binToStr(this.byteCode), true);

        // Standard 11 Lines based on byteCode
        for (let i = 0; i < 11; i++) {
            if (this.byteCode & 2 ** i) {
                if (i == 5) {
                    this.runeline('5u');
                    this.runeline('5l');
                } else {
                    this.runeline(i);
                }
            }
        }

        // Inversion Circle based on byteCode
        if (this.byteCode & 2 ** 11) {
            this.runecircle();
        }

        // Little Extra Line if either Vertical Line Present
        if ((this.byteCode & 2) || (this.byteCode & 2 ** 9)) {
            this.runeline('x');
        }

        // Horizontal Line, always present
        this.runeline('midline');

        this.stroke({ linecap: 'round' });

        return this;
    }
    updateChar() {
        for (const runeLine of this.children()) {
            runeLine.updateStroke().updateAnchors();
        }
    }
    updateColor(color) {
        this.animate().stroke({ color: ((color.charAt(0) === '#') ? color : ('#' + color)) });
    }

    clearColor() {
        console.log(this.parent().stroke())
        this.animate().stroke({ color: this.parent().stroke() });
    }

    relocate(i) {
        var size = +slider.value;
        var size2 = +slider2.value;
        this.x(i * (2 * diagFactor * size - 0 * size2));
    }
}

/**
 * `SVG`
 * 
 * SVG Class defining a rune word. This class is a container for other individual Rune SVGs
 * 
 * @property {string[]} phones List of phones contained in this rune - length of the list is 1 or 2 phonemes
 * @property {binary} byteCode 12-bit binary representation of what segments are included in the rune
 */
SVG.RuneWord = class extends SVG.Svg {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     * 
     * @param {string[]} phones List of phones contained in this word - phones will be grouped according to rune phoneme rules
     */
    init(sourceWord) {
        this.word = undefined;
        this.possiblePhones = undefined;
        this.currentPhones = undefined;

        if (sourceWord.phones) {
            //this is wrong, need parser
            this.possiblePhones = [sourceWord.phones];
            this.currentPhones = [sourceWord.phones];
        } else if (sourceWord.word) {
            this.word = sourceWord.word;
            this.data('word', this.word, true);

            // Check the dictionary
            let searchTheDictionary = ipaDict[this.word];
            if (!searchTheDictionary) {
                console.error('Cannot create rune word! Provided word is not in the dictionary.');
                return;
            }

            // Get phones
            this.possiblePhones = searchTheDictionary.map((phoneOption) => phoneOption.split(' ')); //Change this with new parser! No need to split on " "
            this.currentPhones = this.possiblePhones[0];
        } else {
            console.error('Cannot create rune word! Rune word must be defined by either a word or raw phoneme text.');
            return;
        }
        this.data('phones', this.currentPhones, true);

        // Create phoneme pairs
        let phonemePairs = [];
        let i = 0;
        while (i < this.currentPhones.length) {
            if ((i === this.currentPhones.length - 1) || !(ipaPhonemeToByteCodeAndVowel[this.currentPhones[i]].isVowel ^ ipaPhonemeToByteCodeAndVowel[this.currentPhones[i + 1]].isVowel)) {
                phonemePairs.push([this.currentPhones[i]]);
                i += 1;
            } else {
                phonemePairs.push([this.currentPhones[i], this.currentPhones[i + 1]]);
                i += 2;
            }
        }

        // Generate Runes
        for (let i = 0; i < phonemePairs.length; i++) {
            const phonemePair = phonemePairs[i];
            const newRune = this.rune(phonemePair);
            this.updateRunePosition(newRune, i);
        }

        return this;
    }
    updateRunePosition(rune, i) {
        var size = +slider.value;
        var size2 = +slider2.value;
        rune.x(i * (2 * diagFactor * size - 0 * size2));
    }
    updateRuneShift() {
        let runes = this.children();
        for (let i = 0; i < runes.length; i++) {
            const rune = runes[i];
            this.updateRunePosition(rune, i);
        }
    }
    updateSizing() {
        let runes = this.children();
        for (let i = 0; i < runes.length; i++) {
            const rune = runes[i];
            rune.updateChar();
            this.updateRunePosition(rune, i);
        }
    }
    updateColor(color) {
        this.animate().stroke({ color: ((color.charAt(0) === '#') ? color : ('#' + color)) });
    }

    clearColor() {
        console.log(this.parent().stroke())
        this.animate().stroke({ color: this.parent().stroke() });
    }
}

// Add a method to create a rounded rect
SVG.extend(SVG.Container, {
    // Create a rounded element
    runeline: function (segId) {
        return this.put(new SVG.RuneLine).init(segId);
    },
    runecircle: function () {
        return this.put(new SVG.RuneCircle).init();
    },
    rune: function (phoneList) {
        return this.put(new SVG.Rune).init(phoneList);
    },
    runeword: function () {
        return this.put(new SVG.RuneWord).init({ word: bits.value }); //phonemes: bits.value.split(' ')
    },
    creationFadeIn: function () {
        return this.opacity(0).animate().opacity(1);
    }
});


var draw = SVG().addTo('#svg33')

// SVG.Rune = class extends SVG.Line

function createChar() {
    //let character = draw.rune().creationFadeIn();

    //testing
    let char = draw.runeword();

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

draw.stroke({ color: '#000000' });
// character.stroke({ color: '#f06', width: 4, linecap: 'round' });

function updateCharacterSize() {
    //var size = numbbb.value;
    var size = +slider.value;
    var size2 = +slider2.value;
    myRangeD.innerText = size
    myRange2D.innerText = size2

    let runeword = draw.children()[0];

    runeword.updateSizing();
    // for (const line of rune.children()) {
    //     line.updateEndpoints();
    // }
}

function updateCharacterColor() {
    //var color = '#' + numbbb.value;
    var color = colorWheel.hex
    console.log(color)

    let rune = draw.children()[0];
    rune.updateColor(color)
}

function clearCharacterColor() {
    let rune = draw.children()[0];
    rune.clearColor()
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
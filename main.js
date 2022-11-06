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

// Page Refresh, clearing cached changes and disable buttons
TAG_TEXT_AREA.value = '';
disableDownloadButtons();

// Imports for SVG Builders for Unique Runes
import RunicChar from './RunicChar.js';
import SpecialRunicChar from './SpecialRunicChar.js';
import Vector from './Vector.js';

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
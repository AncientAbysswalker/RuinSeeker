// Display Pane
const TAG_SVG = document.getElementById('svg');
const TAG_ERROR = document.getElementById("error");

// Info Pane
const TAG_INFO_PANE = document.getElementById('info-pane');
const TAG_INFO_PANE_TOGGLE = document.getElementById('info-toggle-btn');
const TAG_TEXT_AREA = document.getElementById('text-to-translate');
const TAG_SUPPORT_ETH = document.getElementById('support-eth');
const TAG_SUPPORT_BTC = document.getElementById('support-btc');

// Translation and Download Buttons
const TAG_TRANSLATE = document.getElementById('btn-translate');
const TAG_DL_SVG = document.getElementById('btn-dl-as-svg');
const TAG_DL_PNG = document.getElementById('btn-dl-as-png');

// Special Rune Buttons
const TAG_BTN_KEY = document.getElementById('btn-key');
const TAG_BTN_PRISONKEY = document.getElementById('btn-prisonkey');
const TAG_BTN_SKULL = document.getElementById('btn-skull');

// Style Interface
var TAG_SEGMENT_LENGTH = document.getElementById("segment-length");
var TAG_STROKE_WIDTH = document.getElementById("stroke-width");
var TAG_SEGMENT_LENGTH_DISPLAY = document.getElementById("segment-length-display");
var TAG_STROKE_WIDTH_DISPLAY = document.getElementById("stroke-width-display");
var TAG_BTN_STANDARD = document.getElementById("btn-standard");
var TAG_BTN_SMALL = document.getElementById("btn-small");
var TAG_BTN_CIRCLE_LOW = document.getElementById("btn-circle-low");
var TAG_BTN_CIRCLE_MID = document.getElementById("btn-circle-mid");
var TAG_BTN_CIRCLE_HIGH = document.getElementById("btn-circle-high");
var TAG_BTN_DIAMOND_LOW = document.getElementById("btn-diamond-low");
var TAG_BTN_DIAMOND_MID = document.getElementById("btn-diamond-mid");
var TAG_BTN_DIAMOND_HIGH = document.getElementById("btn-diamond-high");

// Testing Tags
const TAG_T1 = document.getElementById('text10');
const TAG_B1 = document.getElementById('btn1');
const TAG_T2 = document.getElementById('text20');
const bits = document.getElementById('bits');
const bitbut = document.getElementById('bitbut');
const numbbb = document.getElementById('numbbb');
const bumbut = document.getElementById('bumbut');
const bumbut2 = document.getElementById('bumbut2');
const animatemove = document.getElementById('animatemove');


// Page Refresh, clearing cached changes and disable buttons
TAG_TEXT_AREA.value = '';
disableDownloadButtons();

// Imports for SVG Builders for Unique Runes
import Vector from './Vector.js';
// import Trie from './Trie.js';

// SVG Controller Class Import
import './classes/Controller.js';
import { runeStyle, vowelStyle } from '../helpers/constants.js';

// Runic Global Variables - let so future changes can be made to allow user input on the RUNE_SCALE they want

let RUNE_SCALE = 25; // Runes are 3 * RUNE_SCALE tall
let RUNE_LINE_WIDTH = 5;
let RUNE_WIDTH_PERCENT_SPACE = 50;
let RUNE_HEIGHT_PERCENT_NEWLINE = 50;
let SVG_BASE_COORDINATES = new Vector(0, 0);

// Data Download URIs
let URI_SVG = null;
let URI_PNG = null;

let allFiguresList = [];

const specialRuneNames = [
    'skull',
    'prisonkey',
    'oldkey'
]

/**
 * Load the IPA dictionary and SVG data and supply it to the SVG.Controller on initialization
 * 
 * @returns SVG.Controller
 */
async function initializeController() {
    const ipaDict = await loadIPADict();
    const specialRuneSVGMap = await loadSpecialRuneSVGData(specialRuneNames);

    return SVG().controller(+TAG_SEGMENT_LENGTH.value, +TAG_STROKE_WIDTH.value, ipaDict, specialRuneSVGMap).addTo('#svg');
}

async function loadIPADict() {
    return await fetch('assets/ipa/ipa_dict.json')
        .then(response => response.json())
        .then(json => { console.log('IPA Dictionary was successfully loaded'); return json })
        .catch(error => console.error('An error occured loading the IPA Dictionary'));
}

async function loadSpecialRuneSVGData(specialRuneNames) {
    let specialRuneSVGMap = {};

    for (const specialRuneName of specialRuneNames) {
        await fetch(`assets/svg/${specialRuneName}.svg`)
            .then(response => response.text())
            .then(svgText => { specialRuneSVGMap[specialRuneName] = svgText })
            .catch(error => console.error(`An error occured loading the SVG text for '${specialRuneName}'`, error));
    }

    return specialRuneSVGMap;
}

// let ipaDict2 = {};
// fetch('assets/ipa/en_US_base.json')
//     .then(response => response.json())
//     .then(json => { ipaDict2 = json; console.log('IPA Dictionary was successfully loaded') })
//     .catch(error => console.error('An error occured loading the IPA Dictionary'));

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
    // controller.clear();

    // clearPaneAndWords();

    // Translate Raw Text
    directTranslate(TAG_TEXT_AREA.value);
}

function directTranslate(rawText) {
    // Clear previous SVG/PNG export data
    URI_SVG = null;
    URI_PNG = null;

    // Attempt to generate new translation
    controller.generate(rawText, () => successfulTranslation(), (errorMessage) => failedTranslation(errorMessage));

    resizeSVGCanvas();
    controller.creationFadeIn();


    return;

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

function setError(errorMessage) {
    TAG_ERROR.classList.remove('hidden');
    console.log(9999)
    TAG_ERROR.innerHTML = errorMessage;
}

function clearError() {
    TAG_ERROR.classList.add('hidden');
    TAG_ERROR.innerHTML = '';
}

function successfulTranslation() {
    clearError();

    enableDownloadButtons();
}

function failedTranslation(errorMessage) {
    setError(errorMessage);

    disableDownloadButtons();
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
    const boundingBox = TAG_SVG.getBBox();

    // Update the width and height using the size of the contents - need to include the x,y of the bounding box as well, since the bounding box is only counting the actual contents
    // boundingBox.x and boundingBox.y by default contain TAG_STROKE_WIDTH.value / 2, but help to additionally account for shifting due to whitespaces
    TAG_SVG.setAttribute('width', +TAG_STROKE_WIDTH.value / 2 + boundingBox.width + boundingBox.x);
    TAG_SVG.setAttribute('height', +TAG_STROKE_WIDTH.value / 2 + boundingBox.height + boundingBox.y);
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
TAG_BTN_KEY.addEventListener('click', () => insertSpecialCharacter('{{oldkey}}'));
TAG_BTN_PRISONKEY.addEventListener('click', () => insertSpecialCharacter('{{prisonkey}}'));
TAG_BTN_SKULL.addEventListener('click', () => insertSpecialCharacter('{{skull}}'));





// TAG_B1.addEventListener('click', pastePhone);




function pastePhone() {
    let word = translateWordToIPA(TAG_T1.value);
    console.log(word);

    TAG_T2.value = word;
}

// Set up controller
let controller = await initializeController();

// Update Sizing
TAG_SEGMENT_LENGTH.oninput = function () {
    updateCharacterSize();
}
TAG_STROKE_WIDTH.oninput = function () {
    updateCharacterSize();
}

// Rune Style
TAG_BTN_STANDARD.addEventListener('click', () => { controller.updateRuneStyle(runeStyle.STANDARD).then(resizeSVGCanvas) });
TAG_BTN_SMALL.addEventListener('click', () => { controller.updateRuneStyle(runeStyle.SMALL).then(resizeSVGCanvas) });
TAG_BTN_CIRCLE_LOW.addEventListener('click', () => { controller.updateVowelStyle(vowelStyle.LOW_CIRCLE).then(resizeSVGCanvas) });
TAG_BTN_CIRCLE_MID.addEventListener('click', () => { controller.updateVowelStyle(vowelStyle.MID_CIRCLE).then(resizeSVGCanvas) });
TAG_BTN_CIRCLE_HIGH.addEventListener('click', () => { controller.updateVowelStyle(vowelStyle.HIGH_CIRCLE).then(resizeSVGCanvas) });
TAG_BTN_DIAMOND_HIGH.addEventListener('click', () => { controller.updateVowelStyle(vowelStyle.HIGH_DIAMOND).then(resizeSVGCanvas) });
TAG_BTN_DIAMOND_MID.addEventListener('click', () => { controller.updateVowelStyle(vowelStyle.MID_DIAMOND).then(resizeSVGCanvas) });
TAG_BTN_DIAMOND_LOW.addEventListener('click', () => { controller.updateVowelStyle(vowelStyle.LOW_DIAMOND).then(resizeSVGCanvas) });


// animatemove.addEventListener('click', () => controller.updateRuneStyle(+S.value));
// bumbut.addEventListener('click', updateCharacterColor);
// bumbut2.addEventListener('click', clearCharacterColor);

// Controller Events
function updateCharacterSize() {
    TAG_SEGMENT_LENGTH_DISPLAY.innerText = TAG_SEGMENT_LENGTH.value;
    TAG_STROKE_WIDTH_DISPLAY.innerText = TAG_STROKE_WIDTH.value;

    controller.resizeEvent(+TAG_SEGMENT_LENGTH.value, +TAG_STROKE_WIDTH.value);
    resizeSVGCanvas();
}
function updateCharacterColor() {
    var color = colorWheel.hex

    controller.updateColor(color)
}
function clearCharacterColor() {
    controller.clearColor()
}


// create a new color picker
// var colorWheel = new ReinventedColorWheel({
//     // appendTo is the only required property. specify the parent element of the color wheel.
//     appendTo: document.getElementById("my-color-picker-container"),

//     // followings are optional properties and their default values.

//     // initial color (can be specified in hsv / hsl / rgb / hex)
//     hsv: [0, 100, 100],
//     // hsl: [0, 100, 50],
//     // rgb: [255, 0, 0],
//     // hex: "#ff0000",

//     // appearance
//     wheelDiameter: 200,
//     wheelThickness: 20,
//     handleDiameter: 16,
//     wheelReflectsSaturation: true,

//     // handler
//     onChange: function (color) {
//         // the only argument is the ReinventedColorWheel instance itself.
//         // console.log("hsv:", color.hsv[0], color.hsv[1], color.hsv[2]);
//     },
// });

// // set color in HSV / HSL / RGB / HEX
// colorWheel.hsv = [240, 100, 100];
// colorWheel.hsl = [120, 100, 50];
// colorWheel.rgb = [255, 128, 64];
// colorWheel.hex = '#888888';

// // get color in HSV / HSL / RGB / HEX
// console.log("hsv:", colorWheel.hsv[0], colorWheel.hsv[1], colorWheel.hsv[2]);
// console.log("hsl:", colorWheel.hsl[0], colorWheel.hsl[1], colorWheel.hsl[2]);
// console.log("rgb:", colorWheel.rgb[0], colorWheel.rgb[1], colorWheel.rgb[2]);
// console.log("hex:", colorWheel.hex);








// please call redraw() after changing some appearance properties.
// colorWheel.wheelDiameter = 400;
// colorWheel.wheelThickness = 40;
// colorWheel.redraw();




// // Libraries for translation
// import ipaPhonemeToByteCodeAndVowel from './assets/ipa/ipa_phoneme_to_bytecode.js';

// const trie = new Trie();
// for (let phoneme of Object.keys(ipaPhonemeToByteCodeAndVowel)) {
//     trie.insert(phoneme);
// }

// console.log(trie.contains("e‍əʳ"));

// Listen for click on the document
document.addEventListener('click', function (event) {

    //Bail if our clicked element doesn't have the class
    if (!event.target.classList.contains('accordion-toggle')) return;

    // Get the target content
    var content = document.querySelector(event.target.hash);
    if (!content) return;

    // Prevent default link behavior
    event.preventDefault();

    // If the content is already expanded, collapse it and quit
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        return;
    }

    // Get all open accordion content, loop through it, and close it
    var accordions = document.querySelectorAll('.accordion-content.active');
    for (var i = 0; i < accordions.length; i++) {
        accordions[i].classList.remove('active');
    }

    // Toggle our content
    content.classList.toggle('active');
})
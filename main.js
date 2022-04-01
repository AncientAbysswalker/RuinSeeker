// HTML Tags
const TAG_SVG = document.getElementById('svg');
const TAG_INFO_PANE = document.getElementById('info-pane');
const TAG_DL_SVG = document.getElementById('dl-as-svg');
const TAG_DL_PNG = document.getElementById('dl-as-png');
const TAG_TEXT_AREA = document.getElementById('text-to-translate');

// Page Refresh, clearing cached changes
TAG_TEXT_AREA.value = '';
TAG_DL_PNG.setAttribute('disabled', 'true');
TAG_DL_SVG.setAttribute('disabled', 'true');

// Runic Global Variables - let so future changes can be made to allow user input on the RUNE_SCALE they want
const RUNE_WIDTH_FACTOR = Math.sqrt(3) / 2;
let RUNE_SCALE = 25; // Runes are 3 * RUNE_SCALE tall
let RUNE_LINE_WIDTH = 5;
let RUNE_WIDTH_PERCENT_SPACE = 50;
let RUNE_HEIGHT_PERCENT_NEWLINE = 50;

// Data Download URIs
let URI_SVG = null;
let URI_PNG = null;

/** @type {Object.<string, {byteCode: number, isVowel: boolean}} */
const ipaPhonemeToByteCodeAndVowel = {
    // Consonant Phonemes			
    'b': {
        byteCode: 0b000010000010,
        isVowel: false
    },
    'd': {
        byteCode: 0b000011000010,
        isVowel: false
    },
    'f': {
        byteCode: 0b001001010000,
        isVowel: false
    },
    'ɡ': {
        byteCode: 0b001010010000,
        isVowel: false
    },
    'h': {
        byteCode: 0b001010000010,
        isVowel: false
    },
    'dʒ': {
        byteCode: 0b000001000010,
        isVowel: false
    },
    'k': {
        byteCode: 0b000010010010,
        isVowel: false
    },
    'ɫ': {
        byteCode: 0b001000000010,
        isVowel: false
    },
    'm': {
        byteCode: 0b000011000000,
        isVowel: false
    },
    'n': {
        byteCode: 0b000011001000,
        isVowel: false
    },
    'p': {
        byteCode: 0b001000010000,
        isVowel: false
    },
    'ɹ': {
        byteCode: 0b001000010010,
        isVowel: false
    },
    's': {
        byteCode: 0b001001010010,
        isVowel: false
    },
    't': {
        byteCode: 0b001000011000,
        isVowel: false
    },
    'v': {
        byteCode: 0b000010001010,
        isVowel: false
    },
    'w': {
        byteCode: 0b000000011000,
        isVowel: false
    },
    'j': {
        byteCode: 0b001000001010,
        isVowel: false
    },
    'z': {
        byteCode: 0b001010001010,
        isVowel: false
    },

    // Digraph Phonemes			
    'tʃ': {
        byteCode: 0b001000001000,
        isVowel: false
    },
    'ʃ': {
        byteCode: 0b001011011000,
        isVowel: false
    },
    'ŋ': {
        byteCode: 0b001011011010,
        isVowel: false
    },
    'θ': {
        byteCode: 0b001000011010,
        isVowel: false
    },
    'ð': {
        byteCode: 0b001011000010,
        isVowel: false
    },
    'ʒ': {
        byteCode: 0b000011011010,
        isVowel: false
    },

    // R-controlled Phonemes
    'ɑɹ': {
        byteCode: 0b010100000101,
        isVowel: true
    },
    'ɛɹ': {
        byteCode: 0b010000100000,
        isVowel: true
    },
    'ɪɹ': {
        byteCode: 0b010000100001,
        isVowel: true
    },
    'ɔɹ': {
        byteCode: 0b010000100101,
        isVowel: true
    },
    'ʊɹ': {
        byteCode: 0b010000100101,
        isVowel: true
    },
    'ɝ': {
        byteCode: 0b010100100100,
        isVowel: true
    },

    // Vowel Phonemes
    'eɪ': {
        byteCode: 0b000000000001,
        isVowel: true
    },
    'i': {
        byteCode: 0b010100100001,
        isVowel: true
    },
    'aɪ': {
        byteCode: 0b000000000100,
        isVowel: true
    },
    'oʊ': {
        byteCode: 0b010100100101,
        isVowel: true
    },
    'æ': {
        byteCode: 0b000000100101,
        isVowel: true
    },
    'ɛ': {
        byteCode: 0b010100100000,
        isVowel: true
    },
    'ɪ': {
        byteCode: 0b010100000000,
        isVowel: true
    },
    'ɑ': {
        byteCode: 0b000000100001,
        isVowel: true
    },
    'ɔ': {
        byteCode: 0b000000100001,
        isVowel: true
    },
    'ə': {
        byteCode: 0b000000000101,
        isVowel: true
    },
    'ʊ': {
        byteCode: 0b000100100000,
        isVowel: true
    },
    'u': {
        byteCode: 0b000100100101,
        isVowel: true
    },
    'aʊ': {
        byteCode: 0b010000000000,
        isVowel: true
    },
    'ɔɪ': {
        byteCode: 0b000100000000
    }
}

let allWordsList = [];

let ipaDict = {};
fetch('assets/ipa/ipa_dict.json')
    .then(response => response.json())
    .then(json => { ipaDict = json; console.log('IPA Dictionary was successfully loaded') })
    .catch(error => console.error('An error occured loading the IPA Dictionary'));

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    changePosition(x, y) {
        this.x = x;
        this.y = y;
    }
}

class VectorPair {
    constructor(v1, v2) {
        this.v1 = v1;
        this.v2 = v2;
    }
}

class WordDefinition {
    constructor(rawString, ipaList, appendedPunctuation, wordStartCoordinates) {
        this.wordStartCoordinates = wordStartCoordinates;
        this.rawString = rawString;
        this.ipaList = ipaList;
        this.svgRawText = CreateTextSVG(this.rawString);
        this.svgGroup = CreateSVGGroup();

        if (ipaList !== undefined) {
            this.ipaString = ipaList.join();
            this.runicList = this.ipaListToRuneList(ipaList);
            this.runicList.forEach((rune) => {
                this.svgGroup.appendChild(rune.svgGroup);
            });
        } else {
            this.svgGroup.appendChild(this.svgRawText);
        }
        TAG_SVG.appendChild(this.svgGroup);
        //this.shiftStart(new Vector(0, 0))

        var bbb = this.svgGroup.getBBox();

        let enx = appendedPunctuation.includes('\n') ? (1 / 2 * RUNE_LINE_WIDTH) : (this.wordStartCoordinates.x + bbb.width + appendedPunctuation.length * Math.round(RUNE_WIDTH_FACTOR * RUNE_SCALE * RUNE_WIDTH_PERCENT_SPACE / 50));
        let eny = appendedPunctuation.includes('\n') ? (this.wordStartCoordinates.y + Math.round(3 * RUNE_SCALE * (1 + RUNE_HEIGHT_PERCENT_NEWLINE / 100))) : (this.wordStartCoordinates.y);
        this.wordEndCoordinates = new Vector(enx, eny);

        this.shiftGroupToWordStart()
        // this.setColor.bind(this)
        // this.clearColor.bind(this)
        // this.svgGroup.addEventListener('mouseover', () => this.setColor('blue'));
        // this.svgGroup.addEventListener('mouseout', () => this.clearColor());
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
            runicCharList.push(new RunicLetter(TAG_SVG, byteCodeAndVowelList[0].byteCode, new Vector(0, 0), 0));
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
                //runicCharList.push(new RunicLetter(TAG_SVG, byteCodeAndVowelList[i], this.wordStartCoordinates, i));
            }

            // Lastly if there is a remaining phoneme on the prevPartialCharacter, push it!
            if (prevPartialCharacter !== null) {
                combinedByteCodeAndVowelList.push(prevPartialCharacter.byteCode);
            }

            for (let i = 0; i < combinedByteCodeAndVowelList.length; i++) {
                // console.log(this.wordStartCoordinates)
                runicCharList.push(new RunicLetter(TAG_SVG, combinedByteCodeAndVowelList[i], new Vector(0, 0), i));
            }
        }

        return runicCharList;
    }

    shiftStart(startPosition) {
        this.wordStartCoordinates.changePosition(1 / 2 * RUNE_LINE_WIDTH + startPosition.x * 300, 1 / 2 * RUNE_LINE_WIDTH + startPosition.y * 300);

        // for (let i = 0; i < this.runicList.length; i++) {
        //     this.runicList[i].refreshPosition(i)
        // }
        this.svgGroup.setAttribute('transform', 'translate (' + this.wordStartCoordinates.x + ' ' + this.wordStartCoordinates.y + ')');
    }

    shiftGroupToWordStart() {
        this.svgGroup.setAttribute('transform', 'translate (' + this.wordStartCoordinates.x + ' ' + this.wordStartCoordinates.y + ')');
    }

    /**
     * Sets the color attribute of the RunicLetter.
     * @param {string} color - Any acceptable HTML color string, uncluding 'red' and '#456543'
     */
    setColor(color) {
        this.svgGroup.childNodes.forEach((node) => node.setAttribute('stroke', color));
    }

    /**
     * Clears the color attribute of the RunicLetter, allowing the color of the word to take precedence
     */
    clearColor() {
        this.svgGroup.childNodes.forEach((node) => node.setAttribute('stroke', 'currentColor'));
    }
}

const charRelativeVertices = [
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

const bitToLine = [
    [CreateLineSVG(charRelativeVertices[0], charRelativeVertices[1])],
    [CreateLineSVG(charRelativeVertices[0], charRelativeVertices[3])],
    [CreateLineSVG(charRelativeVertices[0], charRelativeVertices[2])],
    [CreateLineSVG(charRelativeVertices[1], charRelativeVertices[3])],
    [CreateLineSVG(charRelativeVertices[2], charRelativeVertices[3])],

    [CreateLineSVG(charRelativeVertices[1], charRelativeVertices[4]), CreateLineSVG(charRelativeVertices[7], charRelativeVertices[10])],

    [CreateLineSVG(charRelativeVertices[8], charRelativeVertices[10])],
    [CreateLineSVG(charRelativeVertices[8], charRelativeVertices[11])],
    [CreateLineSVG(charRelativeVertices[10], charRelativeVertices[12])],
    [CreateLineSVG(charRelativeVertices[8], charRelativeVertices[12])],
    [CreateLineSVG(charRelativeVertices[11], charRelativeVertices[12])],
    [CreateLittleCircle()]
]

const middleLine = CreateLineSVG(charRelativeVertices[4], charRelativeVertices[6]);
const specialLine = CreateLineSVG(charRelativeVertices[3], charRelativeVertices[5]);

function CreateSVGGroup() {
    var svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svgGroup.setAttribute('stroke', 'black');
    svgGroup.setAttribute('stroke-width', RUNE_LINE_WIDTH);
    svgGroup.setAttribute('stroke-linecap', 'round');

    return svgGroup;
}
function CreateLineSVG(v1, v2) {
    var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    newLine.setAttribute('x1', v1.x);
    newLine.setAttribute('y1', v1.y);
    newLine.setAttribute('x2', v2.x);
    newLine.setAttribute('y2', v2.y);
    // newLine.setAttribute('stroke-width', RUNE_LINE_WIDTH);
    // newLine.setAttribute('stroke-linecap', 'round');
    //newLine.setAttribute('display', 'none');
    return newLine;
}
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

function CreateLittleCircle() {
    var newCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    newCircle.setAttribute('cx', RUNE_WIDTH_FACTOR * RUNE_SCALE);
    newCircle.setAttribute('cy', 3 * RUNE_SCALE);
    newCircle.setAttribute('r', RUNE_WIDTH_FACTOR * RUNE_SCALE / 4);
    newCircle.setAttribute('fill', 'white');
    // newCircle.setAttribute('stroke-width', RUNE_LINE_WIDTH);

    return newCircle;
}

class RunicLetter {
    constructor(TAG_SVG, binaryDefinition, charBaseCoordinates, characterShiftPosition) {
        this.charBaseCoordinates = charBaseCoordinates;
        this.byteCode = binaryDefinition;
        this.svgList = [];
        this.svgGroup = CreateSVGGroup();

        // Standard 11 Lines and Inversion Circle
        for (let i = 0; i < bitToLine.length; i++) {
            if (binaryDefinition & 2 ** i) {
                this.svgList.push.apply(this.svgList, bitToLine[i].map((node) => {
                    return node.cloneNode(true);
                }));
            }
        }

        // Little Extra Line if Vertical Line Present
        if ((binaryDefinition & 2) || (binaryDefinition & 2 ** 9)) {
            this.svgList.push(specialLine.cloneNode(true))
        }

        // Horizontal Line
        this.svgList.push(middleLine.cloneNode(true))


        // Attach to SVG Tag and set initial shift position
        this.attachToTAG_SVG(TAG_SVG);
        this.adjustCharacterPosition(characterShiftPosition);

        this.setColor.bind(this)
        this.clearColor.bind(this)
        // this.svgGroup.addEventListener('mouseover', () => this.setColor('red'));
        // this.svgGroup.addEventListener('mouseout', () => this.clearColor());
    }

    attachToTAG_SVG(TAG_SVG) {
        this.svgList.forEach((svg) => {
            this.svgGroup.appendChild(svg);
        });
        //TAG_SVG.appendChild(this.svgGroup);
    }

    adjustCharacterPosition(characterShiftPosition) {
        this.svgList.forEach((svgNode) => {
            svgNode.setAttribute('transform', 'translate (' + (this.charBaseCoordinates.x + characterShiftPosition * 2 * RUNE_WIDTH_FACTOR * RUNE_SCALE) + ' ' + this.charBaseCoordinates.y + ')');
        });
    }

    refreshPosition(characterShiftPosition) {
        this.svgList.forEach((svgNode) => {
            svgNode.setAttribute('transform', 'translate (' + (this.charBaseCoordinates.x + characterShiftPosition * 2 * RUNE_WIDTH_FACTOR * RUNE_SCALE) + ' ' + this.charBaseCoordinates.y + ')');
        });
    }

    /**
     * Sets the color attribute of the RunicLetter.
     * @param {string} color - Any acceptable HTML color string, uncluding 'red' and '#456543'
     */
    setColor(color) {
        this.svgGroup.setAttribute('stroke', color);
    }

    /**
     * Clears the color attribute of the RunicLetter, allowing the color of the word to take precedence
     */
    clearColor() {
        this.svgGroup.setAttribute('stroke', 'currentColor');
    }
}

function clearPaneAndWords() {
    allWordsList = [];
    TAG_SVG.innerHTML = '';
}

function translate22() {
    clearPaneAndWords();

    // Translate
    directTranslate(TAG_TEXT_AREA.value);
    //text2.value = wordList.join(' ')
}

function directTranslate(rawText) {
    let lowerCastRawText = rawText;
    lowerCastRawText = lowerCastRawText.replace(/[^a-zA-Z\n ]/g, ''); // Remove all numbers and special characters for now. Probably add them in little by little
    if (lowerCastRawText.length > 0) {
        let splitText = (lowerCastRawText.trim() === '') ? [] : lowerCastRawText.trim().split(/(\s+)/g); // Split on spaces, removing any qty of spaces between 'words'
        let splitTextWithPunctuation = [];
        for (let i = 0; i < splitText.length; i += 2) {
            let word = splitText[i];
            let punctuation = (i + 1 < splitText.length ? splitText[i + 1] : '');

            splitTextWithPunctuation.push({
                word: word,
                punctuation: punctuation
            })
        }

        let lastWordVector = new Vector(1 / 2 * RUNE_LINE_WIDTH, 1 / 2 * RUNE_LINE_WIDTH);
        // Strip out punctuation?

        //for (let i = 0; i < bitToLine.length; i++) {
        // normally translate here?
        var i = 0;
        splitTextWithPunctuation.forEach((tempOneWord) => {
            var ipaForWord = ipaDict[tempOneWord.word.toLowerCase()] ? ipaDict[tempOneWord.word.toLowerCase()][0].split(' ') : undefined;
            let newWord = new WordDefinition(tempOneWord.word, ipaForWord, tempOneWord.punctuation, lastWordVector);
            lastWordVector = newWord.wordEndCoordinates;

            //newWord.shiftStart(new Vector(i, 0))

            allWordsList.push(newWord);
            i += 1;
        });

        TAG_DL_PNG.removeAttribute('disabled');
        TAG_DL_SVG.removeAttribute('disabled');
    } else {
        TAG_DL_PNG.setAttribute('disabled', 'true');
        TAG_DL_SVG.setAttribute('disabled', 'true');
    }

    // Clear previous SVG/PNG definitions
    URI_SVG = null;
    URI_PNG = null;

    // Resize the SVG canvas and prepare the download button
    resizeSVGCanvas();
}

function downloadSVG() {
    // If no SVG URI exists yet, we need to prepare it!
    if (URI_SVG === null) {
        prepareSVG();
    }

    downloadURI(URI_SVG);
}

function downloadPNG() {
    // If no SVG or PNG URIs exist yet, we need to prepare them!
    if (URI_SVG === null) {
        prepareSVG();
        preparePNG();
    } else if (URI_PNG === null) {
        preparePNG();
    }

    downloadURI(URI_PNG);
}

function downloadURI(uri) {
    // Create virtual link, auto-download, and dispose of link
    let link = document.createElement('a');
    link.download = 'RuinSeeker_Translation';
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

/**
 * Encode the data in the <svg> tag and prepare the download button with this data
 */
function prepareSVG() {
    // Get SVG source
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
}

/**
 * Encode the data in the <svg> tag and prepare the download button with this data
 */
function preparePNG() {
    let canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    let imgThing = new Image();
    imgThing.src = URI_SVG;
    console.log(URI_SVG)
    canvas.width = TAG_SVG.clientWidth;
    canvas.height = TAG_SVG.clientHeight;
    canvas.getContext('2d').drawImage(imgThing, 0, 0, TAG_SVG.clientWidth, TAG_SVG.clientHeight);

    URI_PNG = canvas.toDataURL('image/png');
    document.body.removeChild(canvas);
    // delete canvas; -- temporary cannot delete, look into later
}

/**
 * Resizes the <svg> tag to fit its contents. This makes the page scrollbars act as intended depending on window and SVG size
 */
function resizeSVGCanvas() {
    // Get the bounding box of the svg contents
    var boundingBox = TAG_SVG.getBBox();

    // Update the width and height using the size of the contents
    TAG_SVG.setAttribute('width', RUNE_LINE_WIDTH + boundingBox.width);
    TAG_SVG.setAttribute('height', RUNE_LINE_WIDTH + boundingBox.height);
}

/**
 * Toggle info bar
 */
function toggleInfoBar() {
    TAG_INFO_PANE.classList.toggle('show');
}

function copyText(text) {
    /* Copy text into clipboard */
    navigator.clipboard.writeText(text);
}
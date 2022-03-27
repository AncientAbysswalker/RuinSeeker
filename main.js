// HTML Tags
const svgTag = document.getElementById("svg");
let allWordsList = [];

let ipa_dict = {};
fetch('assets/ipa/ipa_dict.json')
    .then(response => response.json())
    .then(json => ipa_dict = json);

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
    constructor(rawString, ipaList) {
        this.wordBaseCoordinates = new Vector(1 / 2 * lineW, 1 / 2 * lineW);
        this.rawString = rawString;
        this.ipaList = ipaList;

        this.runicList = this.ipaListToRuneList(ipaList);
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
                console.log('prok')
                return undefined;
            }

            byteCodeAndVowelList.push(newByteCodeAndVowel);
        }

        if (byteCodeAndVowelList.length > 0 && byteCodeAndVowelList.length === 1) {
            runicCharList.push(new RunicLetter(svgTag, byteCodeAndVowelList[0].byteCode, this.wordBaseCoordinates, 0));
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
                    console.log(prevPartialCharacter.byteCode + curentPartialCharacter.byteCode + 0b100000000000 * prevPartialCharacter.isVowel)
                    combinedByteCodeAndVowelList.push(prevPartialCharacter.byteCode + curentPartialCharacter.byteCode + 0b100000000000 * prevPartialCharacter.isVowel);
                    prevPartialCharacter = null;
                    curentPartialCharacter = null;
                    continue;
                }
                console.log("WTF???")
                //runicCharList.push(new RunicLetter(svgTag, byteCodeAndVowelList[i], this.wordBaseCoordinates, i));
            }

            // Lastly if there is a remaining phoneme on the prevPartialCharacter, push it!
            if (prevPartialCharacter !== null) {
                combinedByteCodeAndVowelList.push(prevPartialCharacter.byteCode);
            }

            for (let i = 0; i < combinedByteCodeAndVowelList.length; i++) {
                console.log(this.wordBaseCoordinates)
                runicCharList.push(new RunicLetter(svgTag, combinedByteCodeAndVowelList[i], this.wordBaseCoordinates, i));
            }
        }

        return runicCharList;
    }

    mbo() {
        console.log('i muuv')
        this.wordBaseCoordinates.changePosition(50, 50);

        for (let i = 0; i < this.runicList.length; i++) {
            this.runicList[i].refreshPosition(i)
        }
    }
}

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

const scale = 50;
const lineW = 5;
const hdisp = Math.sqrt(3) / 2;
const charRelativeVertices = [
    new Vector(hdisp * scale, 0),
    new Vector(0, 0.5 * scale),
    new Vector(2 * hdisp * scale, 0.5 * scale),
    new Vector(hdisp * scale, 1 * scale),

    new Vector(0, 1.5 * scale),
    new Vector(hdisp * scale, 1.5 * scale),
    new Vector(2 * hdisp * scale, 1.5 * scale),

    new Vector(0, 2 * scale),
    new Vector(hdisp * scale, 2 * scale),
    new Vector(2 * hdisp * scale, 2 * scale),

    new Vector(0, 2.5 * scale),
    new Vector(2 * hdisp * scale, 2.5 * scale),
    new Vector(hdisp * scale, 3 * scale)
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

function CreateLineSVG(v1, v2) {
    var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    newLine.setAttribute('x1', v1.x);
    newLine.setAttribute('y1', v1.y);
    newLine.setAttribute('x2', v2.x);
    newLine.setAttribute('y2', v2.y);
    newLine.setAttribute("stroke", "black");
    newLine.setAttribute("stroke-width", lineW);
    newLine.setAttribute("stroke-linecap", "round");
    //newLine.setAttribute("display", "none");
    return newLine;
}

function CreateLittleCircle() {
    var newCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    newCircle.setAttribute('cx', hdisp * scale);
    newCircle.setAttribute('cy', 3 * scale);
    newCircle.setAttribute('r', hdisp * scale / 6);
    newCircle.setAttribute("stroke", "black");
    newCircle.setAttribute("fill", "white");
    newCircle.setAttribute("stroke-width", lineW);

    return newCircle;
}

class RunicLetter {
    constructor(svgTag, binaryDefinition, charBaseCoordinates, characterShiftPosition) {
        this.charBaseCoordinates = charBaseCoordinates;
        this.byteCode = binaryDefinition;
        this.svgList = [];

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
        this.attachToSVGTag(svgTag);
        this.adjustCharacterPosition(characterShiftPosition);
    }

    attachToSVGTag(svgTag) {
        this.svgList.forEach((svg) => {
            svgTag.appendChild(svg);
        });
    }

    adjustCharacterPosition(characterShiftPosition) {
        this.svgList.forEach((svgNode) => {
            svgNode.setAttribute('transform', "translate (" + (this.charBaseCoordinates.x + characterShiftPosition * 2 * hdisp * scale) + " " + this.charBaseCoordinates.y + ")");
        });
    }

    refreshPosition(characterShiftPosition) {
        this.svgList.forEach((svgNode) => {
            svgNode.setAttribute('transform', "translate (" + (this.charBaseCoordinates.x + characterShiftPosition * 2 * hdisp * scale) + " " + this.charBaseCoordinates.y + ")");
        });
    }
}

// var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
// newLine.setAttribute('x1', '0');
// newLine.setAttribute('y1', '0');
// newLine.setAttribute('x2', '200');
// newLine.setAttribute('y2', '200');
// newLine.setAttribute("stroke", "black")
// newLine.setAttribute("stroke-width", "15")
// newLine.setAttribute("stroke-linecap", "round")
// document.getElementById("svg").appendChild(newLine);
// var newLine2 = newLine.cloneNode(true);
// newLine2.setAttribute('transform', "translate (55)");
// var x = new RunicLetter(svgTag, 0b100111110001, 0);
// var y = new RunicLetter(svgTag, 0b011101100011, 1);
// var qz = new RunicLetter(svgTag, 0b010101111011, 2);
// var z = new RunicLetter(svgTag, 0b011101100011, 3);
// var z = new RunicLetter(svgTag, 0b111101101011, 4);
// var z = new RunicLetter(svgTag, 0b111101101011, 6);
// var z = new RunicLetter(svgTag, 0b011101101011, 7);
// var ze = new RunicLetter(svgTag, 0b111111111111, 8);
// ze.adjustCharacterPosition(9)

// document.getElementById("svg").appendChild(x.newLine);

// class HexCoordinate {
//     constructor(x, y, z) {
//         this.x = x;
//         this.y = y;
//         this.z = z;
//     }
// }



function charBinaryToRelativeSvg(binary) {
    console.log(9)
}

function clearPaneAndWords() {
    allWordsList = [];
    svgTag.innerHTML = "";
}

function translate() {
    // Fields
    var text = document.getElementById("text");
    var text2 = document.getElementById("text2");

    clearPaneAndWords();

    // Translate
    let wordList = directTranslate(text.value);

    // console.log(cmu_dictionary[text.value]);

    // text2.value = cmu_dictionary[text.value][0];
}

function directTranslate(rawText) {
    let splitText = rawText.trim().split(/\s+/);
    let outputWords = [];
    // Strip out punctuation?

    //for (let i = 0; i < bitToLine.length; i++) {
    // normally translate here?

    console.log(rawText)
    console.log(splitText)
    let newWord = new WordDefinition(rawText, splitText);

    allWordsList.push(newWord);
}

function saveToSVG() {
    //get svg source.
    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(svgTag);

    //add name spaces.
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    //add xml declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    //convert svg source to URI data scheme.
    var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    //set url value to a element's href attribute.
    document.getElementById("dl-as-svg").href = url;
    //you can download svg file by right click menu.
}

function muv(raText) {
    allWordsList[0].mbo();
}
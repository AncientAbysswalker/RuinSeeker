import './RuneLine.js';
import './RuneCircle.js';

import ipaPhonemeToByteCodeAndVowel from '../assets/ipa/ipa_phoneme_to_bytecode.js';
import { binToStr } from '../helpers/binaryString.js';

const diagFactor = Math.sqrt(3) / 2;

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
    init(props, phones) {
        this.props = props;

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
                    this.runeline(this.props, '5u');
                    this.runeline(this.props, '5l');
                } else {
                    this.runeline(this.props, i);
                }
            }
        }

        // Inversion Circle based on byteCode
        if (this.byteCode & 2 ** 11) {
            this.runecircle(this.props);
        }

        // Little Extra Line if either Vertical Line Present
        if ((this.byteCode & 2) || (this.byteCode & 2 ** 9)) {
            this.runeline(this.props, 'x');
        }

        // Horizontal Line, always present
        this.runeline(this.props, 'midline');

        this.stroke({ linecap: 'round' });

        return this;
    }
    updateSizing() {
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
        const runeScale = this.props.runeScale;
        const lineWidth = this.props.lineWidth;
        this.x(i * (2 * diagFactor * runeScale - 0 * lineWidth));
    }
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    rune: function (props, phoneList) {
        return this.put(new SVG.Rune).init(props, phoneList);
    }
});
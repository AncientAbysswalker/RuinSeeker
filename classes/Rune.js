import './RuneLine.js';
import './RuneCircle.js';

import { binToStr } from '../helpers/binaryString.js';
import phoneMap from '../assets/ipa/ipa_phoneme_to_bytecode.js';

const vowelFirstBit = 0b100000000000; // 2 ^ 11
const topVerticalBit = 0b000000000010; // 2 ^ 1
const bottomVerticalBit = 0b001000000000; // 2 ^ 9

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
            this.byteCode = phoneMap[phones[0]].byteCode;
        } else if (phones.length === 2) {
            let p1 = phoneMap[phones[0]];
            let p2 = phoneMap[phones[1]];

            if (p1.isVowel ^ p2.isVowel) {
                this.byteCode = p1.byteCode + p2.byteCode + vowelFirstBit * p1.isVowel;
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
        if (this.byteCode & vowelFirstBit) {
            this.runecircle(this.props);
        }

        // Little Extra Line if either Vertical Line Present
        if ((this.byteCode & topVerticalBit) || (this.byteCode & bottomVerticalBit)) {
            this.runeline(this.props, 'x');
        }

        // Horizontal Line, always present
        this.runeline(this.props, 'midline');

        this.stroke({ linecap: 'round' });

        return this;
    }

    /**
     * Triggers an update to the sizing of the figure. Depends on sizing data contained in ControllerProps
     * 
     * @returns this
     */
    updateSizing() {
        for (const runeLine of this.children()) {
            runeLine.updateStroke().updateSizing();
        }

        return this;
    }

    /**
     * Sets the color of this SVG to the provided value
     * 
     * @param {string} color HEX format color value - e.g. "DCA272" or "#DCA272"
     * 
     * @returns this
     */
    updateColor(color) {
        this.animate().stroke({ color: ((color.charAt(0) === '#') ? color : ('#' + color)) });
    }

    /**
     * Clears the color of this SVG, falling back to the value of the parent SVG element
     * 
     * @returns this
     */
    clearColor() {
        console.log(this.parent().stroke())
        this.animate().stroke({ color: this.parent().stroke() });
    }

    /**
     * Update the style of the Rune. This will update the base positions of any components of the Rune
     * 
     * @returns this
     */
    updateRuneStyle() {
        for (const runeLine of this.children()) {
            runeLine.updateRuneStyle();
        }

        return this;
    }
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    rune: function (props, phoneList) {
        return this.put(new SVG.Rune).init(props, phoneList);
    }
});
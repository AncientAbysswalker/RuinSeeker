import './Figure.js';
import './Rune.js';
import { sin60 } from '../helpers/constants.js';
import ipaPhonemeToByteCodeAndVowel from '../assets/ipa/ipa_phoneme_to_bytecode.js';

/**
 * `SVG`
 * 
 * SVG Class defining a rune word. This class is a container for other individual Rune SVGs
 * 
 * @property {string[]} phones List of phones contained in this rune - length of the list is 1 or 2 phonemes
 * @property {binary} byteCode 12-bit binary representation of what segments are included in the rune
 */
SVG.RuneWord = class extends SVG.Figure {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     * 
     * @param {string[]} phones List of phones contained in this word - phones will be grouped according to rune phoneme rules
     */
    init(props, wordString) {
        this.props = props;

        this.wordString = wordString.toLowerCase();
        this.possiblePhones = undefined;
        this.currentPhones = undefined;
        this.runes = [];

        this.data('word', this.wordString, true);

        // Check the dictionary
        let searchTheDictionary = this.props.ipaDict[this.wordString];
        if (!searchTheDictionary) {
            console.error('Cannot create rune word! Provided word is not in the dictionary.');
            return;
        }

        // Get phones
        this.possiblePhones = searchTheDictionary.map((phoneOption) => phoneOption.split(' ')); //Change this with new parser! No need to split on " "
        this.currentPhones = this.possiblePhones[0];

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
            const newRune = this.rune(this.props, phonemePair);
            this.updateRunePosition(newRune, i);
            this.runes.push(newRune);
        }

        return this;
    }

    /**
     * `Method` `Getter`
     * 
     * Get the current width of this `RuneWord`
     */
    width() { // TODO move to datum
        const runeScale = this.props.runeScale;
        const lineWidth = this.props.lineWidth;
        return 2 * sin60 * runeScale * this.runes.length + lineWidth;
    }

    /**
     * `Method` `Getter`
     * 
     * Get the current height of this `RuneWord`
     */
    height() { // TODO move to datum
        const runeScale = this.props.runeScale;
        const lineWidth = this.props.lineWidth;
        return 3 * runeScale + lineWidth;
    }

    /**
     * `Method` `Setter`
     * 
     * Triggers an update to the sizing of the figure. Depends on sizing data contained in ControllerProps
     * 
     * @returns this
     */
    updateSizing() {
        for (let i = 0; i < this.runes.length; i++) {
            const rune = this.runes[i];
            rune.updateSizing();
            this.updateRunePosition(rune, i);
        }
    }

    /**
     * `Method` `Setter`
     * 
     * Update the positioning of a child Rune SVG within the parent RuneWord
     * 
     * @param {SVG.Rune} rune Child Rune to update the positioning of within the RuneWord parent
     * @param {number} index Index of the Rune within the RuneWord
     */
    updateRunePosition(rune, index) {
        const runeScale = this.props.runeScale;
        const lineWidth = this.props.lineWidth;
        rune.x(index * (2 * sin60 * runeScale - 0 * lineWidth));
    }

    /**
     * `Method` `Setter`
     * 
     * Sets the color of this SVG to the provided value
     * 
     * @param {string} color HEX format color value - e.g. "DCA272" or "#DCA272"
     * 
     * @returns this
     */
    updateColor(color) {
        return this.animate().stroke({ color: ((color.charAt(0) === '#') ? color : ('#' + color)) });
    }

    /**
     * `Method` `Setter`
     * 
     * Clears the color of this SVG, falling back to the value of the parent SVG element
     * 
     * @returns this
     */
    clearColor() {
        return this.animate().stroke({ color: this.parent().stroke() });
    }

    /**
     * `Method` `Checker`
     * 
     * Returns if this `Figure` is an instance of the `RuneWord` class
     * 
     * @returns boolean
     */
    isRuneWord() {
        return true;
    }
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    runeword: function (props, wordString) {
        return this.put(new SVG.RuneWord).init(props, wordString);
    }
});
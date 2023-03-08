import './Figure.js';
import './Rune.js';
import { sin60 } from '../helpers/constants.js';
import ipaPhonemeToByteCodeAndVowel from '../assets/ipa/ipa_phoneme_to_bytecode.js';

/**
 * `SVG`
 * 
 * SVG Class defining a rune word. This class is a container for other individual Rune SVGs
 * 
 * @property {ControllerProps} props
 * @property {string} wordString Full word string to be converted into runes
 * @property {string[][]} possiblePhones List of possible pronounciations - each as a list of phones within the pronounciation
 * @property {string[]} currentPhones List of phones within the chosen pronounciation
 * @property {SVG.Rune[]} runes List of Runes withing the RuneWord
 */
SVG.RuneWord = class extends SVG.Figure {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     * 
     * @property {ControllerProps} props
     * @property {string} wordString Full word string to be converted into runes
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

        // Get the list of different possible phone combinations and select the first as the one that we want by default
        this.possiblePhones = searchTheDictionary.map((phoneOption) => phoneOption.split(' ')); // TODO Perhaps change with new parser! No need to split on " "?

        this.choosePronounciation(0);

        return this;
    }

    /**
     * Get the current width of this `RuneWord`
     */
    width() { // TODO move to datum
        const runeScale = this.props.runeScale;
        const lineWidth = this.props.lineWidth;
        return 2 * sin60 * runeScale * this.runes.length + lineWidth;
    }

    /**
     * Get the current height of this `RuneWord`
     */
    height() { // TODO move to datum
        const runeScale = this.props.runeScale;
        const lineWidth = this.props.lineWidth;
        return 3 * runeScale + lineWidth;
    }

    /**
     * Select which pronounciation from the possible pronounciations is desired
     * 
     * @param {number} pronounciationIndex Index of pronounciation from possiblePhones that is desired
     * 
     * @returns this
     */
    choosePronounciation(pronounciationIndex) {
        if (pronounciationIndex >= this.possiblePhones.length) {
            console.error('Invalid pronounciation selected!')
            return this;
        }

        // Set current phones and generate associated Runes
        this.currentPhones = this.possiblePhones[pronounciationIndex];
        this.data('phones', this.currentPhones, true);
        this.generateRunesFromCurrentPhones();

        return this;
    }

    /**
     * Clear the RuneWord and generate Runes associated with the current selected pronounciation
     * 
     * @returns this
     */
    generateRunesFromCurrentPhones() {
        // Clear any current contents before generating new Runes
        this.clear();

        // Create phoneme pairs
        let phonemePairs = [];
        let i = 0;
        while (i < this.currentPhones.length) {
            // If there is only one more phone left, or if the next two phones are both vowels ar not vowels, we only append one phone. Otherwise the two are grouped into a pair.
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
            this.runes.push(newRune);
            this.updateRunePosition(newRune, i);
        }

        return this;
    }

    /**
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
     * Delete all Runes currently within the RuneWord
     */
    clear() {
        for (const currentRune of this.runes) {
            currentRune.remove();
        }
        this.runes = [];
    }

    /**
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
     * Clears the color of this SVG, falling back to the value of the parent SVG element
     * 
     * @returns this
     */
    clearColor() {
        return this.animate().stroke({ color: this.parent().stroke() });
    }

    /**
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
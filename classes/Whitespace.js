import './Figure.js';

/**
 * `SVG`
 * 
 * SVG Class defining a white space figure. This class is fairly dumb, and mostly contains metadata.
 * 
 * @property {string} whitespaceString Full whitespace string
 * @property {number} trailingNewlines Number of newlines pertinent to positioning
 * @property {number} trailingSpaces Number of spaces pertinent to positioning
 */
SVG.Whitespace = class extends SVG.Figure {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     * 
     * @param {string} whitespace Full whitespace string
     */
    init(props, whitespaceString) {
        this.props = props;

        this.whitespaceString = whitespaceString.word; //TODO change this stupid word thing!
        this.trailingNewlines = 0;
        this.trailingSpaces = 0;

        this.trailingNewlines = (this.whitespaceString.match(/\r\n|\r|\n/g) || []).length;
        if (this.trailingNewlines > 0) { // Only count the extra spaces at the end after the last newline
            this.trailingSpaces = (this.whitespaceString.match(/[^\S\r\n]+$/g) || [''])[0].length;
        } else {
            this.trailingSpaces = this.whitespaceString.length;
        }

        return this;
    }
    /**
     * `Method` `Checker`
     * 
     * Returns if this `Figure` is an instance of the `Whitespace` class
     * 
     * @returns boolean
     */
    isWhitespace() {
        return true;
    }
    updateSizing() {
        return;
        for (let i = 0; i < this.runes.length; i++) {
            const rune = this.runes[i];
            rune.updateChar();
            this.updateRunePosition(rune, i);
        }
    }
    /**
     * `Method` `Setter`
     * 
     * Does nothing as whitespace cannot have a color
     * 
     * @param {string} color HEX format color value - e.g. "DCA272" or "#DCA272"
     * 
     * @returns SVG.SpecialRune
     */
    updateColor(color) {
        return;
    }
    /**
     * `Method` `Setter`
     * 
     * Does nothing as whitespace cannot have a color
     * 
     * @returns SVG.SpecialRune
     */
    clearColor() {
        return;
    }
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    whitespace: function (props, whitespaceString) {
        return this.put(new SVG.Whitespace).init(props, whitespaceString);
    }
});
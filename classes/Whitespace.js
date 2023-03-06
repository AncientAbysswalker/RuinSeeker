import './Figure.js';

const regexSingleNewline = new RegExp(/\r\n|\r|\n/, 'g');
const regexAllTrailingSpace = new RegExp(/[^\r\n]+$/);

/**
 * `SVG`
 * 
 * SVG Class defining a white space figure. This class is fairly dumb, and mostly contains metadata.
 * 
 * @property {ControllerProps} props
 * @property {string} whitespaceString Full whitespace string
 * @property {number} relevantNewlines Number of newlines relevant to positioning
 * @property {number} relevantSpaces Number of spaces relevant to positioning
 */
SVG.Whitespace = class extends SVG.Figure {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     * 
     * @param {ControllerProps} props
     * @param {string} whitespaceString Full whitespace string
     */
    init(props, whitespaceString) {
        this.props = props;

        this.whitespaceString = whitespaceString.word; //TODO change this stupid word thing!
        this.relevantNewlines = 0;
        this.relevantSpaces = 0;

        // Count all instances of newlines (/r /n or /r/n) as relevant
        this.relevantNewlines = (this.whitespaceString.match(regexSingleNewline) || []).length;

        // Only count the extra spaces at the end after the last newline
        this.relevantSpaces = (this.whitespaceString.match(regexAllTrailingSpace) || [''])[0].length;

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
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    whitespace: function (props, whitespaceString) {
        return this.put(new SVG.Whitespace).init(props, whitespaceString);
    }
});
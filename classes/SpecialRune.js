import './Figure.js';

/**
 * `SVG`
 * 
 * SVG Class defining a white space figure. This class is fairly dumb, and mostly contains metadata.
 * 
 * @property {ControllerProps} props
 * @property {string} whitespaceString Full whitespace string
 * @property {number} topDatum Number of newlines pertinent to positioning
 * @property {number} leftDatum Number of spaces pertinent to positioning
 * @property {string} rightDatum Full whitespace string
 * @property {number} scale Number of newlines pertinent to positioning
 * @property {number} name Number of spaces pertinent to positioning
 */
SVG.SpecialRune = class extends SVG.Figure {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     * 
     * @param {ControllerProps} props
     * @param {string} specialRuneName Name of the special rune that is being created - e.g. 'skull'
     * @param {string} rawSVGText SVG DOM Structure, represented in string format
     * 
     * @returns SVG.SpecialRune
     */
    init(props, specialRuneName, rawSVGText) {
        this.props = props;

        // Metadata
        this.topDatum = 0;
        this.leftDatum = 0;
        this.rightDatum = 0;
        this.scale = 1;
        this.specialRuneName = specialRuneName;

        // Create SVG from text and determine sizing
        let tempSVG = new SVG(rawSVGText);
        let bbox = tempSVG.bbox();
        this.baseHeight = bbox.height;
        this.baseWidth = bbox.width;

        // Put all components of the SVG under this SVG Class as parent, because creating an SVG of the string does odd things in the DOM
        for (const specialRuneComponent of tempSVG.children()) {
            this.put(specialRuneComponent);
        }
        tempSVG.remove();

        // Create a viewbox to set the default size of the SVG and update the sizing to correspond to current settings
        this.viewbox(0, 0, this.baseWidth, this.baseHeight).updateSizing();

        return this;
    }

    /**
     * `Method` `Setter`
     * 
     * Triggers an update to the sizing of the figure. Depends on sizing data contained in ControllerProps
     * 
     * @returns this
     */
    updateSizing() {
        const fullHeight = this.props.fullHeight;
        this.size(null, (this.baseHeight / 100 * fullHeight) * this.scale);

        this.topDatum = (fullHeight * (2 - this.scale - this.baseHeight / 100)) / 2;
        this.leftDatum = -0.1 * this.width();
        this.rightDatum = 1.1 * this.width();

        return this;
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
        return this.animate().fill({ color: ((color.charAt(0) === '#') ? color : ('#' + color)) });
    }

    /**
     * `Method` `Setter`
     * 
     * Clears the color of this SVG, falling back to the value of the parent SVG element
     * 
     * @returns this
     */
    clearColor() {
        return this.animate().fill({ color: this.parent().stroke() });
    }

    /**
     * `Method` `Checker`
     * 
     * Returns if this `Figure` is an instance of the `SpecialRune` class
     * 
     * @returns boolean
     */
    isSpecialRune() {
        return true;
    }
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    specialrune: function (props, specialRuneName, rawSVGText) {
        return this.put(new SVG.SpecialRune).init(props, specialRuneName, rawSVGText);
    }
});
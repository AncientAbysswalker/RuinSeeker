/**
 * `SVG`
 * 
 * SVG Parent Class defining a Figure. Other specific Figures like RuneWord, Whitespace, and SpecialRune will inherit and possibly override these props and methods
 */
SVG.Figure = class extends SVG.Svg {
    /**
     * `Method` `Checker`
     * 
     * Returns if this `Figure` is an instance of the `RuneWord` class
     * 
     * @returns boolean
     */
    isRuneWord() {
        return false;
    }

    /**
     * `Method` `Checker`
     * 
     * Returns if this `Figure` is an instance of the `Whitespace` class
     * 
     * @returns boolean
     */
    isWhitespace() {
        return false;
    }

    /**
     * `Method` `Checker`
     * 
     * Returns if this `Figure` is an instance of the `SpecialRune` class
     * 
     * @returns boolean
     */
    isSpecialRune() {
        return false;
    }

    /**
     * `Method` `Setter`
     * 
     * Triggers an update to the sizing of the figure. Depends on sizing data contained in ControllerProps
     * 
     * @returns this
     */
    updateSizing() {
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
        return this;
    }

    /**
     * `Method` `Setter`
     * 
     * Clears the color of this SVG, falling back to the value of the parent SVG element
     * 
     * @returns this
     */
    clearColor() {
        return this;
    }
}
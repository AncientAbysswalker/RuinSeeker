/**
 * `SVG`
 * 
 * SVG Parent Class defining a figure. Other specific figures like RuneWord, Whitespace, and SpecialRune will inherit and possibly override these props and methods
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
}
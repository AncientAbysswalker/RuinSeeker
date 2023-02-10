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
SVG.SpecialRune = class extends SVG.Figure {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     * 
     * @param {string} whitespace Full whitespace string
     * 
     * @returns SVG.SpecialRune
     */
    init(props, rawSVGText) {
        this.props = props;

        this.topDatum = 0;
        this.leftDatum = 0;
        this.rightDatum = 0;
        this.baseHeight = 100;
        this.baseWidth = 78.880165;
        this.scale = 1;
        this.name = 'skull';

        // Some sory of %vertical scale?

        //let x = this.svg(skulltext);
        // let head = skulltext.match(/(?<=\<svg )(.*?)(?=\>)/)[0];
        // let body = skulltext.match(/(?<=\<svg )(.*?)(?=\>)/)[0];

        let y = new SVG(rawSVGText);
        this.baseHeight = y.data('baseheight');
        this.baseWidth = y.data('basewidth');
        console.log(this.baseHeight)
        console.log(this.baseWidth)


        // console.log(y)
        // console.log(head)

        // //controller.add(x)
        // console.log(y)
        // console.log(y.children())
        // // let x = this.svg(y.children());

        // console.log(this)
        for (const specialRuneComponent of y.children()) {
            this.put(specialRuneComponent);
        }

        //x.remove();
        // console.log('test')
        // console.log(x.children()[0].data('baseheight'))
        // console.log(x.children()[0].data('basewidth'))
        // console.log(x.children(0).data('basewidth'))
        // console.log(x.children(0).data('baseheight'))
        // console.log(x.children().width(), x.children().height())

        y.remove();

        return this.viewbox(0, 0, this.baseWidth, this.baseHeight).updateSizing();
    }



    updateSizing() {
        const runeScale = this.props.runeScale;
        const lineWidth = this.props.lineWidth;
        this.size(null, (this.baseHeight / 100 * Math.round(3 * runeScale) + lineWidth) * this.scale);
        // this.size(null, (this.baseHeight / 100 * Math.round(3 * runeScale)) * this.scale);

        this.topDatum = ((runeScale * 3) * (1 - this.scale)) / 2;
        // this.topDatum = ((runeScale * 3) * (1 - this.scale) + lineWidth) / 2;
        this.leftDatum = -0.1 * this.width();
        this.rightDatum = 1.1 * this.width();

        return this;
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
    /**
     * `Method` `Setter`
     * 
     * Sets the color of this SVG to the provided value
     * 
     * @param {string} color HEX format color value - e.g. "DCA272" or "#DCA272"
     * 
     * @returns SVG.SpecialRune
     */
    updateColor(color) {
        return this.animate().fill({ color: ((color.charAt(0) === '#') ? color : ('#' + color)) });
    }

    /**
     * `Method` `Setter`
     * 
     * Clears the color of this SVG, falling back to the value of the parent SVG element
     * 
     * @returns SVG.SpecialRune
     */
    clearColor() {
        return this.animate().fill({ color: this.parent().stroke() });
    }
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    specialrune: function (props, rawSVGText) {
        return this.put(new SVG.SpecialRune).init(props, rawSVGText);
    }
});
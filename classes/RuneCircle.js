const diagFactor = Math.sqrt(3) / 2;

/**
 * `SVG`
 * 
 * SVG Class defining the vowel circle of a rune
 * 
 * @property {string} segId Segment ID
 */
SVG.RuneCircle = class extends SVG.Circle {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     */
    init(props) {
        this.props = props;

        this.segId = 'circle';
        this.data('segId', 'circle', true);
        this.fill({ opacity: 0 })

        return this.updateStroke().updateAnchors()
    }
    /**
     * `Method`
     * 
     * Update the stroke thickness to the current value
     */
    updateStroke() {
        const lineWidth = this.props.lineWidth
        this.stroke({ width: lineWidth });

        return this;
    }
    /**
     * `Method`
     * 
     * Update the center of this segment based on thickness and character size values
     */
    updateAnchors() {
        const runeScale = this.props.runeScale
        const lineWidth = this.props.lineWidth

        this.cx(diagFactor * runeScale + lineWidth / 2);
        this.cy(3 * runeScale + lineWidth / 2);
        this.radius(diagFactor * runeScale / 4);

        return this;
    }
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    runecircle: function (props) {
        return this.put(new SVG.RuneCircle).init(props);
    }
});
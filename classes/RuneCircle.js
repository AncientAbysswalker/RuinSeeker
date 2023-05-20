import { cos60, sin60 } from '../helpers/trig.js';
import { runeCircleRatio, runeStyle, vowelStyle } from '../helpers/constants.js';
import { getStyleShift, getVowelShift, getVowelOpacity } from '../helpers/shiftVectors.js';

/**
 * @typedef {Object} Point
 * @property {number} x X position
 * @property {number} y Y position
 */

/**
 * `SVG`
 * 
 * SVG Class defining the vowel circle of a rune
 * 
 * @property {ControllerProps} props
 * @property {string} segId Segment ID
 * @property {IdPoint} pc Center point of the circle
 */
SVG.RuneCircle = class extends SVG.Circle {
    /**
     * `Post-Constructor`
     * 
     * Assigns all important props on creation
     * 
     * @param {ControllerProps} props
     * @param {string} segId Segment ID
     */
    init(props) {
        this.props = props;

        this.segId = 'circle';
        this.pc = null;
        this.data('segId', 'circle', true);
        this.fill({ opacity: 0 });
        this.active = true;

        return this.updateSegment()
    }

    /**
     * Triggers an update to all the features of the figure. Depends on data contained in ControllerProps
     * 
     * @param {boolean=} animate Whether to animate this update or not.
     * 
     * @returns this
     */
    updateSegment(animate) {
        const a = animate || false;

        // Property Updates
        this.updateStroke();
        this.updateRuneStyle();
        this.updateBasePositions();

        // Run SVG Update
        this.updateSVG(a);

        return this;
    }

    /**
     * Update the stroke thickness to the current value. Depends on sizing data contained in ControllerProps
     * 
     * @returns this
     */
    updateStroke() {
        const lineWidth = this.props.lineWidth;
        this.stroke({ width: lineWidth });

        return this;
    }

    /**
     * Update the center of this segment based on thickness and character size values
     * 
     * @returns this
     */
    updateBasePositions() {
        this.pc = {
            x: sin60,
            y: 6 * cos60
        }

        // Style Shift
        const styleShift = getStyleShift(this, 12);
        const vowelShift = getVowelShift(this, 12);
        this.pc.x += styleShift.x + vowelShift.x;
        this.pc.y += styleShift.y + vowelShift.y;

        return this;
    }

    /**
     * Triggers an update to the sizing of the figure. Depends on sizing data contained in ControllerProps
     * 
     * @param {boolean=} animate Whether to animate this update or not.
     * 
     * @returns this
     */
    updateSVG(animate) {
        const r = animate ? this.animate() : this;

        const segmentLength = this.props.segmentLength;
        const lineWidth = this.props.lineWidth;

        r.cx(
            this.pc.x * segmentLength + lineWidth / 2
        ).cy(
            this.pc.y * segmentLength + lineWidth / 2
        ).attr(
            "r", segmentLength * runeCircleRatio // * this.active
        ).opacity(
            +this.active // Needs to be case to number or it has issues
        )

        return this;
    }

    /**
     * Update the style of the segment. Depends on data contained in ControllerProps
     * 
     * @returns this
     */
    updateRuneStyle() {
        // Opacity from vowelStyle
        const currentVowelStyle = this.props.vowelStyle;
        this.active = [vowelStyle.LOW_CIRCLE, vowelStyle.MID_CIRCLE, vowelStyle.HIGH_CIRCLE].includes(currentVowelStyle);

        return this;
    }
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    runecircle: function (props) {
        return this.put(new SVG.RuneCircle).init(props);
    }
});
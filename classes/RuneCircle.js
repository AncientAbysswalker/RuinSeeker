const diagFactor = Math.sqrt(3) / 2;
import { cos60, sin60 } from '../helpers/trig.js';
import { runeCircleRatio, runeStyle, vowelStyle } from '../helpers/constants.js';
import { styleShift } from '../helpers/shiftVectors.js';

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
        this.fill({ opacity: 0 })

        return this.updateStroke().updateBasePositions().updateSizing()
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
        const currentStyleShift = styleShift[this.props.runeStyle];
        this.pc.x += (currentStyleShift && currentStyleShift['c'] != null) ? currentStyleShift['c'].x : 0;
        this.pc.y += (currentStyleShift && currentStyleShift['c'] != null) ? currentStyleShift['c'].y : 0;

        return this;
    }

    /**
     * Triggers an update to the sizing of the figure. Depends on sizing data contained in ControllerProps
     * 
     * @param {SVG.Runner} runner If this event is to be animated, pass it an SVG.Runner to control the animation
     * 
     * @returns this
     */
    updateSizing(runner) {
        const r = runner || this;

        const segmentLength = this.props.segmentLength;
        const lineWidth = this.props.lineWidth;

        r.cx(
            this.pc.x * segmentLength + lineWidth / 2
        ).cy(
            this.pc.y * segmentLength + lineWidth / 2
        ).attr(
            "r", segmentLength * runeCircleRatio
        );

        return this;
    }

    /**
     * Update the style of the RuneCircle. This will update the base positions of the RuneLine's points
     * 
     * @returns this
     */
    updateRuneStyle() {
        const runner = this.animate();

        this.updateBasePositions().updateSizing(runner);

        return this;
    }
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    runecircle: function (props) {
        return this.put(new SVG.RuneCircle).init(props);
    }
});
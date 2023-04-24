import { cos60, sin60 } from '../helpers/trig.js';
import { runeCircleRatio, runeStyle, vowelStyle } from '../helpers/constants.js';
import { getStyleShift, getVowelOpacity } from '../helpers/shiftVectors.js';

/**
 * @typedef {Object} Point
 * @property {number} x X position
 * @property {number} y Y position
 */

/**
 * `SVG`
 * 
 * SVG Class defining the vowel diamond of a rune
 * 
 * @property {ControllerProps} props
 * @property {string} segId Segment ID
 * @property {IdPoint} pc Center point of the circle
 */
SVG.RuneDiamond = class extends SVG.Polygon {
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

        this.segId = 'diamond';
        this.pc = null;
        this.data('segId', 'diamond', true);
        this.fill({ opacity: 0 });
        this.stroke({ linecap: 'round' });
        this.active = false;

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
        const styleShift = getStyleShift(this, 12);
        this.pc.x += styleShift.x;
        this.pc.y += styleShift.y;

        // Update Vertices
        this.pu = {
            x: this.pc.x,
            y: this.pc.y - this.active * cos60 / 2
        }
        this.pl = {
            x: this.pc.x + this.active * sin60 / 2,
            y: this.pc.y
        }
        this.pd = {
            x: this.pc.x,
            y: this.pc.y + this.active * cos60 / 2
        }
        this.pr = {
            x: this.pc.x - this.active * sin60 / 2,
            y: this.pc.y
        }

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

        r.plot([
            [segmentLength * this.pu.x + lineWidth / 2, segmentLength * this.pu.y + lineWidth / 2],
            [segmentLength * this.pl.x + lineWidth / 2, segmentLength * this.pl.y + lineWidth / 2],
            [segmentLength * this.pd.x + lineWidth / 2, segmentLength * this.pd.y + lineWidth / 2],
            [segmentLength * this.pr.x + lineWidth / 2, segmentLength * this.pr.y + lineWidth / 2]
        ]).opacity(
            +this.active // Needs to be case to number or it has issues
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

        // Opacity from vowelStyle
        const currentVowelStyle = this.props.vowelStyle;
        this.active = [vowelStyle.MID_DIAMOND].includes(currentVowelStyle);

        this.updateBasePositions().updateSizing(runner);

        return this;
    }
}

// Extend the SVG definition to include a constructor for this class
SVG.extend(SVG.Container, {
    runediamond: function (props) {
        return this.put(new SVG.RuneDiamond).init(props);
    }
});
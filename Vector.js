/**
 * Class representing a standard Vector
 * @prop {number} x - x position
 * @prop {number} y - y position
 */
class Vector {
    /**
     * Create a Vector.
     * @param {number} x - x position
     * @param {number} y - y position
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Change the vector's position to a new point
     * @param {number} x - x position
     * @param {number} y - y position
     */
    changePosition(x, y) {
        this.x = x;
        this.y = y;
    }
}

export default Vector;
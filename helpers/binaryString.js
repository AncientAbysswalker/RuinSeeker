/**
  * Convert a number into string representation of the binary
  * 
  * @param {number} bin
  * 
  * @returns string
  */
export function binToStr(bin) {
    return (bin >>> 0).toString(2);
}

/**
  * Convert a string representation of binary into number representation
  * 
  * @param {string} str
  * 
  * @returns number
  */
export function strToBin(str) {
    return parseInt(str, 2);
}
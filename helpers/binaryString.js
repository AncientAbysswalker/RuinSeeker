export function binToStr(bin) {
    return (bin >>> 0).toString(2);
}

export function strToBin(str) {
    return parseInt(str, 2);
}
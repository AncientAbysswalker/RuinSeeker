
export function regexIdentifyGroups(...regexGroupExpressions) {
    return new RegExp("(" + regexGroupExpressions.map((regexGroupExpression) => regexGroupExpression.source).join(")|(") + ")", 'g');
}

export function regexValidComposite(...regexGroupExpressions) {
    return new RegExp("^((" + regexGroupExpressions.map((regexGroupExpression) => regexGroupExpression.source).join(")|(") + "))*$");
}
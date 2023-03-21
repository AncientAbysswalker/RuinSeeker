/**
  * Create a RegExp that will identify groupings based on individual group RegExp
  * 
  * @param {RegExp[]} regexGroupExpressions
  * 
  * @returns RegExp
  */
export function regexIdentifyGroups(...regexGroupExpressions) {
    return new RegExp("(" + regexGroupExpressions.map((regexGroupExpression) => regexGroupExpression.source).join(")|(") + ")", 'g');
}

/**
  * Create a RegExp that will validate a string is composed ONLY of groups identified by individual group RegExp
  * 
  * @param {RegExp[]} regexGroupExpressions
  * 
  * @returns RegExp
  */
export function regexValidComposite(...regexGroupExpressions) {
    return new RegExp("^((" + regexGroupExpressions.map((regexGroupExpression) => regexGroupExpression.source).join(")|(") + "))*$");
}

/**
 * Recursively finds the function identifier given an AST node.
 * The top-level call shoudl be a CallExpression.
 * @param {ASTNode | undefined} node
 * @returns {String | null}
 */
function getCalledFunctionIdentifierName (node) {
    if (!node) return null

    switch (node.type) {
        case 'Identifier':
            return node.name
        case 'CallExpression':
            return getCalledFunctionIdentifierName(node.callee)
        case 'MemberExpression':
            return getCalledFunctionIdentifierName(node.object)
        case 'ThisExpression':
        case 'Super':
            return getCalledFunctionIdentifierName(node.parent.property) // try backtracking
        default:
            return null
    }
}

function isIdentifier(node) {
    return node && node.type === 'Identifier'
}

function isFunctionDeclaration(node) {
    return node && node.type === 'FunctionDeclaration'
}

function isArrowFunctionExpression(node) {
    return node && node.type === 'ArrowFunctionExpression'
}

function isVariableDeclarator(node) {
    return node && node.type === 'VariableDeclarator'
}

function isNewExpression(node) {
    return node && node.type === 'NewExpression'
}

function isCallExpression (node) {
    return node && node.type === 'CallExpression'
}

function isMemberExpression (node) {
    return node && node.type === 'MemberExpression'
}

/**
 *  Utility functions to detect async function nodes
 * */

function isAsyncFunctionDeclaration (node) {
    return isFunctionDeclaration(node) && node.async
}

function isAsyncArrowFunctionExpression (node) {
    return isArrowFunctionExpression(node) && node.async
}

function isAsyncVariableDeclarator (node) {
    return isVariableDeclarator(node) && isAsyncArrowFunctionExpression(node.init)
}

function isFunctionNodeAsync (node) {
    return isAsyncFunctionDeclaration(node) || isAsyncVariableDeclarator(node)
}

function isReturnStatement (node) {
    return node && node.type === 'ReturnStatement'
}

/**
 *  Utility functions to for synchronous function nodes
 * */

/**
 * Whether an Identifier is a Promise literal
 * @param {Identifier} node 
 */
function isIdentifierPromiseLiteral (node) {
    return isIdentifier(node) && node.name === 'Promise'
}

/**
 * Whether a NewExpression is constructing a Promise
 * @example return new Promise(...)
 * @param {NewExpression} node 
 */
function isNewExpressionConstructingPromise (node) {
    return isNewExpression(node) && isIdentifierPromiseLiteral(node.callee)
}

function isIdentifierResolveOrReject (node) {
    return isIdentifier(node) && ['resolve','reject'].includes(node.name)
}

/**
 * Whether a ReturnStatement explicitly returns a promise
 * @param {ReturnStatement} node 
 */
function isReturnStatementPromise (node) {
    return isReturnStatement(node) &&
        (   // return new Promise(...)
            isNewExpressionConstructingPromise(node.argument) ||
            // return Promise.resolve() or Promise.reject()
            isCallExpression(node.argument) &&
            isMemberExpression(node.argument.callee) &&
            isIdentifierPromiseLiteral(node.argument.callee.object) &&
            isIdentifierResolveOrReject(node.argument.callee.property)
        )
}

/**
 * Function to detect whether a synchronous function node returns a Promise.
 * Currently this only detects cases where a return
 * @param {ASTNode | undefined} node 
 * @returns {Boolean}
 */
function isSyncFunctionReturningPromise (node) {
    if (!node) return false

    switch (node.type) {
        case 'FunctionDeclaration':
        case 'ArrowFunctionExpression':
        case 'FunctionExpression':
            return isSyncFunctionReturningPromise(node.body)
        case 'ReturnStatement': // base case
            return isReturnStatementPromise(node)
        case 'BlockStatement':
            return node.body.some(x => isSyncFunctionReturningPromise(x))
        case 'VariableDeclaration':
            return node.declarations.some(x => isSyncFunctionReturningPromise(x))
        case 'VariableDeclarator':
            return isSyncFunctionReturningPromise(node.init)
        case 'IfStatement':
            return isSyncFunctionReturningPromise(node.consequent) || isSyncFunctionReturningPromise(node.alternate)
        default:
            return false // TODO: return Identifier
    }
}

function isFunctionReturningPromise (node) {
    return isFunctionNodeAsync(node) || isSyncFunctionReturningPromise(node)
}

function isCalleeNotUsingCatchExpression (node) {
    return isIdentifier(node) || // e.g. f()
        (isMemberExpression(node) && node.property.name !== 'catch')// e.g. f().then(...)
}

/**
 * Finds the AST node of the function being called in a CallExpression
 * @param {CallExpression} node ASTNode of type CallExpression
 * @param {Scope} scope The scope of the node
 */
function findFunctionNodeFromCallExpression (node, scope) {
    if (node && node.type !== 'CallExpression') return null
    // Find out whether the called function is async
    const functionName = getCalledFunctionIdentifierName(node)

    // Could not get the function name
    if (functionName === null) return null

    const functionVariable = scope.set.get(functionName)

    // Could not find the Variable
    if (!functionVariable) return null

    // Get the AST node of the function declaration that is being called
    const functionDefs = functionVariable.defs
    const lastFunctionDef = functionDefs[functionDefs.length - 1] // in case of repeated function definitions

    return lastFunctionDef.node
}

/**
 * Tests whether a call expression should be using a catch statement
 * @param {CallExpression} node ASTNode of type CallExpression
 * @param {Scope} scope The scope of the CallExpression
 * @returns {Boolean | null}
 */
function isCallExpressionNotUsingCatch(node, scope) {
    if (!node || node.type !== 'CallExpression' || !scope) return null

    // Get the AST node of the function that is being called
    const functionNode = findFunctionNodeFromCallExpression(node, scope)

    if (!functionNode) return null

    // Function being called does not return a Promise
    if (!isFunctionReturningPromise(functionNode)) return false

    // Async function called without using await
    return isCalleeNotUsingCatchExpression(node.callee)
}

module.exports = {
    meta: {
        type: "suggestion",
    },
    create (context) {
        return {
            "ExpressionStatement > CallExpression": function(node) {
                const scope = context.getScope()

                if (isCallExpressionNotUsingCatch(node, scope)) {
                    context.report({
                        node,
                        message: `Missing catch statement.`
                    })
                }
            },
        }
    }
}


/**
 * Recursively finds the function identifier given an AST node.
 * The top-level call shoudl be a CallExpression.
 * @param {ASTNode | undefined} node
 * @returns {String | null}
 */
function getCalledFunctionIdentifierName (node) {
    if (node === undefined) return null

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

/**
 *  Utility functions to detect async function nodes
 * */

function isAsyncFunctionDeclaration (node) {
    return node && node.type === 'FunctionDeclaration' && node.async
}

function isAsyncArrowFunctionExpression (node) {
    return node && node.type === 'ArrowFunctionExpression' && node.async
}

function isAsyncVariableDeclarator (node) {
    return node && node.type === 'VariableDeclarator' && isAsyncArrowFunctionExpression(node.init)
}

function isFunctionNodeAsync (node) {
    return isAsyncFunctionDeclaration(node) || isAsyncVariableDeclarator(node)
}

/**
 *  Utility functions to for synchronous function nodes
 * */

/**
 * Whether an Identifier is a Promise literal
 * @param {Identifier} node 
 */
function isIdentifierPromiseLiteral (node) {
    return node && node.type === 'Identifier' && node.name === 'Promise'
}

/**
 * Whether a NewExpression is constructing a Promise
 * @example return new Promise(...)
 * @param {NewExpression} node 
 */
function isNewExpressionConstructingPromise (node) {
    return node && node.type === 'NewExpression' && isIdentifierPromiseLiteral(node.callee)
}

/**
 * Whether a ReturnStatement explicitly returns a promise
 * @param {ReturnStatement} node 
 */
function isReturnStatementPromise (node) {
    return node && node.type === 'ReturnStatement' &&
        (   // return new Promise(...)
            isNewExpressionConstructingPromise(node.argument) ||
            // return Promise.resolve() or Promise.reject()
            node.argument && node.argument.type === 'CallExpression' && node.argument.callee && node.argument.callee.type === 'MemberExpression' && node.argument.callee.object && node.argument.callee.object.type === 'Identifier' && node.argument.callee.object.name === 'Promise' && node.argument.callee.property.type === 'Identifier' && node.argument.callee.property && ['resolve', 'reject'].includes(node.argument.callee.property.name)
        )
}

/**
 * Function to detect whether a synchronous function node returns a Promise.
 * Currently this only detects cases where a return
 * @param {ASTNode | undefined} node 
 * @returns {Boolean}
 */
function isSyncFunctionReturningPromise (node) {
    if (node === undefined) return false

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
    return node &&
        (node.type === 'Identifier' || // e.g. f()
        (node.type === 'MemberExpression' && node.property.name !== 'catch'))// e.g. f().then(...)
}

module.exports = {
    meta: {
        type: "suggestion",
    },
    create (context) {
        return {
            "ExpressionStatement > CallExpression": function(callExpr) {
                const scope = context.getScope()

                // Find out whether the called function is async
                const functionName = getCalledFunctionIdentifierName(callExpr)

                // Could not get the function name
                if (functionName === null) return

                const functionVariable = scope.set.get(functionName)

                // Could not find the Variable
                if (!functionVariable) return

                // Get the AST node of the function declaration that is being called
                const functionDefs = functionVariable.defs
                const lastFunctionDef = functionDefs[functionDefs.length - 1] // in case of repeated function definitions
                const functionNode = lastFunctionDef.node

                // Function being called does not return a Promise
                if (!isFunctionReturningPromise(functionNode)) return

                // Async function called without using await
                const callee = callExpr.callee
                if (isCalleeNotUsingCatchExpression(callee)) {
                    context.report({
                        node: callExpr,
                        message: `Missing catch statement.`
                    })
                }
            },
        }
    }
}

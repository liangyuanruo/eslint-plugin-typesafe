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
            throw new Error(`Unknown node encountered in typesafe/promise-catch:\t${node.type}`)
    }
}

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
                if (!isFunctionNodeAsync(functionNode)) return

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

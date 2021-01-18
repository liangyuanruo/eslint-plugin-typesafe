function getCalledFunctionIdentifierName (node) {
    switch (node.type) {
        case 'Identifier':
            return node.name
        case 'CallExpression':
            return getCalledFunctionIdentifierName(node.callee)
        case 'MemberExpression':
            return getCalledFunctionIdentifierName(node.object)
        default:
            throw new Error('Unknown node type:', node.type)
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
                const functionVariable = scope.set.get(functionName)

                if (functionVariable) {
                    const functionDefs = functionVariable.defs
                    const lastFunctionDef = functionDefs[functionDefs.length - 1] // in case of repeated function definitions
                    const functionNode = lastFunctionDef.node

                    // Async function called without using await
                    if (isFunctionNodeAsync(functionNode)) {
                        const callee = callExpr.callee
                        if (
                            callee.type === 'Identifier' || // e.g. f()
                            (callee.type === 'MemberExpression' && callee.property.name !== 'catch') // e.g. f().then(...)
                        ) {
                            context.report({
                                node: callExpr,
                                message: `Missing catch statement.`
                            })
                        }
                    }
                }
            },
        }
    }
}

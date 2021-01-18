function getCalledFunctionName(node) {
    switch (node.type) {
        case 'Identifier':
            return node.name
        case 'CallExpression':
            return getCalledFunctionName(node.callee)
        case 'MemberExpression':
            return getCalledFunctionName(node.object)
        default:
            throw new Error('Unknown node type:', node.type)
    }
}

function isFunctionNodeAsync(node) {
    return node.type === 'FunctionDeclaration' && node.async ||
        node.type === 'VariableDeclarator' && node.init && node.init.type === 'ArrowFunctionExpression' && node.init.async
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
                const functionName = getCalledFunctionName(callExpr)
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

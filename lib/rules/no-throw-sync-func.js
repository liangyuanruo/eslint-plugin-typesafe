module.exports = {
    meta: {
      type: "suggestion",
    },
    create (context) {
      return {
        "FunctionDeclaration[async=false] > BlockStatement ThrowStatement": function (throwNode) {
          context.report({
            node: throwNode,
            message: `Synchronous function declarations should return an instance of Error instead of throwing.`
          })
        },
        "VariableDeclarator > ArrowFunctionExpression[async=false] > BlockStatement ThrowStatement": function (throwNode) {
          context.report({
            node: throwNode,
            message: `Synchronous arrow function expressions should return an instance of Error instead of throwing.`
          })
        },
        "Property > FunctionExpression[async=false] > BlockStatement ThrowStatement": function (throwNode) {
          context.report({
            node: throwNode,
            message: `Synchronous functions in object properties should return an instance of Error instead of throwing.`
          })
        },
        "MethodDefinition[key.name!='constructor'] > FunctionExpression[async=false] > BlockStatement ThrowStatement": function (throwNode) {
          context.report({
            node: throwNode,
            message: `Synchronous methods should return an instance of Error instead of throwing.`
          })
        }
      }
    }
  }
  
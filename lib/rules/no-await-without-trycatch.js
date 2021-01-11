module.exports = {
    meta: {
      type: "suggestion",
    },
    create (context) {
      return {
        AwaitExpression(throwNode) {
          if (context.getAncestors().every(node => node.type != 'TryStatement')) {
            context.report({
              node: throwNode,
              message: `Await expressions should be executed in a try-catch block.`
            })
          }
        },
      }
    }
  }

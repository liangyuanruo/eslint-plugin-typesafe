# disallow throwing in synchronous functions (no-throw-sync-func)

Throwing errors is silent from a method signature point of view, as it is not possible to tell from a caller's perspective without looking at implementation details whether a function might throw an Error.

For example:

```typescript
const f(peopleCount: Array<number>): number => {
    return Math.sum(peopleCount)
}
```

This function has an identical method signature to the one below:

```typescript
const f(peopleCount: Array<number>): number => {
    if peopleCount.some(count => count < 0)
        throw new Error('Count cannot be less than zero.')
    return Math.sum(...peopleCount)
}
```

A better approach is to return the Error instead:

```typescript
const f(peopleCount: Array<number>): number | Error => {
    if peopleCount.some(count => count < 0)
        return new Error('Count cannot be less than zero.')
    return Math.sum(...peopleCount)
}
```

## Rule Details

This rule disallows throwing in synchronous functions.

Examples of **incorrect** code for this rule:

```js
/*eslint no-throw-sync-func: "error"*/
function f() {
    throw new Error()
}

const f = () => {
    throw new Error()
}

const f = {
    g(x) {
        throw new Error()
    }
}

const f = {
    g: (x) => {
        throw new Error()
    }
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-throw-sync-func: "error"*/
const f = async () => {
    throw new Error()
}

const f = {
    async g() {
        throw new Error()
    }
}

Promise.resolve().then(function () {
    throw new Error()
})

Promise.resolve().then(() => {
    throw new Error()
})

class C {
    constructor() {
        throw new Error()
    }
}
```

## When Not To Use It

If you are intentionally throwing exceptions in the code.

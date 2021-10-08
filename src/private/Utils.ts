
export function debugException<A>(
    message: string,
    error: unknown
): undefined {
    if (process.env.NODE_ENV === 'development') {
        console.info(`[Runtime exception] ${message}:`)
        console.error(error)
    }

    return undefined
}


/** Structural equality */
export function equals<A>(a: A, b: A): boolean {
    if (a === b) {
        return true
    }

    if (a instanceof Array && b instanceof Array) {
        return a.length === b.length && a.every((x, i) => equals(x, b[i]))
    }

    if (isObject(a) && isObject(b)) {
        for (const key of Object.keys(a)) {
            if (!(key in b) || !equals(a[key], b[key])) {
                return false
            }
        }

        for (const key of Object.keys(b)) {
            if (!(key in a)) {
                return false
            }
        }

        return true
    }

    // NaN values are not equal between themselves or each other.
    // Without this, `equals(NaN, NaN)` would return `false`.
    if (Number.isNaN(a) && Number.isNaN(b)) {
        return true;
    }

    return a === b
}

export function isObject(a: unknown): a is { [key: string]: unknown } {
    return typeof a === 'object' && a !== null
}

type IJObject = object

export class JObject implements IJObject {
    constructor() {}

    // HACK: null is also object
    equals(obj: JObject | null) {
        return this === obj
    }

    // TODO: hash
    // TODO: clone
}
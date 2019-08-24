'use strict';

const Pinpoint = require('@hapi/pinpoint');


const internals = {
    tracker: null
};


// Module API

exports.Checker = class {

    constructor(allowed) {

        this._set = allowed;
        this._trace = internals.tracker && internals.tracker._register(this);
    }

    test(value) {

        if (this._trace) {
            this._trace.add(value);
        }

        return this._set.includes(value);
    }
};


// Lab external module interface

exports[Symbol.for('@hapi/lab/coverage/initialize')] = function () {

    internals.tracker = internals.tracker || new internals.Tracker();
    return internals.tracker;
};


internals.Tracker = class {

    constructor() {

        this.name = 'Ext',
        this._store = [];
    }

    _register(checker) {

        const { filename, line } = Pinpoint.location(3);
        this._store.push({ filename, line, checker });
        return new Set();
    }

    report(file) {

        const coverage = [];

        for (const { filename, line, checker } of this._store) {
            if (file !== filename) {
                continue;
            }

            const missing = [];
            for (const value of checker._set) {
                if (!checker._trace.has(value)) {
                    missing.push(value);
                }
            }

            if (missing.length) {
                const severity = missing.length > 1 ? 'error' : 'warning';
                coverage.push({ line, severity, message: `Checker missing tests for ${missing.join(', ')}` });
            }
        }

        return coverage.length ? coverage : null;
    }
};

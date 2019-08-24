'use strict';

const Code = require('@hapi/code');
const External = require('..');
const Lab = require('@hapi/lab');


const internals = {};


const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('External', () => {

    it('validates data (without reporting)', () => {

        const checker = new External.Checker([1, 2, 3]);
        expect(checker.test(1)).to.be.true();
        expect(checker.test(4)).to.be.false();
    });

    it('reports missing coverage', () => {

        const tracker = External[Symbol.for('@hapi/lab/coverage/initialize')]();

        const checker1 = new External.Checker([1, 2, 3]);
        checker1.test(1);

        const checker2 = new External.Checker([1, 2, 3]);
        checker2.test(1);
        checker2.test(2);

        const checker3 = new External.Checker([1, 2, 3]);
        checker3.test(1);
        checker3.test(2);
        checker3.test(3);

        expect(tracker.report(__filename)).to.equal([
            {
                line: 28,
                message: 'Checker missing tests for 2, 3',
                severity: 'error'
            },
            {
                line: 31,
                message: 'Checker missing tests for 3',
                severity: 'warning'
            }
        ]);

        expect(tracker.report('missing')).to.be.null();
        expect(External[Symbol.for('@hapi/lab/coverage/initialize')]()).to.equal(tracker);
    });
});

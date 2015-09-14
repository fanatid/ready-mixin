import { expect } from 'chai'

import readyMixin from '../src'

function runTests (Promise) {
  class TestCls {}
  readyMixin(TestCls.prototype)

  let tc
  beforeEach(() => {
    tc = new TestCls()
  })

  describe('success', () => {
    beforeEach(() => {
      expect(tc.isReady()).to.be.false
    })

    afterEach(() => {
      expect(tc.isReady()).to.be.true
    })

    it('promise', () => {
      tc._ready(null, 'mixin')
      return tc.ready
        .then((val) => { expect(val).to.equal('mixin') })
    })

    it('callback', (done) => {
      tc.onReady((err, val) => {
        expect(err).to.be.null
        expect(val).to.equal('mixin')
        done()
      })

      tc._ready(null, 'mixin')
    })
  })

  describe('fail', () => {
    beforeEach(() => {
      expect(tc.isReady()).to.be.false
    })

    afterEach(() => {
      expect(tc.isReady()).to.be.false
    })

    it('promise', () => {
      let error = Symbol()
      tc._ready(error)
      return tc.ready
        .then(() => { throw error })
        .catch((err) => { expect(err).to.equal(error) })
    })

    it('callback', (done) => {
      let error = Symbol()

      tc.onReady((err) => {
        expect(err).to.equal(error)
        done()
      })

      tc._ready(error)
    })
  })

  describe('ready with few arguments', () => {
    beforeEach(() => {
      expect(tc.isReady()).to.be.false
      tc._ready(null, 1, 2)
      expect(tc.isReady()).to.be.true
    })

    afterEach(() => {
      expect(tc.isReady()).to.be.true
    })

    it('spread is true', (done) => {
      tc.onReady((err, val1, val2) => {
        expect(err).to.be.null
        expect(val1).to.equal(1)
        expect(val2).to.equal(2)
        done()
      }, {spread: true})
    })

    it('spread is false', (done) => {
      tc.onReady((err, val1, val2) => {
        expect(err).to.be.null
        expect(val1).to.deep.equal([1, 2])
        expect(val2).to.be.undefined
        done()
      }, {spread: false})
    })
  })
}

var promises = {
  'Promise': Promise,
  'bluebird': require('bluebird'),
  // 'Q': require('q'),
  'lie': require('lie')
}

for (let key of Object.keys(promises)) {
  describe(key, () => { runTests(promises[key]) })
}

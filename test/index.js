import { expect } from 'chai'
import bluebird from 'bluebird'

import readyMixin from '../src'

function runTests (Promise) {
  function TestCls () {}
  readyMixin(Promise)(TestCls.prototype)

  var tc

  beforeEach(function () {
    tc = new TestCls()
  })

  describe('success', function () {
    beforeEach(function () {
      expect(tc.isReady()).to.be.false
    })

    afterEach(function () {
      expect(tc.isReady()).to.be.true
    })

    it('promise', function (done) {
      bluebird.try(function () {
        return tc.ready
      })
      .asCallback(function (err, val) {
        expect(err).to.be.null
        expect(val).to.equal('mixin')
        done()
      })
      tc._ready(null, 'mixin')
    })

    it('callback', function (done) {
      tc.onReady(function (err, val) {
        expect(err).to.be.null
        expect(val).to.equal('mixin')
        done()
      })
      tc._ready(null, 'mixin')
    })
  })

  describe('fail', function () {
    beforeEach(function () {
      expect(tc.isReady()).to.be.false
    })

    afterEach(function () {
      expect(tc.isReady()).to.be.false
    })

    it('promise', function (done) {
      bluebird.try(function () {
        return tc.ready
      })
      .asCallback(function (err) {
        expect(err).to.be.instanceof(Error)
        expect(err.message).to.equal('mixin')
        done()
      })
      tc._ready(new Error('mixin'))
    })

    it('callback', function (done) {
      tc.onReady(function (err) {
        expect(err).to.be.instanceof(Error)
        expect(err.message).to.equal('mixin')
        done()
      })
      tc._ready(new Error('mixin'))
    })
  })

  describe('ready with few arguments', function () {
    beforeEach(function () {
      expect(tc.isReady()).to.be.false
      tc._ready(null, 1, 2)
      expect(tc.isReady()).to.be.true
    })

    afterEach(function () {
      expect(tc.isReady()).to.be.true
    })

    it('spread is true', function (done) {
      tc.onReady(function (err, val1, val2) {
        expect(err).to.be.null
        expect(val1).to.equal(1)
        expect(val2).to.equal(2)
        done()
      }, {spread: true})
    })

    it('spread is false', function (done) {
      tc.onReady(function (err, val1, val2) {
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

Object.keys(promises).forEach((key) => {
  describe(key, () => { runTests(promises[key]) })
})

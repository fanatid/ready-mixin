/* global describe, xdescribe, beforeEach, afterEach, it */
var expect = require('chai').expect
var bluebird = require('bluebird')

function runTests (Promise) {
  function TestCls () {}

  var readyMixin = require('./index')(Promise)
  readyMixin(TestCls.prototype)

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
      .asCallback(function (err, val) {
        expect(err).to.be.instanceof(Error)
        expect(err.message).to.equal('mixin')
        done()
      })
      tc._ready(new Error('mixin'))
    })

    it('callback', function (done) {
      tc.onReady(function (err, val) {
        expect(err).to.be.instanceof(Error)
        expect(err.message).to.equal('mixin')
        done()
      })
      tc._ready(new Error('mixin'))
    })
  })

  describe('ready with few arguments', function () {
    beforeEach(function () {
      tc._ready(null, 1, 2)
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
  'Promise': (function () { try { return Promise } catch (err) { return } })(),
  'bluebird': require('bluebird'),
  // 'Q': require('q'),
  'lie': require('lie'),
  'es6-promise polyfill': require('es6-promise').Promise
}

Object.keys(promises).forEach(function (key) {
  var kdescribe = promises[key] === undefined
                    ? xdescribe
                    : describe

  kdescribe(key, function () {
    runTests(promises[key])
  })
})

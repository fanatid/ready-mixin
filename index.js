/**
 * Queue of promises, solve next problem:
 *   var promise = require('bluebird').resolve()
 *   console.log('mem usage (before):', process.memoryUsage())
 *   function noop () {}
 *   for (var i = 0; i < 100000; ++i) { promise.then(noop) }
 *   console.log('mem usage (after):', process.memoryUsage())
 */

function getReadyMixin (Promise) {
  return function readyMixin (object) {
    object._readyMixinInitialize = function _readyMixinInitialize () {
      this._readyMixinState = {
        status: null,
        reason: null,
        value: null,
        promises: []
      }
    }

    object._ready = function _ready (err /*, ... */) {
      var self = this

      // initialize if not yet
      if (self._readyMixinState === undefined) {
        self._readyMixinInitialize()
      }

      // return if already resolved or rejected
      if (self._readyMixinState.status !== null) {
        return
      }

      // update status and reject all promises
      if (arguments.length > 0 && err !== null) {
        self._readyMixinState.status = 'reject'
        self._readyMixinState.reason = err
        self._readyMixinState.promises.forEach(function (promise) {
          promise.reject(self._readyMixinState.reason)
        })
        self._readyMixinState.promises = []
        return
      }

      // update status and collect all values
      self._readyMixinState.status = 'resolve'
      if (arguments.length <= 2) {
        self._readyMixinState.value = arguments[1]
      } else {
        self._readyMixinState.value = new Array(arguments.length - 1)
        for (var i = 0; i < self._readyMixinState.value.length; ++i) {
          self._readyMixinState.value[i] = arguments[i + 1]
        }
      }

      // resolve all promises
      self._readyMixinState.promises.forEach(function (promise) {
        promise.resolve(self._readyMixinState.value)
      })
      self._readyMixinState.promises = []
    }

    Object.defineProperty(object, 'ready', {
      configurable: true,
      enumerable: true,
      get: function () {
        var self = this

        // initialize if not
        if (self._readyMixinState === undefined) {
          self._readyMixinInitialize()
        }

        if (self._readyMixinState.status === 'resolve') {
          // resolve
          return Promise.resolve(self._readyMixinState.value)

        } else if (self._readyMixinState.status === 'reject') {
          // reject
          return Promise.reject(self._readyMixinState.reason)

        } else {
          // create new promise
          return new Promise(function (resolve, reject) {
            self._readyMixinState.promises.push({
              resolve: resolve,
              reject: reject
            })
          })
        }
      }
    })

    object.onReady = function onReady (callback, opts) {
      function onResolve (value) {
        // resolve with few values
        if (opts !== undefined && Object(opts).spread) {
          return callback.apply(null, [null].concat(value))
        }

        // resolve with one value
        callback(null, value)
      }

      // get promise
      return this.ready.then(onResolve, function (err) { callback(err) })
    }

    object.isReady = function () {
      var state = this._readyMixinState
      return state && state.status === 'resolve' || false
    }
  }
}

var readyMixins = {}

module.exports = function generator (Promise) {
  if (readyMixins[Promise] === undefined) {
    readyMixins[Promise] = getReadyMixin(Promise)
  }

  return readyMixins[Promise]
}

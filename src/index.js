import getCustomPromise from 'custom-promise-for-package'

export default getCustomPromise((Promise) => {
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
      // initialize if not yet
      if (this._readyMixinState === undefined) {
        this._readyMixinInitialize()
      }

      // return if already resolved or rejected
      if (this._readyMixinState.status !== null) {
        return
      }

      // update status and reject all promises
      if (arguments.length > 0 && err !== null) {
        this._readyMixinState.status = 'reject'
        this._readyMixinState.reason = err
        this._readyMixinState.promises.forEach((promise) => {
          promise.reject(this._readyMixinState.reason)
        })
        this._readyMixinState.promises = []
        return
      }

      // update status and collect all values
      this._readyMixinState.status = 'resolve'
      if (arguments.length <= 2) {
        this._readyMixinState.value = arguments[1]
      } else {
        this._readyMixinState.value = new Array(arguments.length - 1)
        for (let i = 0; i < this._readyMixinState.value.length; ++i) {
          this._readyMixinState.value[i] = arguments[i + 1]
        }
      }

      // resolve all promises
      this._readyMixinState.promises.forEach((promise) => {
        promise.resolve(this._readyMixinState.value)
      })
      this._readyMixinState.promises = []
    }

    Object.defineProperty(object, 'ready', {
      configurable: true,
      enumerable: true,
      get: function () {
        // initialize if not yet
        if (this._readyMixinState === undefined) {
          this._readyMixinInitialize()
        }

        // already resolved
        if (this._readyMixinState.status === 'resolve') {
          return Promise.resolve(this._readyMixinState.value)
        }

        // already rejected
        if (this._readyMixinState.status === 'reject') {
          return Promise.reject(this._readyMixinState.reason)
        }

        // create and save new promise
        return new Promise((resolve, reject) => {
          this._readyMixinState.promises.push({
            resolve: resolve,
            reject: reject
          })
        })
      }
    })

    object.onReady = function onReady (callback, opts) {
      function onResolve (value) {
        // resolve with few values
        if (Object(opts).spread) {
          return callback.apply(null, [null].concat(value))
        }

        // resolve with one value
        callback(null, value)
      }

      return this.ready.then(onResolve, (err) => { callback(err) })
    }

    object.isReady = function isReady () {
      let state = this._readyMixinState
      return state && state.status === 'resolve' || false
    }
  }
})

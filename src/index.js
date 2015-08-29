export default function (object) {
  object._readyMixinInitialize = function () {
    this._readyMixinState = {
      status: null,
      reason: null,
      value: null,
      promises: []
    }
  }

  object._ready = function (err, ...args) {
    // initialize if not yet
    if (this._readyMixinState === undefined) {
      this._readyMixinInitialize()
    }

    // return if already resolved or rejected
    if (this._readyMixinState.status !== null) {
      return
    }

    // update status and reject all promises
    if (err !== null) {
      this._readyMixinState.status = 'reject'
      this._readyMixinState.reason = err
      for (let promise of this._readyMixinState.promises) {
        promise.reject(this._readyMixinState.reason)
      }
      this._readyMixinState.promises = []
      return
    }

    // update status and collect all values
    this._readyMixinState.status = 'resolve'
    this._readyMixinState.value = args.length === 1 ? args[0] : args
    for (let promise of this._readyMixinState.promises) {
      promise.resolve(this._readyMixinState.value)
    }
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

  object.onReady = function (callback, opts) {
    function onResolve (value) {
      // resolve with few values
      if (Object(opts).spread) {
        return callback.apply(null, [null].concat(value))
      }

      // resolve with as one value
      callback(null, value)
    }

    return this.ready.then(onResolve, (err) => { callback(err) })
  }

  object.isReady = function () {
    let state = this._readyMixinState
    return state && state.status === 'resolve' || false
  }
}

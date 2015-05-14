module.exports = function generator (Promise) {
  return function readyMixin (object) {
    object._initReadyPromise = function _initReadyPromise () {
      var self = this
      self._isReady = false
      self._readyPromise = new Promise(function (resolve, reject) {
        self._readyResolve = resolve
        self._readyReject = reject
      })
    }

    object._ready = function _ready (err /*, ... */) {
      if (this._readyPromise === undefined) {
        this._initReadyPromise()
      }

      if (arguments.length > 0 && err !== null) {
        return this._readyReject(err)
      }

      this._isReady = true

      if (arguments.length <= 2) {
        return this._readyResolve(arguments[1])
      }

      this._readyResolve(Array.prototype.slice.call(arguments, 1))
    }

    Object.defineProperty(object, 'ready', {
      configurable: true,
      enumerable: true,
      get: function () {
        if (this._readyPromise === undefined) {
          this._initReadyPromise()
        }

        return this._readyPromise
      }
    })

    object.onReady = function onReady (callback, opts) {
      function onResolve (value) {
        if (opts !== undefined && Object(opts).spread) {
          return callback.apply(null, [null].concat(value))
        }

        callback(null, value)
      }

      return this.ready.then(onResolve, function (err) { callback(err) })
    }

    object.isReady = function () {
      return this._isReady || false
    }
  }
}

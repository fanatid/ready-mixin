function getReadyMixin (Promise) {
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

      var args = new Array(arguments.length - 1)
      for (var i = 0; i < args.length; ++i) {
        args[i] = arguments[i + 1]
      }

      this._readyResolve(args)
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

var readyMixins = {}

module.exports = function generator (Promise) {
  if (readyMixins[Promise] === undefined) {
    readyMixins[Promise] = getReadyMixin(Promise)
  }

  return readyMixins[Promise]
}

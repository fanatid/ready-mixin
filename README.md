# ready-mixin

[![build status](https://img.shields.io/travis/fanatid/ready-mixin.svg?branch=master&style=flat-square)](http://travis-ci.org/fanatid/ready-mixin)
[![Coverage Status](https://img.shields.io/coveralls/fanatid/ready-mixin.svg?style=flat-square)](https://coveralls.io/r/fanatid/ready-mixin)
[![Dependency status](https://img.shields.io/david/fanatid/ready-mixin.svg?style=flat-square)](https://david-dm.org/fanatid/ready-mixin#info=dependencies)
[![Dev Dependency status](https://img.shields.io/david/fanatid/ready-mixin.svg?style=flat-square)](https://david-dm.org/fanatid/ready-mixin#info=devDependencies)

[![NPM](https://nodei.co/npm/ready-mixin.png?downloads=true)](https://www.npmjs.com/package/ready-mixin)
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

You have class with async constructor and you don't want use callback in constructor or make inheritance from some event emitter? Try [ready-mixin](https://github.com/fanatid/ready-mixin)!

## Installation

```
npm install ready-mixin
```

## Initialization

Ready-mixin uses [promises](https://promisesaplus.com/) but doesn't have hard dependencies on the specific library.

You can use [embedded promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), [bluebird](https://github.com/petkaantonov/bluebird), [Q](https://github.com/kriskowal/q), [lie](https://github.com/calvinmetcalf/lie), [promise polyfill](https://github.com/jakearchibald/es6-promise) or [other promise library](https://www.npmjs.com/search?q=promises).

All what you need just call module with specific promise object:

```js
var Promise = require('bluebird')
var readyMixin = require('ready-mixin')(Promise)
```

## API

### readyMixin(obj)

After importing and generating `readyMixin` you can use it as mixin:

```js
var Promise = require('bluebird')
var readyMixin = require('ready-mixin')(Promise)

function User (userId) {
  var self = this
  db.load(userId, function (err, data) {
    if (err === null) {
      self._data = data
    }

    self._ready(err)
  })
}

readyMixin(User.prototype)

var user = new User(0)
user.ready.then(function () {
  console.log('user was loaded!')
}, function (err) {
  console.log('error on loading user!', err)
})

```

### readyMixin#_ready(err, ...)

Resolve or reject ready promise.

### readyMixin#ready

**return**: `Promise`

Return ready promise.

### readyMixin#onReady(callback, opts)

`callback` is node-style callback function

`opts` now uses only for `{spread: boolean}`:

```js
var Promise = require('bluebird')
var readyMixin = require('ready-mixin')(Promise)

function A () {
  var self = this
  setTimeout(function () {
    self._ready(null, 1, 2, 3)
  }, 1000)
}

readyMixin(A)

var a = new A()
a.onReady(function (err, v1, v2, v3) {
  console.log('Sum:', v1 + v2 + v3) // Sum: 6
}, {spread: true})
```

### readyMixin#isReady()

**return**: `boolean`

Return current ready status.

## License

Code released under [the MIT license](https://github.com/fanatid/ready-mixin/blob/master/LICENSE).

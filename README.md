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

## API

### readyMixin(obj)

Mixes readyMixin to obj.

### readyMixin#_ready(err, ...)

Resolve or reject ready promise.

### readyMixin#ready

Return ready promise.

**return**: `Promise`

### readyMixin#onReady(callback, opts)

  * `function` callback is node-style callback function
  * `Object` [opts]
    * `boolean` [spread]

### readyMixin#isReady()

Return current ready status.

**return**: `boolean`

## Exaples

###

```js
var readyMixin = require('ready-mixin')

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

### spread in onReady

```js
var readyMixin = require('ready-mixin')

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

## License

Code released under [the MIT license](LICENSE).

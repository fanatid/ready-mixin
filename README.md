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

### _ready(err, ...)

Resolve or reject ready promise.

### ready()

Return ready promise.

**return**: `Promise`

### onReady(callback, opts)

  * `function` callback is node-style callback function
  * `Object` [opts]
    * `boolean` [spread]

### isReady()

Return current ready status.

**return**: `boolean`

## Examples

###

```js
import { mixin } from 'core-decorators'
import ReadyMixin from 'ready-mixin'

@mixin(ReadyMixin)
class User {
  constructor (userId) {
    db.load(userId, (err, data) => {
      if (err === null) {
        this._data = data
      }

      this._ready(err)
    })
  }
}

let user = new User(0)
user.ready
  .then(() => {
    console.log('user was loaded!')
  }, (err) => {
    console.log('error on loading user!', err)
  })
```

### spread in onReady

```js
import { mixin } from 'core-decorators'
import ReadyMixin from 'ready-mixin'

@mixin(ReadyMixin)
class A {
  constructor () {
    setTimeout(() => { this._ready(null, 1, 2, 3) }, 1000)
  }
}

let a = new A()
a.onReady((err, v1, v2, v3) => {
  console.log(`Sum: ${v1 + v2 + v3}`) // Sum: 6
}, {spread: true})
```

## License

Code released under [the MIT license](LICENSE).

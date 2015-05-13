# Backbone Service

Simple service class for Backbone.

[![Travis build status](http://img.shields.io/travis/thejameskyle/backbone.service.svg?style=flat)](https://travis-ci.org/thejameskyle/backbone.service)
[![Code Climate](https://codeclimate.com/github/thejameskyle/backbone.service/badges/gpa.svg)](https://codeclimate.com/github/thejameskyle/backbone.service)
[![Test Coverage](https://codeclimate.com/github/thejameskyle/backbone.service/badges/coverage.svg)](https://codeclimate.com/github/thejameskyle/backbone.service)
[![Dependency Status](https://david-dm.org/thejameskyle/backbone.service.svg)](https://david-dm.org/thejameskyle/backbone.service)
[![devDependency Status](https://david-dm.org/thejameskyle/backbone.service/dev-status.svg)](https://david-dm.org/thejameskyle/backbone.service#info=devDependencies)

## Usage

> _**Note:** Backbone.Service requires a global `Promise` object to
> exist, please include a `Promise` polyfill if necessary._

```js
import Service from 'backbone.service';

const AuthService = new Service({
  start() {
    this.user = new User();
    return this.user.fetch();
  },

  isAuthenticated() {
    return this.user.get('isAuthenticated');
  },

  authenticate() {
    this.user.authenticate();
  }
});

const Page = View.extend({
  render() {
    AuthService.request('isAuthenticated').then(isAuthenticated => {
      if (isAuthenticated) {
        this.$el.html('Welcome!');
      } else {
        this.$el.html('Permission denied.')
        AuthService.command('authenticate');
        this.listenToOnce(AuthService, 'authenticated', this.render);
      }
    });
  }
});
```

## Contibuting

### Getting Started

[Fork](https://help.github.com/articles/fork-a-repo/) and
[clone](http://git-scm.com/docs/git-clone) this repo.

```
git clone git@github.com:thejameskyle/backbone.service.git && cd backbone.service
```

Make sure [Node.js](http://nodejs.org/) and [npm](https://www.npmjs.org/) are
[installed](http://nodejs.org/download/).

```
npm install
```

### Running Tests

```
npm test
```

===

© 2015 James Kyle. Distributed under ISC license.

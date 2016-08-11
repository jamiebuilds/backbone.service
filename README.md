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

const AuthService = Service.extend({
  start() {
    this.user = new User();
    return this.user.fetch();
  },

  requests: {
    isAuthenticated: 'isAuthenticated',
    authenticate: 'authenticate'
  },

  isAuthenticated() {
    return this.user.get('isAuthenticated');
  },

  authenticate() {
    this.user.authenticate();
  },

  onError(err) {
    console.log('Err!', err);
  }
});

const authService = new AuthService();

const Page = View.extend({
  render() {
    authService.request('isAuthenticated').then(isAuthenticated => {
      if (isAuthenticated) {
        this.$el.html('Welcome!');
        return;
      }

      this.$el.html('Permission denied.')
      return authService.request('authenticate').then(() => this.render());
    }).catch(err => {
      this.$el.html('Oh no!');
    });
  }
});

// Which would behave like you wrote all of this:

const Page = View.extend({
  render() {
    Promise.resolve()
      .then(() => {
        if (!authService.isStarted) {
          return authService.start().catch(err => {
            authService.onError(err);
            throw err;
          }))
        }
      })
      .then(() => authService.isAuthenticated().catch(err => {
        authService.onError(err);
        throw err;
      })))
      .then(isAuthenticated => {
        if (isAuthenticated) {
          this.$el.html('Welcome!');
          return;
        }

        this.$el.html('Permission denied.')
        return Promise.resolve()
          .then(() => authService.authenticate().catch(err => {
            authService.onError(err);
            throw err;
          }))
          .then(() => this.render());
        }
      }).catch(err => {
        this.$el.html('Oh no!');
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

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('backbone-metal-classify'), require('backbone-normalize-hash'), require('backbone.radio'), require('underscore'), require('es6-promise')) : typeof define === 'function' && define.amd ? define(['backbone-metal-classify', 'backbone-normalize-hash', 'backbone.radio', 'underscore', 'es6-promise'], factory) : global.Backbone.Service = factory(global.classify, global.normalizeHash, global.Radio, global._, global.PromisePolyfill);
})(this, function (classify, normalizeHash, Radio, _, PromisePolyfill) {
  'use strict';

  var resolved = PromisePolyfill.Promise.resolve();

  Radio.Channel = classify(Radio.Channel);

  /**
   * @class Service
   */
  var backbone_service = Radio.Channel.extend({
    /**
     * @constructs Service
     */
    constructor: function constructor() {
      var _this = this;

      var start = _.once(function () {
        return resolved.then(function () {
          return _this.start();
        });
      });
      var requests = normalizeHash(this, 'requests');

      _.each(requests, function (val, key) {
        _this.reply(key, function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return start().then(function () {
            return _this[key].apply(_this, args);
          })['catch'](function (err) {
            _this.onError(err);
            throw err;
          });
        });
      });

      this._super.apply(this, arguments);
    },

    /**
     * @abstract
     * @method setup
     */
    setup: function setup() {},

    /**
     * @abstract
     * @method start
     */
    start: function start() {},

    /**
     * @abstract
     * @method onError
     */
    onError: function onError() {}
  });

  return backbone_service;
});
//# sourceMappingURL=./backbone.service.js.map
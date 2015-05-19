(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('backbone'), require('backbone.radio'), require('underscore'), require('es6-promise')) : typeof define === 'function' && define.amd ? define(['backbone', 'backbone.radio', 'underscore', 'es6-promise'], factory) : global.Backbone.Service = factory(global.Backbone, global.Radio, global._, global.PromisePolyfill);
})(this, function (Backbone, Radio, _, PromisePolyfill) {
  'use strict';

  var resolved = PromisePolyfill.Promise.resolve();

  /**
   * @class Service
   */
  var backbone_service = Backbone.Model.extend.call(Radio.Channel, {

    /**
     * @constructs Service
     * @param {Object} methods
     */
    constructor: function constructor(props) {
      var _this = this;

      _.each(props, function (value, name) {
        // Add the property directly to the service object.
        _this[name] = value;

        // Leave non-functions and initialize() as is.
        if (!_.isFunction(value) || name === 'initialize') {
          return;
        }

        if (name !== 'start') {
          value = function () {
            var _this2 = this,
                _arguments = arguments;

            // Ensure service is always started.
            return this.request('start').then(function () {
              return _this2[name].apply(_this2, _arguments);
            });
          };
        } else {
          // start method should only ever be called once.
          value = _.once(function () {
            return resolved.then(function () {
              return _this.start();
            });
          });
        }

        // Register as both a Request and Command for convenience.
        _this.reply(name, value);
        _this.comply(name, value);
      });
    },

    /**
     * @abstract
     * @method initialize
     */
    initialize: function initialize() {},

    /**
     * @abstract
     * @method start
     */
    start: function start() {}
  });

  return backbone_service;
});
//# sourceMappingURL=./backbone.service.js.map
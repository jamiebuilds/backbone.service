(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('backbone'), require('backbone.radio'), require('underscore')) : typeof define === 'function' && define.amd ? define(['backbone', 'backbone.radio', 'underscore'], factory) : global.Backbone.Service = factory(global.Backbone, global.Radio, global._);
})(this, function (Backbone, Radio, _) {
  'use strict';

  var backbone_service = Backbone.Model.extend.call(Radio.Channel, {

    /**
     * @constructs Service
     * @param {Object} methods
     */
    constructor: function constructor(methods) {
      var _this = this;

      _.each(methods, function (method, name) {
        // start method should only ever be called once.
        if (name === 'start') {
          method = _.once(method);
        }

        // Add the method directly to the service object.
        _this[name] = method;

        if (name !== 'start') {
          method = function () {
            var _this2 = this,
                _arguments = arguments;

            // Ensure service is always started.
            return Promise.resolve(this.start()).then(function () {
              _this2[name].apply(_this2, _arguments);
            });
          };
        } else {
          method = function () {
            return Promise.resolve(this.start.apply(this, arguments));
          };
        }

        // Register as both a Request and Command for convenience.
        _this.reply(name, method);
        _this.comply(name, method);
      });
    },

    /**
     * @abstract
     * @method start
     */
    start: function start() {}
  });

  return backbone_service;
});
//# sourceMappingURL=./backbone.service.js.map
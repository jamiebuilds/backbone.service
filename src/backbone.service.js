import Radio from 'backbone.radio';
import _ from 'underscore';
import PromisePolyfill from 'es6-promise';

const resolved = PromisePolyfill.Promise.resolve();

//copy of Backbone.js extend function
Radio.Channel.extend = function(protoProps, staticProps) {
  const parent = this;
  let child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent constructor.
  if (protoProps && _.has(protoProps, 'constructor')) {
    child = protoProps.constructor;
  } else {
    child = function() {
      return parent.apply(this, arguments);
    };
  }

  // Add static properties to the constructor function, if supplied.
  _.extend(child, parent, staticProps);

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function and add the prototype properties.
  child.prototype = _.create(parent.prototype, protoProps);
  child.prototype.constructor = child;

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = parent.prototype;

  return child;
};

/**
 * @class Service
 */
export default Radio.Channel.extend({
  /**
   * @constructs Service
   */
  constructor() {
    let start = _.once(() => resolved.then(() => this.start()));
    let requests = _.result(this, 'requests');
    _.each(requests, (val, key) => {
      this.reply(key, (...args) => {
        let promise = start().then(() => this[val](...args));

        promise.catch(err => {
          this.onError(err);
        });

        return promise;
      });
    });

    Radio.Channel.prototype.constructor.apply(this, ...arguments);
  },

  /**
   * @abstract
   * @method setup
   */
  setup() {},

  /**
   * @abstract
   * @method start
   */
  start() {},

  /**
   * @abstract
   * @method onError
   */
  onError() {}
});

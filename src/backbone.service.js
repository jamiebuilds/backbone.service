import Backbone from 'backbone';
import Radio from 'backbone.radio';
import _ from 'underscore';
import PromisePolyfill from 'es6-promise';

const resolved = PromisePolyfill.Promise.resolve();

/**
 * @class Service
 */
export default Backbone.Model.extend.call(Radio.Channel, {

  /**
   * @constructs Service
   * @param {Object} methods
   */
  constructor(props) {
    _.each(props, (value, name) => {
      // Add the property directly to the service object.
      this[name] = value;

      // Leave non-functions and initialize() as is.
      if (!_.isFunction(value) || name === 'initialize') {
        return;
      }

      if (name !== 'start') {
        value = function() {
          // Ensure service is always started.
          return this.request('start').then(() => this[name](...arguments));
        };
      } else {
        // start method should only ever be called once.
        value = _.once(() => resolved.then(() => this.start()));
      }

      // Register as both a Request and Command for convenience.
      this.reply(name, value);
      this.comply(name, value);
    });
  },

  /**
   * @abstract
   * @method initialize
   */
  initialize() {},

  /**
   * @abstract
   * @method start
   */
  start() {}
});

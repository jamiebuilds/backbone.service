import Backbone from 'backbone';
import Radio from 'backbone.radio';
import _ from 'underscore';

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
      // start method should only ever be called once.
      if (name === 'start') {
        value = _.once(value);
      }

      // Add the property directly to the service object.
      this[name] = value;

      // Leave non-functions and initialize() as is.
      if (!_.isFunction(value) || name === 'initialize') {
        return;
      }

      if (name !== 'start') {
        value = function() {
          // Ensure service is always started.
          return Promise.resolve(this.start()).then(() => {
            return this[name](...arguments);
          });
        };
      } else {
        value = function() {
          return Promise.resolve(this.start(...arguments));
        };
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

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
  constructor(methods) {
    _.each(methods, (method, name) => {
      // start method should only ever be called once.
      if (name === 'start') {
        method = _.once(method);
      }

      // Add the method directly to the service object.
      this[name] = method;

      if (name !== 'start') {
        method = function() {
          // Ensure service is always started.
          return Promise.resolve(this.start()).then(() => {
            this[name](...arguments);
          });
        };
      } else {
        method = function() {
          return Promise.resolve(this.start(...arguments));
        };
      }

      // Register as both a Request and Command for convenience.
      this.reply(name, method);
      this.comply(name, method);
    });
  },

  /**
   * @abstract
   * @method start
   */
  start() {}
});

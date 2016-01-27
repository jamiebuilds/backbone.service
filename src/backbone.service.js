import classify from 'backbone-metal-classify';
import Radio from 'backbone.radio';
import _ from 'underscore';
import PromisePolyfill from 'es6-promise';

const resolved = PromisePolyfill.Promise.resolve();

Radio.Channel = classify(Radio.Channel);

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

    this._super(...arguments);
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

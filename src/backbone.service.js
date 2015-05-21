import classify from 'backbone-metal-classify';
import normalizeHash from 'backbone-normalize-hash';
import Radio from 'backbone.radio';
import _ from 'underscore';
import PromisePolyfill from 'es6-promise';

const resolved = PromisePolyfill.Promise.resolve();

Radio.Channel = classify(Radio.Channel);

/**
 * @private
 * @method wrapHash
 * @param {Object} hash
 * @param {Function} start
 */
function wrapHash(service, type, start) {
  let hash = normalizeHash(service, type);

  _.each(hash, (val, key) => {
    hash[key] = (...args) => {
      return start()
        .then(() => service[key](...args))
        .catch(err => {
          service.onError(err);
          throw err;
        });
    };
  });

  return hash;
}

/**
 * @class Service
 */
export default Radio.Channel.extend({
  /**
   * @constructs Service
   */
  constructor() {
    let start = _.once(() => resolved.then(() => this.start()));

    let requests = wrapHash(this, 'requests', start);
    let commands = wrapHash(this, 'commands', start);

    this.reply(requests);
    this.comply(commands);
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

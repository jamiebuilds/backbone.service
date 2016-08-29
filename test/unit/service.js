import Service from '../../src/backbone.service';
import {Promise} from 'es6-promise';

describe('Service', function() {
  beforeEach(function() {
    this.MyService = Service.extend({
      setup: stub(),
      start: stub(),
      onError: stub(),

      requests: {
        foo: 'foo',
        bar: 'bar2',
        getOption: 'getOption'
      },

      foo: stub(),
      bar2: stub(),
      getOption: function() {
        return this.options.option;
      }
    });

    this.myService = new this.MyService({option: 1});
  });

  it('should bind requests where the key and value match', function() {
    return this.myService.request('foo').then(() => {
      expect(this.myService.foo).to.have.been.called;
    });
  });

  it('should bind requests where the key and value don\'t match', function() {
    return this.myService.request('bar').then(() => {
      expect(this.myService.bar2).to.have.been.called;
    });
  });

  it('should call start() before calling the function', function() {
    return this.myService.request('foo').then(() => {
      expect(this.myService.start).to.have.been.calledBefore(this.myService.foo);
    });
  });

  it('should only call start() once', function() {
    return Promise.all([
      this.myService.request('foo'),
      this.myService.request('bar')
    ]).then(() => {
      expect(this.myService.start).to.have.been.calledOnce;
    });
  });

  it('should call onError when a request errors', function() {
    this.err = new Error('Err!');
    this.myService.foo.throws(this.err);

    return this.myService.request('foo').then(() => {
      expect(this.myService.foo).to.have.thrown(this.err);
    }, (err) => {
      expect(err).to.equal(this.err);
      expect(this.myService.onError).to.have.been.calledWith(this.err);
    });
  });

  it('should allow passing options object into constructor', function() {
    return this.myService.request('getOption').then((option) => {
      expect(option).to.be.equal(1);
    });
  });
});

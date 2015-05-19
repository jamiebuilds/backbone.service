import Service from '../../src/backbone.service';
import {Promise} from 'es6-promise';

describe('Service', function() {
  beforeEach(function() {
    this.MyService = new Service({
      initialize: stub(),
      start: stub(),
      method: stub(),
      property: 'value'
    });
  });

  it('methods should be registered as commands', function(done) {
    let MyService = this.MyService;

    this.MyService.method = function(arg1, arg2)  {
      return Promise.resolve().then(() => {
        expect(MyService.start).to.have.been.calledOn(MyService);
        expect(arg1).to.equal('arg1');
        expect(arg2).to.equal('arg2');
        expect(this).to.equal(MyService);
      }).then(done, done);
    };

    this.MyService.command('start', 'arg1', 'arg2');
    this.MyService.command('method', 'arg1', 'arg2');
  });

  it('methods should be registered as requests', function() {
    return Promise.all([
      this.MyService.request('start', 'arg1', 'arg2'),
      this.MyService.request('method', 'arg1', 'arg2')
    ]).then(() => {
      // start() gets wrapped by _.once
      expect(this.MyService.start)
        .to.have.been.calledOn(this.MyService);
      expect(this.MyService.method)
        .to.have.been.calledWith('arg1', 'arg2')
        .and.calledOn(this.MyService);
    });
  });

  it('method should be added directly to the Service instance', function() {
    expect(this.MyService.method).to.exist;
  });

  it('should only call start() once', function() {
    return Promise.all([
      this.MyService.request('start'),
      this.MyService.request('start'),
    ]).then(() => {
      expect(this.MyService.start).to.have.been.calledOnce;
    });
  });

  it('should lookup the method at call time', function() {
    let replacementStub = stub();

    this.MyService.start = () => {
      this.MyService.method = replacementStub;
    };

    return this.MyService.request('method').then(() => {
      expect(replacementStub).to.have.been.called;
    });
  });

  it('should call and wait for start() before responding to a request', function() {
    this.MyService.start = () => {
      expect(this.MyService.method).not.to.have.been.called;
    };

    return this.MyService.request('method');
  });

  it('should call and wait for start() before complying to a command', function(done) {
    this.MyService.method = stub();

    this.MyService.start = () => {
      return Promise.resolve().then(() => {
        expect(this.MyService.method).not.to.have.been.called;
      }).then(done, done);
    };

    this.MyService.command('method');
  });

  it('should leave initialize() as is', function() {
    this.MyService.request('initialize');
    this.MyService.command('initialize');
    expect(this.MyService.initialize).not.to.be.called;
  });

  it('should add properties to the service leaving them as is', function() {
    expect(this.MyService).to.have.property('property', 'value');
  });

  it('should not resolve request until returned promise is resolved', function() {
    let callback = stub();

    this.MyService.method = () => {
      return new Promise(resolve => {
        expect(callback).not.to.have.been.called;
        resolve();
        expect(callback).to.have.been.called;
      });
    };

    return this.MyService.request('method').then(callback);
  });
});

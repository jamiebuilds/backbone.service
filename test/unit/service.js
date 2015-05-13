import Service from '../../src/backbone.service';

describe('Service', function() {
  beforeEach(function() {
    this.initializeStub = stub();
    this.startStub = stub();
    this.MyService = new Service({
      initialize: this.initializeStub,
      start: this.startStub,
      method: stub(),
      property: 'value'
    });
  });

  it('methods should be registered as commands', function(done) {
    var _this = this;
    this.MyService.method = function(arg1, arg2)  {
      try {
        // start() gets wrapped by _.once
        expect(_this.startStub)
          .to.have.been.calledWith('arg1', 'arg2')
          .and.calledOn(_this.MyService);
        expect(arg1).to.equal('arg1');
        expect(arg2).to.equal('arg2');
        expect(this).to.equal(_this.MyService);
      } catch (e) {
        return done(e);
      }
      done();
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
      expect(this.startStub)
        .to.have.been.calledWith('arg1', 'arg2')
        .and.calledOn(this.MyService);
      expect(this.MyService.method)
        .to.have.been.calledWith('arg1', 'arg2')
        .and.calledOn(this.MyService);
    });
  });

  it('method should be added directly to the Service instance', function() {
    expect(this.MyService.method).to.exist;
    // start() gets wrapped by _.once
    this.MyService.start();
    expect(this.startStub).to.have.been.called;
  });

  it('should only call start() once', function() {
    this.MyService.request('start');
    this.MyService.request('start');
    expect(this.startStub).to.have.been.calledOnce;
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
    let methodCalled = false;

    this.MyService.start = () => {
      try {
        expect(methodCalled).to.be.false;
      } catch (e) {
        return done(e);
      }
      done();
    };

    this.MyService.method = () => {
      methodCalled = true;
    };

    this.MyService.command('method');
  });

  it('should leave initialize() as is', function() {
    expect(this.MyService.initialize).to.equal(this.initializeStub);
    this.MyService.request('initialize');
    this.MyService.command('initialize');
    expect(this.initializeStub).not.to.be.called;
    this.MyService.initialize();
    expect(this.initializeStub).to.be.called;
  });

  it('should add properties to the service leaving them as is', function() {
    expect(this.MyService).to.have.property('property', 'value');
  });

  it('should not resolve request until returned promise is resolved', function() {
    let resolved = false;

    this.MyService.method = () => {
      return new Promise(resolve => {
        setTimeout(() => {
          expect(resolved).to.be.false;
          resolve();
        }, 1);
      });
    };

    return this.MyService.request('method').then(() => {
      resolved = true;
    });
  });
});

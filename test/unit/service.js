import Service from '../../src/backbone.service';

describe('Service', function() {
  beforeEach(function() {
    this.startStub = stub();
    this.MyService = new Service({
      start: this.startStub,
      method: stub()
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
    this.MyService.start();
    this.MyService.start();
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
});

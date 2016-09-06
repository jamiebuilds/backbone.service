const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
const glob = require('glob');
const path = require('path');
const babelify = require('babelify');
const isparta = require('isparta');
const browserify = require('browserify');
const runSequence = require('run-sequence');
const source = require('vinyl-source-stream');
const rollup = require('rollup').rollup;
const babel = require('rollup-plugin-babel');
const json = require('rollup-plugin-json');
const preset = require('babel-preset-es2015-rollup');
const file = require('gulp-file');

const manifest = require('./package.json');
const config = manifest.babelBoilerplateOptions;
const mainFile = manifest.main;
const destinationFolder = path.dirname(mainFile);
const exportFileName = path.basename(mainFile, path.extname(mainFile));

// Remove the built files
gulp.task('clean', function(cb) {
  del([destinationFolder], cb);
});

// Remove our temporary files
gulp.task('clean-tmp', function(cb) {
  del(['tmp'], cb);
});

// Send a notification when JSHint fails,
// so that you know your changes didn't build
function jshintNotify(file) {
  if (!file.jshint) { return; }
  return file.jshint.success ? false : 'JSHint failed';
}

function jscsNotify(file) {
  if (!file.jscs) { return; }
  return file.jscs.success ? false : 'JSRC failed';
}

function createLintTask(taskName, files) {
  gulp.task(taskName, function() {
    return gulp.src(files)
      .pipe($.plumber())
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.notify(jshintNotify))
      .pipe($.jscs())
      .pipe($.notify(jscsNotify))
      .pipe($.jshint.reporter('fail'));
  });
}

// Lint our source code
createLintTask('lint-src', ['src/**/*.js']);

// Lint our test code
createLintTask('lint-test', ['test/**/*.js']);


function _generate(bundle){
  return bundle.generate({
    format: 'umd',
    moduleName: 'Backbone.Service',
    sourceMap: true,
    globals: {
      'underscore': '_',
      'es6-promise': 'ES6Promise',
      'backbone.radio': 'Backbone.Radio',
      'backbone-metal-classify': 'classify',
    }
  });
}

function bundle(opts) {
  return rollup({
    entry: 'src/' + config.entryFileName + '.js',
    external: ['underscore', 'backbone-metal-classify', 'backbone.radio', 'es6-promise'],
    plugins: [
      json(),
      babel({
        sourceMaps: true,
        presets: [ preset ],
        babelrc: false
      })
    ]
  }).then(bundle => {
    return _generate(bundle);
  }).then(gen => {
    gen.code += '\n//# sourceMappingURL=' + gen.map.toUrl();
    return gen;
  });
}

gulp.task('build', ['lint-src', 'clean'], function(){
  return bundle().then(gen => {
    return file(exportFileName + '.js', gen.code, {src: true})
      .pipe($.plumber())
      .pipe($.sourcemaps.init({loadMaps: true}))
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(destinationFolder))
      .pipe($.filter(['*', '!**/*.js.map']))
      .pipe($.rename(exportFileName + '.min.js'))
      .pipe($.sourcemaps.init({loadMaps: true}))
      .pipe($.uglifyjs({
        outSourceMap: true,
        inSourceMap: destinationFolder + '/' + exportFileName + '.js.map',
      }))
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(destinationFolder));
  });
});

// Bundle our app for our unit tests
gulp.task('browserify', function() {
  var testFiles = glob.sync('./test/unit/**/*');
  var allFiles = ['./test/setup/browserify.js'].concat(testFiles);
  var bundler = browserify(allFiles);
  bundler.transform(babelify.configure({
    sourceMapRelative: __dirname + '/src',
    blacklist: ['useStrict'],
    loose: 'all'
  }));
  var bundleStream = bundler.bundle();
  return bundleStream
    .on('error', function(err){
      console.log(err.message);
      this.emit('end');
    })
    .pipe($.plumber())
    .pipe(source('./tmp/__spec-build.js'))
    .pipe(gulp.dest(''))
    .pipe($.livereload());
});

gulp.task('coverage', ['lint-src', 'lint-test'], function(done) {
  require('babel-core/register')({ modules: 'common', loose: 'all' });
  gulp.src(['src/**/*.js'])
    .pipe($.istanbul({ instrumenter: isparta.Instrumenter }))
    .pipe($.istanbul.hookRequire())
    .on('finish', function() {
      return test()
      .pipe($.istanbul.writeReports())
      .on('end', done);
    });
});

function test() {
  return gulp.src(['test/setup/node.js', 'test/unit/**/*.js'], {read: false})
    .pipe($.mocha({reporter: 'dot', globals: config.mochaGlobals}));
};

// Lint and run our tests
gulp.task('test', ['lint-src', 'lint-test'], function() {
  require('babel-core/register')({ modules: 'common', loose: 'all' });
  return test();
});

// Ensure that linting occurs before browserify runs. This prevents
// the build from breaking due to poorly formatted code.
gulp.task('build-in-sequence', function(callback) {
  runSequence(['lint-src', 'lint-test'], 'browserify', callback);
});

const watchFiles = ['src/**/*', 'test/**/*', 'package.json', '**/.jshintrc', '.jscsrc'];

// Run the headless unit tests as you make changes.
gulp.task('watch', function() {
  gulp.watch(watchFiles, ['test']);
});

// Set up a livereload environment for our spec runner
gulp.task('test-browser', ['build-in-sequence'], function() {
  $.livereload.listen({port: 35729, host: 'localhost', start: true});
  return gulp.watch(watchFiles, ['build-in-sequence']);
});

// An alias of test
gulp.task('default', ['test']);

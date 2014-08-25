'use strict';

var gulp = require('gulp');

var config = require('./_config.js');
var paths = config.paths;
var $ = config.plugins;

var nodefn = require('when/node');
var fs = require('fs');
var exec = require('child_process').exec;
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var istanbul = require('browserify-istanbul');
var browserSync = require('browser-sync');
var templatizer = require('templatizer');

var opts = {
  autoprefixer: [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ]
};

// Turn index.jade into an HTML file.
gulp.task('index.html', function () {
  return gulp.src(paths.app + '/index.jade')
    .pipe($.jade({
      pretty: true
    }))
    .pipe(gulp.dest(paths.tmp))
    .pipe(browserSync.reload({stream: true}));
});

// Device demos
gulp.task('device-demo:html', function () {
  return gulp.src(paths.app + '/device-demo/index.jade')
    .pipe($.jade({
      pretty: true
    }))
    .pipe(gulp.dest(paths.tmp + '/device-demo/'));
});

gulp.task('device-demo:css', function () {
  return gulp.src(paths.app + '/device-demo/main.styl')
    .pipe($.stylus())
    .pipe($.autoprefixer(opts.autoprefixer))
    .pipe($.minifyCss())
    .pipe(gulp.dest(paths.tmp + '/device-demo'));
});

gulp.task('device-demo', ['device-demo:html', 'device-demo:css', 'device-demo:assets']);

// Generate JS functions from Jade templates.
// Run this before any JS task, because Browserify needs to bundle them in.
gulp.task('templates', function () {
  return templatizer(paths.app + '/templates', paths.app + '/js/lib/templates.js');
});

// Common outputs between all of the JS tasks.
var spitJs = function (bundleStream) {
  return bundleStream
    .pipe(source(paths.app + '/js/main.js'))
    .pipe($.rename('main.js'))
    .pipe(gulp.dest(paths.tmp + '/js/'));
};

// Bundles Browserify for production; no source or coverage maps.
gulp.task('js', ['templates'], function () {
  var bundleStream = browserify(paths.app + '/js/main.js')
    .bundle();

  return spitJs(bundleStream);
});

// Bundles Browserify with Istanbul coverage maps.
gulp.task('js:istanbul', ['templates'], function () {
  var bundleStream = browserify(paths.app + '/js/main.js')
    .transform(istanbul({
      ignore: ['**/lib/**']
    }))
    .bundle();

  return spitJs(bundleStream);
});

// Bundles Browserify with sourcemaps.
gulp.task('js:dev', ['templates'], function () {
  var bundleStream = browserify({
      entries: paths.app + '/js/main.js',
      debug: true
    })
    .bundle()
    .on('error', config.handleError);

  return spitJs(bundleStream)
    .pipe(browserSync.reload({stream: true}));
});

// Common actions between all of the CSS tasks
function spitCss() {
  return gulp.src(paths.app + '/css/main.styl')
    .pipe($.stylus())
    .pipe($.autoprefixer(opts.autoprefixer));
}

// Copies over and minifies CSS.
gulp.task('css', function () {
  return spitCss()
    .pipe($.minifyCss())
    .pipe(gulp.dest(paths.tmp + '/css'));
});

// Copies over CSS.
gulp.task('css:dev', function () {
  return spitCss()
    .pipe(gulp.dest(paths.tmp + '/css'))
    .pipe(browserSync.reload({stream: true}));
});

function setUpAssets(prefix, root) {

  // Deletes the assets folder or symlink.
  gulp.task(prefix + 'assets:clean', function () {
    return nodefn.call(exec, 'rm -r "' + paths.tmp + root + '/assets"').catch(function(){});
  });

  // Creates the .tmp folder if it does not already exists.
  gulp.task(prefix + 'mktmp', function () {
    return nodefn.call(exec, 'mkdir -p "' + paths.tmp + root + '"');
  });

  // Copies over assets.
  gulp.task(prefix + 'assets', [prefix + 'assets:clean', prefix + 'mktmp'], function () {
    var dots = new Array(2 + (root.match(/\//g) || []).length).join('../'); //As many ../ as levels in root
    return nodefn.call(fs.symlink, dots + 'app' + root + '/assets', paths.tmp + root + '/assets');
  });

  // Copies over assets for production.
  gulp.task(prefix + 'assets:dist', function () {
    return gulp.src(paths.app + root + '/assets/**/*')
       .pipe(gulp.dest(paths.dist + root + '/assets/'));
  });
}

// Main assets
setUpAssets('', '');

// Device demo assets 
setUpAssets('device-demo:', '/device-demo');

// Minimal development build.
gulp.task('build', ['index.html', 'js:dev', 'css:dev', 'assets']);

// CI testing build, with coverage maps.
gulp.task('build:test', ['index.html', 'js:istanbul', 'css:dev', 'assets']);

// Production-ready build to be deployed on a remote server.
gulp.task('build:deploy', ['build:dist', 'device-demo:dist']);

// Production build of the device demo
gulp.task('device-demo:dist', ['device-demo:css', 'device-demo:html', 'device-demo:assets:dist'], function () {
  return prepareForDistribution(paths.tmp + '/device-demo/index.html', paths.dist + '/device-demo');
});

// Production-ready build.
gulp.task('build:dist', ['index.html', 'js', 'css', 'assets:dist'], function () {
  return prepareForDistribution(paths.tmp + '/index.html', paths.dist);
});

function prepareForDistribution(pathIn, pathOut) {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var htmlFilter = $.filter('**/*.html');
  var assets = $.useref.assets();

  return gulp.src(pathIn)
    .pipe(assets)

    .pipe(jsFilter)
    .pipe($.uglify())
    .pipe(jsFilter.restore())

    .pipe(cssFilter)
    .pipe(cssFilter.restore())

    .pipe(assets.restore())
    .pipe($.useref())

    .pipe(htmlFilter)
    .pipe($.minifyHtml())
    .pipe(htmlFilter.restore())

    .pipe(gulp.dest(pathOut));
}

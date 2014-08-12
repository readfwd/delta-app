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

gulp.task('clean', function () {
  return gulp.src(paths.tmp, { read: false })
    .pipe($.rimraf());
});

gulp.task('clean:dist', function () {
  return gulp.src(paths.dist, { read: false })
    .pipe($.rimraf());
});

gulp.task('index.html', function () {
  return gulp.src(paths.app + '/index.jade')
    .pipe($.jade({
      pretty: true
    }))
    .pipe(gulp.dest(paths.tmp))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('templates', function () {
  templatizer(paths.app + '/templates', paths.app + '/js/lib/templates.js');
});

var spitJs = function (bundleStream) {
  return bundleStream
    .pipe(source(paths.app + '/js/main.js'))
    .pipe($.rename('main.js'))
    .pipe(gulp.dest(paths.tmp + '/js/'));
};

// Bundles Browserify for production.
gulp.task('js', ['templates'], function () {
  var bundleStream = browserify(paths.app + '/js/main.js')
    .bundle();

  return spitJs(bundleStream);
});

// Bundles Browserify with Istanbul.
gulp.task('js:istanbul', ['templates'], function () {
  var bundleStream = browserify(paths.app + '/js/main.js')
    .transform(istanbul({
      ignore: ['**/lib/**']
    }))
    .bundle();

  return spitJs(bundleStream);
});

// Bundles Browserify with sourcemaps.
gulp.task('js:dev', function () {
  var bundleStream = browserify({
      entries: paths.app + '/js/main.js',
      debug: true
    })
    .bundle()
    .on('error', config.handleError);

  return spitJs(bundleStream)
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('css', function () {
  return gulp.src(paths.app + '/css/*.css')
    .pipe(gulp.dest(paths.tmp + '/css/'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('assets:clean', function() {
  return nodefn.call(exec, 'rm -r "' + paths.tmp + '/assets"').catch(function(){});
});

gulp.task('mktmp', function() {
  return nodefn.call(exec, 'mkdir -p "' + paths.tmp + '"');
});

gulp.task('assets', ['assets:clean', 'mktmp'], function() {
  return nodefn.call(fs.symlink, '../app/assets', paths.tmp + '/assets');
});

gulp.task('assets:dist', function() {
  return gulp.src(paths.app + '/assets/**/*')
     .pipe(gulp.dest(paths.dist + '/assets/'));
});

gulp.task('build', ['index.html', 'js', 'css', 'assets']);

gulp.task('build:watch', ['index.html', 'js:dev', 'css', 'assets']);

gulp.task('build:test', ['index.html', 'js:istanbul', 'css', 'assets']);

gulp.task('build:dist', ['index.html', 'js', 'css', 'assets:dist'], function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var htmlFilter = $.filter('**/*.html');
  var assets = $.useref.assets();

  return gulp.src(paths.tmp + '/index.html')
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

    .pipe(gulp.dest(paths.dist));
});

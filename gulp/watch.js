'use strict';

var gulp = require('gulp');

var config = require('./_config.js');
var paths = config.paths;
var $ = config.plugins;

var browserSync = require('browser-sync');

// Common watch hooks.
gulp.task('watch:common', ['build'], function () {
  gulp.watch(paths.app + '/index.jade', ['index.html']);
  gulp.watch(paths.app + '/templates/*.jade', ['templates']);
  gulp.watch(paths.app + '/**/*.js', ['js:dev']);
  gulp.watch(paths.app + '/**/*.css', ['css']);
});

// Build the project and start a web development server.
gulp.task('watch', ['watch:common'], function (done) {
  browserSyncRun(done, paths.tmp);
});

function runPhoneGap() {
  return $.run('cd "' + paths.gap + '" && phonegap serve').exec()
    .pipe($.rename('stdout')) // Will certainly work on Windows!
    .pipe(gulp.dest('/dev'));
}

// Build the project and start a mobile development server.
gulp.task('watch:gap', ['watch:common'], function () {
  return runPhoneGap();
});

function browserSyncRun(done, path) {
  browserSync({
    server: {
      baseDir: path
    },
    port: 4000
  }, function () {
    done();
  });
}

// Serve the ./.tmp folder using a static web development server.
gulp.task('serve', function (done) {
  browserSyncRun(done, paths.tmp);
});

// Serve the ./.tmp folder using a mobile development server.
gulp.task('serve:gap', function () {
  return runPhoneGap();
});

// Serve the ./dist folder using a static web development server.
gulp.task('serve:dist', function (done) {
  browserSyncRun(done, paths.dist);
});

'use strict';

var gulp = require('gulp');

var config = require('./_config.js');
var paths = config.paths;
var $ = config.plugins;

var browserSync = require('browser-sync');

gulp.task('watch:common', ['build'], function () {
  gulp.watch(paths.app + '/index.jade', ['index.html']);
  gulp.watch(paths.app + '/templates/*.jade', ['templates']);
  gulp.watch(paths.app + '/**/*.js', ['js:no-istanbul']);
  gulp.watch(paths.app + '/**/*.css', ['css']);
});

gulp.task('build:serve', ['build'], function(done) {
  browserSyncRun(done, paths.tmp);
});

gulp.task('watch', ['watch:common'], function (done) {
  browserSyncRun(done, paths.tmp);
});

function runPhoneGap() {
  return $.run('cd "' + paths.gap + '" && phonegap serve').exec()
    .pipe($.rename('stdout')) // Will certainly work on Windows!!!
    .pipe(gulp.dest('/dev'));
}

gulp.task('watch:gap', ['watch:common'], function () {
  return  runPhoneGap();
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

gulp.task('serve', function (done) {
  browserSyncRun(done, paths.tmp);
});

gulp.task('serve:dist', function (done) {
  browserSyncRun(done, paths.dist);
});

gulp.task('serve:gap', function () {
  return  runPhoneGap();
});


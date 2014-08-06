'use strict';

var gulp = require('gulp');

var config = require('./_config.js');
var paths = config.paths;
var $ = config.plugins;

var browserSync = require('browser-sync');

function watch() {
  gulp.watch(paths.app + '/index.jade', ['index.html']);
  gulp.watch(paths.app + '/templates/*.jade', ['jade']);
  gulp.watch(paths.app + '/**/*.js', ['js']);
}

gulp.task('watch', ['build', 'serve'], function () {
  watch();
  gulp.watch(paths.tmp + '/*').on('change', function () {
    browserSync.reload();
  });
});

gulp.task('watch:gap', ['build'], function () {
  watch();
  return $.run('cd "' + paths.gap + '" && phonegap serve').exec()
    .pipe($.rename('stdout')) // Will certainly work on Windows!!!
    .pipe(gulp.dest('/dev'));
});

gulp.task('serve', function (done) {
  browserSync({
    server: {
      baseDir: paths.tmp
    }
  }, function () {
    done();
  });
});

gulp.task('serve:dist', function (done) {
  browserSync({
    server: {
      baseDir: paths.dist
    }
  }, function () {
    done();
  });
});


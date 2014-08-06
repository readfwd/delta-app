'use strict';

var gulp = require('gulp');

var config = require('./_config.js');
var paths = config.paths;
var $ = config.plugins;

var browserSync = require('browser-sync');

gulp.task('watch:common', ['build'], function () {
  gulp.watch(paths.app + '/index.jade', ['index.html']);
  gulp.watch(paths.app + '/templates/*.jade', ['jade']);
  gulp.watch(paths.app + '/**/*.js', ['js:no-istanbul']);
  gulp.watch(paths.app + '/**/*.css', ['css']);
});

gulp.task('watch', ['watch:common', 'serve'], function () {
  gulp.watch(paths.tmp + '/**/*').on('change', function () {
    browserSync.reload();
  });
});

function runPhoneGap() {
  return $.run('cd "' + paths.gap + '" && phonegap serve').exec()
    .pipe($.rename('stdout')) // Will certainly work on Windows!!!
    .pipe(gulp.dest('/dev'));
}

gulp.task('watch:gap', ['watch:common'], function () {
  return  runPhoneGap();
});

gulp.task('serve', function (done) {
  browserSync({
    server: {
      baseDir: paths.tmp
    },
    port: 4000
  }, function () {
    done();
  });
});

gulp.task('serve:dist', function (done) {
  browserSync({
    server: {
      baseDir: paths.dist
    },
    port: 4000
  }, function () {
    done();
  });
});

gulp.task('serve:gap', function () {
  return  runPhoneGap();
});



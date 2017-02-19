var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('clean', function() {
  return gulp.src('./dist', { read: false })
    .pipe(clean());
});

gulp.task('sass', function() {
  return gulp.src(['./src/sass/**'])
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    // .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      "browsers": browsers
    }))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(reload({ stream: true }));
});

gulp.task('default', function(callback) {
  runSequence('clean', ['sass', 'sass'],
    callback);
});
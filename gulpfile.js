var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var runSequence = require('run-sequence');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');

var browsers = [
  "> 1%",
  "last 2 versions",
  "ie 9-11"
];

gulp.task('clean', function() {
  return gulp.src('./dist', { read: false })
    .pipe(clean());
});

gulp.task('sass', function() {
  return gulp.src(['./src/sass/demo.scss', './src/sass/tree.scss'])
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    // .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      "browsers": browsers
    }))
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('copy-js', function() {
  gulp.src(['./src/js/tree.js'])
    .pipe(gulp.dest('./dist/js'));

  gulp.src(['./src/js/demo.js'])
    .pipe(gulp.dest('./demo/js'));

  gulp.src(['./src/js/vendor.js'])
    .pipe(browserify({}))
    .pipe(gulp.dest('./demo/js'));

  return gulp.src('./src/js/tree.js')
  .pipe(uglify())
  .pipe(rename({
    basename: "tree.min",
    extname: ".js"
  }))
  .pipe(gulp.dest('./dist/js'));
});

gulp.task('default', function(callback) {
  runSequence('clean', ['sass', 'copy-js'], callback);
});

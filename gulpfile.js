var gulp = require('gulp');

// required plugins
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify'); // min js
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano'); // min css
var del = require('del');
var runSequence = require('run-sequence');
var nunjucksRender = require('gulp-nunjucks-render'); // template engine
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');

// directorio de desarrollo
var src = 'app';
// directorio de produccion
var dist = 'dist';

// browserSync
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: src
    },
  })
})

// sass
gulp.task('sass', function(){
  return gulp.src(src + '/scss/**/*.scss')
  .pipe(sass())
  .pipe(gulp.dest(src + '/css'))
  .pipe(browserSync.reload({
    stream: true
  }))
})

//images
gulp.task('images', function(){
  return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest(dist + '/images'))
});

// fonts
gulp.task('fonts', function() {
  return gulp.src(src + '/fonts/**/*')
  .pipe(gulp.dest(dist + '/fonts'))
})

// js libs
gulp.task('js', function(){
  return gulp.src([
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/sweetalert/dist/sweetalert.min.js'
  ])
  .pipe(gulp.dest(src + '/js'))
  .pipe(browserSync.reload({
    stream: true
  }));
})

// template engine nunjukcs => html
gulp.task('nunjucks', function() {
  return gulp.src(src + '/pages/**/*.+(html|njk|nunjucks)')
    .pipe(nunjucksRender({
      path: [src + '/templates/']
    }))
    .pipe(gulp.dest(src))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// watch
gulp.task('watch',['browserSync', 'sass'], function(){
  gulp.watch(src + '/*.html', browserSync.reload);
  gulp.watch(src + '/scss/**/*.scss', ['sass']);
  gulp.watch(src + '/js/**/*.js', browserSync.reload);
  gulp.watch(src + '/pages/**/*.+(html|njk|nunjucks)', ['nunjucks']);
  gulp.watch(src + '/templates/**/*.+(html|njk|nunjucks)', ['nunjucks']);
})

// optimization
gulp.task('useref', function(){
  return gulp.src(src + '/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest(dist))
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
})

// default
gulp.task('default', function (callback) {
  runSequence(['js', 'sass','nunjucks','browserSync', 'watch'],
    callback
  )
})

// build produccion
gulp.task('build', function (callback) {
  runSequence('clean:dist',
    ['sass', 'useref', 'images', 'fonts'],
    callback
  )
})

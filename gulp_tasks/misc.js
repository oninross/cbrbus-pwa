const path = require('path');

const gulp = require('gulp');
const del = require('del');
const filter = require('gulp-filter');

const pngquant = require('imagemin-pngquant');

const conf = require('../conf/gulp.conf');

gulp.task('clean', clean);
gulp.task('other', other);
gulp.task('copy', copy);
gulp.task('imagemin', imagemin);

function clean() {
  return del([conf.paths.dist, conf.paths.tmp]);
}

function other() {
  const fileFilter = filter(file => file.stat.isFile());

  return gulp.src([
    path.join(conf.paths.src, '/**/*'),
    path.join(`!${conf.paths.src}`, '/**/*.{scss,js}')
  ])
    .pipe(fileFilter)
    .pipe(gulp.dest(conf.paths.dist));
}

function copy() {
  const fileFilter = filter(file => file.stat.isFile());

  return gulp.src([
    path.join(conf.paths.src, './app/assets/**/*')
  ])
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/assets/cbrbus/')))
    .pipe(gulp.dest(path.join(conf.paths.dist, '/assets/cbrbus/')));
}

function imagemin() {
  return gulp.src(path.join(conf.paths.src, './app/assets/images/', '**/*.{jpg,jpeg,gif,svg,png}'))
    .pipe(plugins.changed(conf.paths.dist))
    .pipe(plugins.imagemin([
      plugins.imagemin.jpegtran({ progressive: true }),
      plugins.imagemin.svgo({ plugins: [{ removeViewBox: false }] })
    ], { use: [pngquant({ speed: 10 })] }))
    .pipe(gulp.dest(conf.paths.dist));
}
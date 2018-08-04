import gulp from 'gulp';
import runSequence from 'run-sequence';
import nodemon from 'gulp-nodemon';
import ts from 'gulp-typescript';
import sourcemaps from 'gulp-sourcemaps';

const gulpConfig = {
  nodemon: {
    nodemon: require('nodemon'),
    script: './dist/src/app.js',
    ext: 'ts',
    watch: 'src',
    env: { NODE_ENV: 'development' },
    tasks: ['tsc'],
  },
  copyfiles: ['package.json', 'config/*.json'],
};

// const run = require('gulp-run-command').default;

gulp.task('copyfile', () => {
  for (const fileUrl of gulpConfig.copyfiles) {
    gulp.src(fileUrl, { base: './' }).pipe(gulp.dest('dist'));
  }
  return;
});

gulp.task('nodemon', () => {
  nodemon(gulpConfig.nodemon as any);
  return;
});

gulp.task('tsc', () => {
  const tsProject = ts.createProject('tsconfig.json');
  return tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write('../dist', { addComment: false }))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', (callback) => runSequence('tsc', 'copyfile', callback));

gulp.task('default', () => runSequence('build', 'nodemon'));

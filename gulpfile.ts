import gulp from 'gulp';
import runSequence from 'run-sequence';

import ts from 'gulp-typescript';

const tsProject = ts.createProject('tsconfig.json');

gulp.task('copyfile', () => {
  gulp.src('package.json', { base: './' }).pipe(gulp.dest('dist'));

  gulp.src('config/*.json', { base: './' }).pipe(gulp.dest('dist'));
});

gulp.task('tsc', () => {
  return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest('dist'));
});

gulp.task('default', () => runSequence(['tsc', 'copyfile']));

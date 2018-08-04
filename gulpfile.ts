import gulp from 'gulp';
import runSequence from 'run-sequence';
import nodemon from 'gulp-nodemon';
import ts from 'gulp-typescript';
import sourcemaps from 'gulp-sourcemaps';

const { GulpSSHDeploy } = require('gulp-ssh-deploy');

const gulpConfig = {
  nodemon: {
    nodemon: require('nodemon'),
    script: './dist/src/app.js',
    ext: 'ts',
    watch: 'src',
    env: { NODE_ENV: 'development' },
    tasks: ['build'],
  },
  copyfiles: ['package.json', 'config/*.json'],
  sshDeploy: {
    host: '127.0.0.1',
    port: 53841,
    package_json_file_path: 'package.json',
    source_files: './dist',
    remote_directory: '/remoteLocation/Koa-ts',
    username: 'root',
    ssh_key_file: '~/.ssh/id_rsa',
    releases_to_keep: 3,
    // group: 'root-group',
    permissions: 'ugo+rX',
    // package_task: 'someTask',
  },
};

// const run = require('gulp-run-command').default;

gulp.task('copyfile', () => {
  for (const fileUrl of gulpConfig.copyfiles) {
    gulp.src(fileUrl, { base: './' }).pipe(gulp.dest('dist'));
  }
});

gulp.task('nodemon', () => {
  nodemon(gulpConfig.nodemon as any);
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

gulp.task('default', (callback) => runSequence('build', 'nodemon', callback));

try {
  new GulpSSHDeploy(gulpConfig.sshDeploy, gulp);
} catch (e) {
  console.error(e);
}

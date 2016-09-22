'use strict';

import path from 'path';

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;
  let dest = path.join(taskTarget, dirs.api.replace(/^_/, ''));

  gulp.task('copyApi', function() {
    gulp.src(path.join(dirs.source, '_assets/btt/api/**/*.*'))
      .pipe(gulp.dest(dest))
});
}

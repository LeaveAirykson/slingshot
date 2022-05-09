const path = require('path');

function resolveHomePath(filepath) {
  let finalpath = filepath;
  const splitpath = filepath.split('~');

  if (splitpath.length == 2) {
    finalpath = path.join(process.env.HOME, splitpath[1]);
  }

  return finalpath;
}

module.exports = { resolveHomePath };

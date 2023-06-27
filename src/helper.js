const path = require('path');

function resolveHomePath(filepath) {
  if (!filepath) {
    return filepath;
  }

  let finalpath = filepath;
  const splitpath = filepath.split('~');

  if (splitpath.length == 2) {
    finalpath = path.join(process.env.HOME, splitpath[1]);
  }

  return finalpath;
}

function isFn(a) {
  return typeof a === 'function';
}

module.exports = { resolveHomePath, isFn };

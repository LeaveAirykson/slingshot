/**
 * SlingshotConfig
 *
 * @var {object}
 * @prop {string} host
 * @prop {string} username
 * @prop {string} password
 */
module.exports = {
  host: null,
  username: null,
  password: null,
  privateKeyPath: null,
  deployTo: null,
  symlink: 'current',
  revision: 'master',
  keepReleases: 3,
  exclude: [],
  include: [],
  port: 22,
};

// Rules:
// deployTo => da wird der releases/ ordner erstellt und der symlink pointer gesetzt
// when workspace gesetzt ist, wird:
// - das repo dort temporär gecloned
// - in dem ordner npm i durchgeführt
// hooks MÜSSEN ein Promise zurückgeben.

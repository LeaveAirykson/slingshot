module.exports = {
  host: null,
  username: null,
  password: null,
  privateKey: null,
  deployTo: null,
  symlink: 'current',
  git: null,
  revision: 'master',
  workspace: '/tmp/slingshot',
  keepReleases: 3,
  exclude: [],
  include: [],
  port: 22,
  beforeDeploy: () => Promise.resolve(),
  afterDeploy: () => Promise.resolve(),
};

// Rules:
// deployTo => da wird der releases/ ordner erstellt und der symlink pointer gesetzt
// when workspace gesetzt ist, wird:
// - das repo dort temporär gecloned
// - in dem ordner npm i durchgeführt
// hooks MÜSSEN ein Promise zurückgeben.

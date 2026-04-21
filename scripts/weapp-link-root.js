/**
 * 将 dist/ 编译产物同步到项目根目录，并把 miniprogramRoot 设为 ./，
 * 解决「只在项目根找 app.json」的编辑器/插件报错。
 * 标准用法仍可只用 dist/，不必执行本脚本。
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(path.join(dist, 'app.json'))) {
  console.error('[weapp-link-root] 未找到 dist/app.json，请先执行: npm run build:weapp');
  process.exit(1);
}

const files = [
  'app.js',
  'app.json',
  'app.wxss',
  'base.wxml',
  'common.js',
  'runtime.js',
  'taro.js',
  'vendors.js',
  'comp.js',
  'comp.json',
  'comp.wxml',
  'utils.wxs',
];
const dirs = ['pages', 'assets', 'prebundle'];

function rm(p) {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

function linkOrCopy(rel) {
  const from = path.join(dist, rel);
  const to = path.join(root, rel);
  if (!fs.existsSync(from)) return;
  rm(to);
  const isDir = fs.statSync(from).isDirectory();
  const relTarget = path.relative(path.dirname(to), from);
  try {
    fs.symlinkSync(relTarget, to, isDir ? 'dir' : 'file');
  } catch {
    if (isDir) fs.cpSync(from, to, { recursive: true });
    else fs.copyFileSync(from, to);
  }
}

dirs.forEach((d) => linkOrCopy(d));
files.forEach((f) => linkOrCopy(f));

const pcPath = path.join(root, 'project.config.json');
const bakPath = path.join(root, 'project.config.json.bak');
if (fs.existsSync(pcPath) && !fs.existsSync(bakPath)) {
  fs.copyFileSync(pcPath, bakPath);
}
const pc = JSON.parse(fs.readFileSync(pcPath, 'utf8'));
pc.miniprogramRoot = './';
fs.writeFileSync(pcPath, `${JSON.stringify(pc, null, 2)}\n`);
console.log(
  '[weapp-link-root] 完成。已备份 project.config.json -> project.config.json.bak；miniprogramRoot 已设为 ./'
);

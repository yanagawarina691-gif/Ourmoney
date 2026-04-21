/**
 * 始终在项目根目录执行 Taro CLI，避免在错误 cwd 下报「找不到 config/index」。
 */
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
process.chdir(root);

const taroBin = path.join(root, 'node_modules', '@tarojs', 'cli', 'bin', 'taro');
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [taroBin, ...args], {
  stdio: 'inherit',
  cwd: root,
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);

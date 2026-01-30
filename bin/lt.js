#!/usr/bin/env node

const { program } = require('commander');
const pkg = require('../package.json');

// 导入各个命令模块
const cuda = require('../src/cuda');
const proxy = require('../src/proxy');
const envs = require('../src/envs');
const t = require('../src/t');

program
  .name('lt')
  .version(pkg.version);

// CUDA 命令
const cudaCmd = program
  .command('cuda');

cudaCmd
  .command('list')
  .description('列出所有可用的 CUDA 版本')
  .action(() => cuda.list());

cudaCmd
  .command('switch <version>')
  .description('切换到指定的 CUDA 版本')
  .action((version) => cuda.switch(version));

// Proxy 命令
const proxyCmd = program
  .command('proxy');

proxyCmd
  .command('set <address>')
  .description('设置代理地址')
  .action((address) => proxy.set(address));

proxyCmd
  .command('unset')
  .description('取消代理设置')
  .action(() => proxy.unset());

proxyCmd
  .command('status')
  .description('显示当前代理状态')
  .action(() => proxy.status());

// Envs 命令
const envsCmd = program
  .command('envs');

envsCmd
  .command('list')
  .description('列出所有环境变量')
  .option('-v, --values', '显示变量值')
  .action((options) => envs.list(options.values));

envsCmd
  .command('get <name>')
  .description('获取指定环境变量（支持 * 通配符）')
  .action((name) => envs.get(name));

envsCmd
  .command('add <name> <value>')
  .description('添加新的环境变量')
  .action((name, value) => envs.add(name, value));

envsCmd
  .command('set <name> <value>')
  .description('修改环境变量')
  .action((name, value) => envs.set(name, value));

envsCmd
  .command('delete <name>')
  .description('删除环境变量')
  .action((name) => envs.delete(name));

// PATH 子命令
const pathCmd = envsCmd
  .command('path');

pathCmd
  .command('list')
  .description('列出所有 PATH 组件')
  .action(() => envs.pathList());

pathCmd
  .command('add <directory>')
  .description('添加目录到 PATH')
  .action((directory) => envs.pathAdd(directory));

pathCmd
  .command('delete <directory>')
  .description('从 PATH 中移除目录')
  .action((directory) => envs.pathDelete(directory));

pathCmd
  .command('check <directory>')
  .description('检查目录是否在 PATH 中')
  .action((directory) => envs.pathCheck(directory));

// 网络测试命令
program
  .command('t')
  .action(() => t.test());

program.parse();

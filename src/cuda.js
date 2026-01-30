const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const { t } = require('./i18n');

const CUDA_DIR = '/usr/local';
const ZSHRC = path.join(os.homedir(), '.zshrc');
const BASHRC = path.join(os.homedir(), '.bashrc');

// 获取 shell 配置文件
function getShellRc() {
  const shell = process.env.SHELL || '/bin/bash';
  const shellName = path.basename(shell);
  
  switch (shellName) {
    case 'zsh':
      return ZSHRC;
    case 'bash':
    default:
      return BASHRC;
  }
}

// 获取当前 CUDA 版本
function getCurrentCudaVersion() {
  const pathEnv = process.env.PATH || '';
  const match = pathEnv.match(/\/usr\/local\/cuda-([0-9]+(?:\.[0-9]+)?)/);
  return match ? match[1] : null;
}

// 列出可用的 CUDA 版本
function listCudaVersions() {
  if (!fs.existsSync(CUDA_DIR)) {
    console.log(chalk.red(t('cuda.dir_not_found', CUDA_DIR)));
    process.exit(1);
  }

  const currentCuda = getCurrentCudaVersion();
  
  try {
    const entries = fs.readdirSync(CUDA_DIR);
    const cudaVersions = entries.filter(entry => /^cuda-[0-9]+(\.[0-9]+)?$/.test(entry));
    
    if (cudaVersions.length === 0) {
      console.log(chalk.yellow(t('cuda.no_versions')));
      return;
    }

    console.log(chalk.cyan(t('cuda.detected_versions')));
    
    for (const version of cudaVersions.sort()) {
      const versionNumber = version.replace('cuda-', '');
      const fullPath = path.join(CUDA_DIR, version);
      let prefix = ' - ';
      
      // 标记当前版本
      if (versionNumber === currentCuda) {
        prefix = chalk.green(' * ');
      }
      
      // 检查是否是符号链接
      try {
        const stats = fs.lstatSync(fullPath);
        if (stats.isSymbolicLink()) {
          const target = fs.realpathSync(fullPath);
          const targetMatch = target.match(/cuda-([0-9]+(?:\.[0-9]+)?)/);
          const targetVersion = targetMatch ? targetMatch[1] : target;
          console.log(`${prefix}${versionNumber} -> ${targetVersion}`);
        } else {
          console.log(`${prefix}${versionNumber}`);
        }
      } catch (err) {
        console.log(`${prefix}${versionNumber}`);
      }
    }
  } catch (err) {
    console.log(chalk.red(t('cuda.read_dir_failed', err.message)));
    process.exit(1);
  }
}

// 切换 CUDA 版本
function switchCudaVersion(version) {
  // 添加 cuda- 前缀（如果没有）
  if (!version.startsWith('cuda-')) {
    version = `cuda-${version}`;
  }
  
  const cudaPath = path.join(CUDA_DIR, version);
  
  // 检查路径是否存在
  if (!fs.existsSync(cudaPath)) {
    console.log(chalk.red(t('cuda.path_not_exist', cudaPath)));
    process.exit(1);
  }
  
  const shellRc = getShellRc();
  
  try {
    let content = '';
    if (fs.existsSync(shellRc)) {
      content = fs.readFileSync(shellRc, 'utf8');
    }
    
    // 移除现有的 CUDA 路径配置
    content = content.replace(/^export PATH="\/usr\/local\/cuda-.*\/bin:\$PATH"$/gm, '');
    content = content.replace(/^export LD_LIBRARY_PATH="\/usr\/local\/cuda-.*\/lib64:\$LD_LIBRARY_PATH"$/gm, '');
    
    // 清理多余的空行
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // 添加新配置
    const newConfig = `
export PATH="${cudaPath}/bin:$PATH"
export LD_LIBRARY_PATH="${cudaPath}/lib64:$LD_LIBRARY_PATH"`;
    
    content = content.trimEnd() + '\n' + newConfig + '\n';
    
    fs.writeFileSync(shellRc, content);
    
    console.log(chalk.green(t('cuda.switched', version)));
    console.log(chalk.yellow(t('please_run_source', shellRc)));
  } catch (err) {
    console.log(chalk.red(t('write_config_failed', err.message)));
    process.exit(1);
  }
}

module.exports = {
  list: listCudaVersions,
  switch: switchCudaVersion
};

const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const { t } = require('./i18n');

// 获取 shell 配置文件
function getShellRc() {
  const shell = process.env.SHELL || '/bin/bash';
  const shellName = path.basename(shell);
  
  switch (shellName) {
    case 'zsh':
      return path.join(os.homedir(), '.zshrc');
    case 'bash':
    default:
      return path.join(os.homedir(), '.bashrc');
  }
}

// 检查代理设置是否存在
function checkProxyExists(content) {
  return content.includes('export http_proxy=') || content.includes('export https_proxy=');
}

// 设置代理
function setProxy(address) {
  // 验证代理地址格式
  if (!address.match(/^https?:\/\//)) {
    console.log(chalk.red(t('proxy.invalid_format')));
    process.exit(1);
  }
  
  const shellRc = getShellRc();
  
  try {
    let content = '';
    if (fs.existsSync(shellRc)) {
      content = fs.readFileSync(shellRc, 'utf8');
    }
    
    // 移除现有的代理设置
    content = content.replace(/^export http_proxy=.*$/gm, '');
    content = content.replace(/^export https_proxy=.*$/gm, '');
    content = content.replace(/^export HTTP_PROXY=.*$/gm, '');
    content = content.replace(/^export HTTPS_PROXY=.*$/gm, '');
    content = content.replace(/^export no_proxy=.*$/gm, '');
    content = content.replace(/^export NO_PROXY=.*$/gm, '');
    
    // 清理多余的空行
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // 添加新的代理设置
    const proxyConfig = `
export http_proxy="${address}"
export https_proxy="${address}"
export HTTP_PROXY="${address}"
export HTTPS_PROXY="${address}"
export no_proxy="localhost,127.0.0.1,::1"
export NO_PROXY="localhost,127.0.0.1,::1"`;
    
    content = content.trimEnd() + '\n' + proxyConfig + '\n';
    
    fs.writeFileSync(shellRc, content);
    
    console.log(chalk.green(t('proxy.set_to', address)));
    console.log(chalk.yellow(t('please_run_source', shellRc)));
  } catch (err) {
    console.log(chalk.red(t('write_config_failed', err.message)));
    process.exit(1);
  }
}

// 取消代理
function unsetProxy() {
  const shellRc = getShellRc();
  
  try {
    if (!fs.existsSync(shellRc)) {
      console.log(chalk.yellow(t('proxy.not_found')));
      return;
    }
    
    let content = fs.readFileSync(shellRc, 'utf8');
    
    if (!checkProxyExists(content)) {
      console.log(chalk.yellow(t('proxy.not_found')));
      return;
    }
    
    // 移除代理设置
    content = content.replace(/^export http_proxy=.*$/gm, '');
    content = content.replace(/^export https_proxy=.*$/gm, '');
    content = content.replace(/^export HTTP_PROXY=.*$/gm, '');
    content = content.replace(/^export HTTPS_PROXY=.*$/gm, '');
    content = content.replace(/^export no_proxy=.*$/gm, '');
    content = content.replace(/^export NO_PROXY=.*$/gm, '');
    
    // 清理多余的空行
    content = content.replace(/\n{3,}/g, '\n\n');
    
    fs.writeFileSync(shellRc, content);
    
    console.log(chalk.green(t('proxy.removed')));
    console.log(chalk.yellow(t('please_run_source', shellRc)));
  } catch (err) {
    console.log(chalk.red(t('write_config_failed', err.message)));
    process.exit(1);
  }
}

// 显示代理状态
function showStatus() {
  console.log(chalk.cyan(t('proxy.current_status')));
  console.log('');
  
  const vars = ['http_proxy', 'https_proxy', 'no_proxy'];
  
  for (const varName of vars) {
    const value = process.env[varName];
    if (value) {
      console.log(`  ${varName.padEnd(14)} = ${chalk.green(value)}`);
    } else {
      console.log(`  ${varName.padEnd(14)} = ${chalk.gray(t('proxy.not_set'))}`);
    }
  }
}

module.exports = {
  set: setProxy,
  unset: unsetProxy,
  status: showStatus
};

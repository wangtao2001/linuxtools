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

// 检查变量是否存在于配置文件中
function checkVarExists(varName) {
  const shellRc = getShellRc();
  if (!fs.existsSync(shellRc)) {
    return false;
  }
  const content = fs.readFileSync(shellRc, 'utf8');
  return new RegExp(`^export ${varName}=`, 'm').test(content);
}

// 列出所有环境变量
function listVars(showValues) {
  const envVars = Object.entries(process.env).sort((a, b) => a[0].localeCompare(b[0]));
  
  if (showValues) {
    for (const [name, value] of envVars) {
      console.log(`${name.padEnd(30)} = ${value}`);
    }
  } else {
    for (const [name] of envVars) {
      console.log(name);
    }
  }
}

// 获取特定环境变量
function getVar(varPattern) {
  // 检查是否包含通配符
  if (varPattern.includes('*')) {
    const regex = new RegExp('^' + varPattern.replace(/\*/g, '.*') + '$');
    const matches = Object.entries(process.env)
      .filter(([name]) => regex.test(name))
      .sort((a, b) => a[0].localeCompare(b[0]));
    
    if (matches.length === 0) {
      console.log(chalk.yellow(t('envs.no_match', varPattern)));
      process.exit(1);
    }
    
    for (const [name, value] of matches) {
      console.log(`${name.padEnd(30)} = ${value}`);
    }
  } else {
    const value = process.env[varPattern];
    if (value !== undefined) {
      console.log(`${varPattern.padEnd(30)} = ${value}`);
    } else {
      console.log(chalk.yellow(t('envs.not_exist_or_empty', varPattern)));
      process.exit(1);
    }
  }
}

// 添加新的环境变量
function addVar(varName, varValue) {
  if (checkVarExists(varName)) {
    console.log(chalk.red(t('envs.already_exists', varName)));
    process.exit(1);
  }
  
  const shellRc = getShellRc();
  
  try {
    let content = '';
    if (fs.existsSync(shellRc)) {
      content = fs.readFileSync(shellRc, 'utf8');
    }
    
    content = content.trimEnd() + `\nexport ${varName}="${varValue}"\n`;
    
    fs.writeFileSync(shellRc, content);
    
    console.log(chalk.green(t('envs.add_success', varName)));
    console.log(chalk.yellow(t('please_run_source', shellRc)));
  } catch (err) {
    console.log(chalk.red(t('write_config_failed', err.message)));
    process.exit(1);
  }
}

// 修改环境变量
function setVar(varName, varValue) {
  if (!checkVarExists(varName)) {
    console.log(chalk.red(t('envs.not_exist', varName)));
    process.exit(1);
  }
  
  const shellRc = getShellRc();
  
  try {
    let content = fs.readFileSync(shellRc, 'utf8');
    
    // 替换变量值
    const regex = new RegExp(`^export ${varName}=.*$`, 'gm');
    content = content.replace(regex, `export ${varName}="${varValue}"`);
    
    fs.writeFileSync(shellRc, content);
    
    console.log(chalk.green(t('envs.set_success', varName)));
    console.log(chalk.yellow(t('please_run_source', shellRc)));
  } catch (err) {
    console.log(chalk.red(t('write_config_failed', err.message)));
    process.exit(1);
  }
}

// 删除环境变量
function deleteVar(varName) {
  if (!checkVarExists(varName)) {
    console.log(chalk.red(t('envs.not_exist', varName)));
    process.exit(1);
  }
  
  const shellRc = getShellRc();
  
  try {
    let content = fs.readFileSync(shellRc, 'utf8');
    
    // 删除变量
    const regex = new RegExp(`^export ${varName}=.*$\n?`, 'gm');
    content = content.replace(regex, '');
    
    // 清理多余的空行
    content = content.replace(/\n{3,}/g, '\n\n');
    
    fs.writeFileSync(shellRc, content);
    
    console.log(chalk.green(t('envs.delete_success', varName)));
    console.log(chalk.yellow(t('please_run_source', shellRc)));
  } catch (err) {
    console.log(chalk.red(t('write_config_failed', err.message)));
    process.exit(1);
  }
}

// PATH 管理函数
function pathList() {
  const pathEnv = process.env.PATH || '';
  const paths = pathEnv.split(':');
  
  console.log(chalk.cyan(t('envs.path_components')));
  for (const p of paths) {
    console.log(`  ${p}`);
  }
}

function pathAdd(directory) {
  const pathEnv = process.env.PATH || '';
  const paths = pathEnv.split(':');
  
  if (paths.includes(directory)) {
    console.log(chalk.red(t('envs.path_already_in')));
    process.exit(1);
  }
  
  const shellRc = getShellRc();
  
  try {
    let content = '';
    if (fs.existsSync(shellRc)) {
      content = fs.readFileSync(shellRc, 'utf8');
    }
    
    content = content.trimEnd() + `\nexport PATH="$PATH:${directory}"\n`;
    
    fs.writeFileSync(shellRc, content);
    
    console.log(chalk.green(t('envs.path_add_success', directory)));
    console.log(chalk.yellow(t('please_run_source', shellRc)));
  } catch (err) {
    console.log(chalk.red(t('write_config_failed', err.message)));
    process.exit(1);
  }
}

function pathDelete(directory) {
  const shellRc = getShellRc();
  
  try {
    if (!fs.existsSync(shellRc)) {
      console.log(chalk.yellow(t('config_file_not_found')));
      return;
    }
    
    let content = fs.readFileSync(shellRc, 'utf8');
    
    // 转义特殊字符
    const escapedDir = directory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // 移除 PATH 设置
    const regex1 = new RegExp(`^export PATH="\\$PATH:${escapedDir}"$\n?`, 'gm');
    const regex2 = new RegExp(`^export PATH="${escapedDir}:\\$PATH"$\n?`, 'gm');
    
    content = content.replace(regex1, '');
    content = content.replace(regex2, '');
    
    // 清理多余的空行
    content = content.replace(/\n{3,}/g, '\n\n');
    
    fs.writeFileSync(shellRc, content);
    
    console.log(chalk.green(t('envs.path_delete_success', directory)));
    console.log(chalk.yellow(t('please_run_source', shellRc)));
  } catch (err) {
    console.log(chalk.red(t('write_config_failed', err.message)));
    process.exit(1);
  }
}

function pathCheck(directory) {
  const pathEnv = process.env.PATH || '';
  const paths = pathEnv.split(':');
  
  if (paths.includes(directory)) {
    console.log(chalk.green(t('envs.path_in', directory)));
  } else {
    console.log(chalk.yellow(t('envs.path_not_in', directory)));
    process.exit(1);
  }
}

module.exports = {
  list: listVars,
  get: getVar,
  add: addVar,
  set: setVar,
  delete: deleteVar,
  pathList,
  pathAdd,
  pathDelete,
  pathCheck
};

const os = require('os');

// 获取系统语言
function getSystemLocale() {
  // 优先使用环境变量
  const envLang = process.env.LT_LANG || process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES;
  
  if (envLang) {
    if (envLang.toLowerCase().startsWith('zh')) {
      return 'zh';
    }
  }
  
  return 'en';
}

const messages = {
  zh: {
    // 通用
    'error': '错误',
    'success': '成功',
    'hint': '提示',
    'please_run_source': '请运行 \'source {0}\' 或重新打开终端以使更改生效',
    'write_config_failed': '写入配置文件失败: {0}',
    'config_file_not_found': '配置文件不存在',
    
    // CUDA
    'cuda.dir_not_found': '目录 {0} 不存在',
    'cuda.no_versions': '未检测到 CUDA 版本',
    'cuda.detected_versions': '检测到的 CUDA 版本:',
    'cuda.read_dir_failed': '读取目录失败: {0}',
    'cuda.path_not_exist': '错误: {0} 不存在，请检查 CUDA 版本',
    'cuda.switched': '已切换到 CUDA 版本: {0}',
    
    // Proxy
    'proxy.invalid_format': '错误: 无效的代理地址格式，必须以 http:// 或 https:// 开头',
    'proxy.set_to': '代理已设置为: {0}',
    'proxy.not_found': '未找到代理设置',
    'proxy.removed': '代理设置已移除',
    'proxy.current_status': '当前代理环境变量:',
    'proxy.not_set': '(未设置)',
    
    // Envs
    'envs.no_match': '未找到匹配 \'{0}\' 的环境变量',
    'envs.not_exist_or_empty': '环境变量 \'{0}\' 不存在或为空',
    'envs.already_exists': '错误: 环境变量 {0} 已存在',
    'envs.add_success': '成功添加环境变量 {0}',
    'envs.not_exist': '错误: 环境变量 {0} 不存在',
    'envs.set_success': '成功修改环境变量 {0}',
    'envs.delete_success': '成功删除环境变量 {0}',
    'envs.path_components': 'PATH 组件:',
    'envs.path_already_in': '错误: 该目录已在 PATH 中',
    'envs.path_add_success': '成功添加 {0} 到 PATH',
    'envs.path_delete_success': '成功从 PATH 中移除 {0}',
    'envs.path_in': '目录 {0} 在 PATH 中',
    'envs.path_not_in': '目录 {0} 不在 PATH 中',
    
    // Network test
    't.testing': '测试网络连接...',
    't.success': '✓ 连接成功',
    't.status_code': '  状态码: {0}',
    't.response_time': '  响应时间: {0}ms',
    't.abnormal_status': '连接成功，但状态码异常: {0}',
    't.failed': '✗ 连接失败: {0}',
    't.dns_hint': '  提示: 无法解析域名，请检查 DNS 设置',
    't.timeout_hint': '  提示: 连接超时或被拒绝，可能需要设置代理',
    't.timeout': '✗ 连接超时',
    't.proxy_hint': '  提示: 可能需要设置代理',
  },
  
  en: {
    // Common
    'error': 'Error',
    'success': 'Success',
    'hint': 'Hint',
    'please_run_source': 'Please run \'source {0}\' or restart your terminal for changes to take effect',
    'write_config_failed': 'Failed to write config file: {0}',
    'config_file_not_found': 'Config file not found',
    
    // CUDA
    'cuda.dir_not_found': 'Directory {0} not found',
    'cuda.no_versions': 'No CUDA versions detected',
    'cuda.detected_versions': 'Detected CUDA versions:',
    'cuda.read_dir_failed': 'Failed to read directory: {0}',
    'cuda.path_not_exist': 'Error: {0} does not exist. Please verify the CUDA version',
    'cuda.switched': 'Switched to CUDA version: {0}',
    
    // Proxy
    'proxy.invalid_format': 'Error: Invalid proxy address format. Must start with http:// or https://',
    'proxy.set_to': 'Proxy set to: {0}',
    'proxy.not_found': 'No proxy settings found',
    'proxy.removed': 'Proxy settings removed',
    'proxy.current_status': 'Current proxy environment variables:',
    'proxy.not_set': '(not set)',
    
    // Envs
    'envs.no_match': 'No environment variables matching pattern \'{0}\'',
    'envs.not_exist_or_empty': 'Environment variable \'{0}\' does not exist or is empty',
    'envs.already_exists': 'Error: Environment variable {0} already exists',
    'envs.add_success': 'Successfully added environment variable {0}',
    'envs.not_exist': 'Error: Environment variable {0} does not exist',
    'envs.set_success': 'Successfully modified environment variable {0}',
    'envs.delete_success': 'Successfully deleted environment variable {0}',
    'envs.path_components': 'PATH components:',
    'envs.path_already_in': 'Error: Directory is already in PATH',
    'envs.path_add_success': 'Successfully added {0} to PATH',
    'envs.path_delete_success': 'Successfully removed {0} from PATH',
    'envs.path_in': 'Directory {0} is in PATH',
    'envs.path_not_in': 'Directory {0} is not in PATH',
    
    // Network test
    't.testing': 'Testing network connection...',
    't.success': '✓ Connection successful',
    't.status_code': '  Status code: {0}',
    't.response_time': '  Response time: {0}ms',
    't.abnormal_status': 'Connected, but status code is abnormal: {0}',
    't.failed': '✗ Connection failed: {0}',
    't.dns_hint': '  Hint: Unable to resolve domain name, please check DNS settings',
    't.timeout_hint': '  Hint: Connection timed out or refused, you may need to set up a proxy',
    't.timeout': '✗ Connection timed out',
    't.proxy_hint': '  Hint: You may need to set up a proxy',
  }
};

const currentLocale = getSystemLocale();

/**
 * 获取国际化消息
 * @param {string} key - 消息键
 * @param  {...any} args - 替换参数
 * @returns {string}
 */
function t(key, ...args) {
  let message = messages[currentLocale][key] || messages['en'][key] || key;
  
  // 替换占位符 {0}, {1}, ...
  args.forEach((arg, index) => {
    message = message.replace(`{${index}}`, arg);
  });
  
  return message;
}

/**
 * 获取当前语言
 * @returns {string}
 */
function getLocale() {
  return currentLocale;
}

module.exports = {
  t,
  getLocale
};

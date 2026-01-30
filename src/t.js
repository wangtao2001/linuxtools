const https = require('https');
const chalk = require('chalk');
const { t } = require('./i18n');

function testNetwork() {
  console.log(chalk.cyan(t('t.testing')));
  
  const url = 'https://www.google.com';
  const startTime = Date.now();
  
  https.get(url, { timeout: 10000 }, (res) => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
      console.log(chalk.green(t('t.success')));
      console.log(chalk.gray(t('t.status_code', res.statusCode)));
      console.log(chalk.gray(t('t.response_time', duration)));
    } else {
      console.log(chalk.yellow(t('t.abnormal_status', res.statusCode)));
    }
  }).on('error', (err) => {
    console.log(chalk.red(t('t.failed', err.message)));
    
    if (err.code === 'ENOTFOUND') {
      console.log(chalk.yellow(t('t.dns_hint')));
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      console.log(chalk.yellow(t('t.timeout_hint')));
    }
    
    process.exit(1);
  }).on('timeout', () => {
    console.log(chalk.red(t('t.timeout')));
    console.log(chalk.yellow(t('t.proxy_hint')));
    process.exit(1);
  });
}

module.exports = {
  test: testNetwork
};

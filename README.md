# @wangtao2001/lt

linux 工具集

## 安装

```bash
npm install -g @wangtao2001/lt
```

## 使用方法

### CUDA 版本管理

```bash
# 列出所有可用的 CUDA 版本
lt cuda list

# 切换到指定的 CUDA 版本
lt cuda switch 11.8
lt cuda switch cuda-12.0
```

### 代理设置

```bash
# 设置代理
lt proxy set http://127.0.0.1:7890

# 取消代理
lt proxy unset

# 显示当前代理状态
lt proxy status
```

### 环境变量管理

```bash
# 列出所有环境变量
lt envs list

# 列出所有环境变量（带值）
lt envs list -v
lt envs list --values

# 获取指定环境变量（支持通配符）
lt envs get PATH
lt envs get "CUDA*"

# 添加新的环境变量
lt envs add MY_VAR "my value"

# 修改环境变量
lt envs set MY_VAR "new value"

# 删除环境变量
lt envs delete MY_VAR
```

### PATH 管理

```bash
# 列出所有 PATH 组件
lt envs path list

# 添加目录到 PATH
lt envs path add /usr/local/bin

# 从 PATH 中移除目录
lt envs path delete /usr/local/bin

# 检查目录是否在 PATH 中
lt envs path check /usr/local/bin
```

### 网络测试

```bash
# 测试网络连接（访问 google.com）
lt t
```

## 帮助

```bash
# 显示帮助
lt --help

# 显示版本
lt --version

# 显示子命令帮助
lt cuda --help
lt proxy --help
lt envs --help
```

## 国际化

工具支持中文和英文，也可以通过环境变量手动设置：

```bash
# 使用英文
export LT_LANG=en

# 使用中文
export LT_LANG=zh
```

## 注意事项

- 修改环境变量后，需要运行 `source ~/.zshrc`（或 `~/.bashrc`）或重新打开终端使更改生效
- 工具会自动检测当前使用的 shell（bash 或 zsh）
- 语言会根据系统 `LANG` 环境变量自动选择，也可通过 `LT_LANG` 环境变量覆盖

## License

MIT

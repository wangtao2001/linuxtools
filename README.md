# @wangtao2001/lt

A command-line tool for managing CUDA versions, proxy settings, environment variables, and more on linux.

## Installation

```bash
npm install -g @wangtao2001/lt
```

## Usage

### CUDA Version Management

```bash
# List all available CUDA versions
lt cuda list

# Switch to a specific CUDA version
lt cuda switch 11.8
lt cuda switch cuda-12.0
```

### Proxy Settings

```bash
# Set proxy
lt proxy set http://127.0.0.1:7890

# Unset proxy
lt proxy unset

# Show current proxy status
lt proxy status
```

### Environment Variables Management

```bash
# List all environment variables
lt envs list

# List all environment variables with values
lt envs list -v
lt envs list --values

# Get specific environment variable (supports wildcards)
lt envs get PATH
lt envs get CUDA*

# Add new environment variable
lt envs add MY_VAR "my value"

# Modify environment variable
lt envs set MY_VAR "new value"

# Delete environment variable
lt envs delete MY_VAR
```

### PATH Management

```bash
# List all PATH components
lt envs path list

# Add directory to PATH
lt envs path add /usr/local/bin

# Remove directory from PATH
lt envs path delete /usr/local/bin

# Check if directory is in PATH
lt envs path check /usr/local/bin
```

### Network Test

```bash
# Test network connectivity (access google.com)
lt t
```

## Help

```bash
# Show help
lt --help

# Show version
lt --version

# Show subcommand help
lt cuda --help
lt proxy --help
lt envs --help
```

## Internationalization

The tool supports both Chinese and English, and will automatically select based on system language. You can also manually set it via environment variable:

```bash
# Use English
export LT_LANG=en

# Use Chinese
export LT_LANG=zh
```

## Notes

- After modifying environment variables, run `source ~/.zshrc` (or `~/.bashrc`) or restart your terminal for changes to take effect
- The tool automatically detects your current shell (bash or zsh)
- Language is automatically selected based on system `LANG` environment variable, can be overridden with `LT_LANG`

## License

MIT

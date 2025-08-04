#!/bin/bash

CUDA_DIR="/usr/local"
DEFAULT_CUDA_FILE="$HOME/.default_cuda"

# 扫描可用的 CUDA 版本
list_cuda_versions() {
    if [ ! -d "$CUDA_DIR" ]; then
        echo "未找到 $CUDA_DIR 目录。"
        return 1
    fi

    # 获取当前使用的CUDA版本
    current_cuda=$(echo $PATH | grep -o '/usr/local/cuda-[0-9]\+\(\.[0-9]\+\)\?/bin' | head -n1 | grep -o '[0-9]\+\(\.[0-9]\+\)\?')

    versions=$(ls "$CUDA_DIR" | grep -E '^cuda-[0-9]+(\.[0-9]+)?$')
    if [ -z "$versions" ]; then
        echo "未检测到任何 CUDA 版本。"
        return 1
    fi

    echo "检测到的 CUDA 版本："
    for version in $versions; do
        version_number=${version#cuda-}
        prefix=" - "
        # 如果是当前版本，添加标记
        if [ "$version_number" = "$current_cuda" ]; then
            prefix=" * "
        fi
        
        if [ -L "$CUDA_DIR/$version" ]; then
            target=$(readlink -f "$CUDA_DIR/$version")
            target_number=${target#*cuda-}
            echo "$prefix$version_number -> $target_number"
        else
            echo "$prefix$version_number"
        fi
    done
}

# 切换到指定 CUDA 版本
switch_cuda_version() {
    # 检查输入版本号格式,如果不包含cuda-前缀则添加
    if [[ $1 != cuda-* ]]; then
        version="cuda-$1"
    else
        version=$1
    fi
    
    cuda_path="$CUDA_DIR/$version"

    if [ ! -d "$cuda_path" ]; then
        echo "错误：$cuda_path 不存在，请确认 CUDA 版本是否正确。"
        return 1
    fi
    # 检查是否已经存在相关配置
    zshrc="$HOME/.zshrc"
    
    # 删除已有的 CUDA 路径配置
    sed -i '/^export PATH="\/usr\/local\/cuda-.*\/bin:\$PATH"$/d' "$zshrc"
    sed -i '/^export LD_LIBRARY_PATH="\/usr\/local\/cuda-.*\/lib64:\$LD_LIBRARY_PATH"$/d' "$zshrc"
    
    # 添加新的配置
    echo "export PATH=\"$cuda_path/bin:\$PATH\"" >> "$zshrc"
    echo "export LD_LIBRARY_PATH=\"$cuda_path/lib64:\$LD_LIBRARY_PATH\"" >> "$zshrc"

    echo "已切换到 CUDA 版本：$version"
}

# 命令行参数解析
case $1 in
    list)
        list_cuda_versions
        ;;
    switch)
        if [ -z "$2" ]; then
            echo "用法：cuda switch <version>"
            exit 1
        fi
        switch_cuda_version "$2"
        ;;
    *)
        echo "用法：cuda {list|switch}"
        echo "  list              - 列出所有可用的 CUDA 版本"
        echo "  switch <version>  - 切换到指定的 CUDA 版本"
        exit 1
        ;;
esac


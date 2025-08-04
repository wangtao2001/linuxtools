#!/bin/bash

# 允许用户通过 SHELL_RC 环境变量指定配置文件路径
SHELL_RC="${SHELL_RC:-$HOME/.zshrc}"
ZSHRC_PATH="$SHELL_RC"

# 显示主要使用方法
show_usage() {
    echo "用法: envs <command> [options]"
    echo "  list [--values|-v]          - 列出所有环境变量"
    echo "  get <name>                  - 查看特定环境变量，支持通配符 *"
    echo "  add <name> <value>          - 添加新环境变量"
    echo "  set <name> <value>       - 修改环境变量"
    echo "  delete <name>               - 删除环境变量"
    echo "  path <command> [options]    - PATH管理命令"
    echo ""
    echo "配置："
    echo "  可通过设置 SHELL_RC 环境变量指定配置文件路径"
    echo "  当前配置文件路径: $ZSHRC_PATH"
}

# 显示PATH管理相关的使用方法
show_path_usage() {
    echo "用法: envs path <command> [options]"
    echo "  list                   - 列出所有PATH组成部分"
    echo "  add <directory>        - 添加目录到PATH"
    echo "  delete <directory>     - 从PATH中删除目录"
    echo "  check <directory>      - 检查目录是否在PATH中"
}

# 检查环境变量是否存在于.zshrc中
check_var_exists() {
    local var_name=$1
    grep -q "export ${var_name}=" "$ZSHRC_PATH"
    return $?
}

# 列出所有环境变量
list_vars() {
    if [ "$1" = "--values" ] || [ "$1" = "-v" ]; then
        env | sort | while IFS='=' read -r var_name var_value; do
            printf "%-30s = %s\n" "$var_name" "$var_value"
        done
    else
        env | cut -d= -f1 | sort
    fi
}

# 获取特定环境变量的值，支持通配符
get_var() {
    local var_pattern=$1
    
    # 检查是否包含通配符
    if [[ "$var_pattern" == *"*"* ]]; then
        # 使用通配符匹配
        local found=false
        local matches=()
        
        while IFS='=' read -r var_name var_value; do
            # 使用 bash 的模式匹配
            if [[ "$var_name" == $var_pattern ]]; then
                matches+=("$var_name=$var_value")
                found=true
            fi
        done < <(env)
        
        if [ "$found" = true ]; then
            printf "%s\n" "${matches[@]}" | sort | while IFS='=' read -r var_name var_value; do
                printf "%-30s = %s\n" "$var_name" "$var_value"
            done
        else
            echo "没有找到匹配模式 '$var_pattern' 的环境变量"
            return 1
        fi
    else
        # 普通的单个变量查询，也显示变量名=值的格式
        local var_value
        var_value=$(eval "echo \$$var_pattern")
        if [ -n "$var_value" ]; then
            printf "%-30s = %s\n" "$var_pattern" "$var_value"
        else
            echo "环境变量 '$var_pattern' 不存在或值为空"
            return 1
        fi
    fi
}

# 添加新环境变量
add_var() {
    local var_name=$1
    local var_value=$2

    if check_var_exists "$var_name"; then
        echo "错误: 环境变量 $var_name 已存在"
        return 1
    fi

    echo "export ${var_name}=\"${var_value}\"" >> "$ZSHRC_PATH"
    echo "成功添加环境变量 ${var_name}"
}

# 修改环境变量
set_var() {
    local var_name=$1
    local var_value=$2

    if ! check_var_exists "$var_name"; then
        echo "错误: 环境变量 $var_name 不存在"
        return 1
    fi

    sed -i.bak "s|export ${var_name}=.*|export ${var_name}=\"${var_value}\"|" "$ZSHRC_PATH"
    echo "成功修改环境变量 ${var_name}"
}

# 删除环境变量
delete_var() {
    local var_name=$1

    if ! check_var_exists "$var_name"; then
        echo "错误: 环境变量 $var_name 不存在"
        return 1
    fi

    sed -i.bak "/export ${var_name}=/d" "$ZSHRC_PATH"
    echo "成功删除环境变量 ${var_name}"
}

# 添加PATH管理相关的函数
list_path() {
    echo "$PATH" | tr ':' '\n'
}

add_to_path() {
    local dir=$1
    
    # 检查目录是否已经在PATH中
    echo "$PATH" | tr ':' '\n' | grep -Fx "$dir" > /dev/null
    if [ $? -eq 0 ]; then
        echo "错误: 目录已经在PATH中"
        return 1
    fi
    
    # 在.zshrc中添加新的PATH
    echo "export PATH=\"\$PATH:${dir}\"" >> "$ZSHRC_PATH"
    echo "成功将 ${dir} 添加到PATH"
}

delete_from_path() {
    local dir=$1
    local escaped_dir=$(echo "$dir" | sed 's/[\/&]/\\&/g')
    
    # 从.zshrc中删除PATH设置
    sed -i.bak "/export PATH=.*:${escaped_dir}\"/d" "$ZSHRC_PATH"
    sed -i.bak "/export PATH=\"${escaped_dir}:\$/d" "$ZSHRC_PATH"
    echo "成功从PATH中删除 ${dir}"
}

check_path() {
    local dir=$1
    echo "$PATH" | tr ':' '\n' | grep -Fx "$dir" > /dev/null
    if [ $? -eq 0 ]; then
        echo "目录 ${dir} 在PATH中"
        return 0
    else
        echo "目录 ${dir} 不在PATH中"
        return 1
    fi
}

# 主程序
case "$1" in
    "list")
        list_vars "$2"
        ;;
    "get")
        if [ -z "$2" ]; then
            echo "错误: 请指定要查看的环境变量名"
            show_usage
            exit 1
        fi
        get_var "$2"
        ;;
    "add")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "错误: 请指定环境变量名和值"
            show_usage
            exit 1
        fi
        add_var "$2" "$3"
        ;;
    "set")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "错误: 请指定环境变量名和新值"
            show_usage
            exit 1
        fi
        set_var "$2" "$3"
        ;;
    "delete")
        if [ -z "$2" ]; then
            echo "错误: 请指定要删除的环境变量名"
            show_usage
            exit 1
        fi
        delete_var "$2"
        ;;
    "path")
        case "$2" in
            "")
                # 当只输入 "envs path" 时显示PATH相关帮助
                show_path_usage
                exit 0
                ;;
            "list")
                list_path
                ;;
            "add")
                if [ -z "$3" ]; then
                    echo "错误: 请指定要添加到PATH的目录"
                    show_path_usage
                    exit 1
                fi
                add_to_path "$3"
                ;;
            "delete")
                if [ -z "$3" ]; then
                    echo "错误: 请指定要从PATH中删除的目录"
                    show_path_usage
                    exit 1
                fi
                delete_from_path "$3"
                ;;
            "check")
                if [ -z "$3" ]; then
                    echo "错误: 请指定要检查的目录"
                    show_path_usage
                    exit 1
                fi
                check_path "$3"
                ;;
            *)
                show_path_usage
                exit 1
                ;;
        esac
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

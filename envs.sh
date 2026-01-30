#!/bin/bash

# Auto-detect current shell and determine config file path
detect_shell_rc() {
    local shell_name
    shell_name=$(basename "$SHELL")
    
    case "$shell_name" in
        bash)
            echo "$HOME/.bashrc"
            ;;
        zsh)
            echo "$HOME/.zshrc"
            ;;
        *)
            # Default to .bashrc
            echo "$HOME/.bashrc"
            ;;
    esac
}

SHELL_RC=$(detect_shell_rc)

# Show main usage
show_usage() {
    echo "Usage: envs <command> [options]"
    echo "  list [--values|-v]          - List all environment variables"
    echo "  get <name>                  - Get specific variable (supports * wildcard)"
    echo "  add <name> <value>          - Add new environment variable"
    echo "  set <name> <value>          - Modify environment variable"
    echo "  delete <name>               - Delete environment variable"
    echo "  path <command> [options]    - PATH management commands"
    echo ""
    echo "Configuration:"
    echo "  Current shell: $(basename "$SHELL")"
    echo "  Config file: $SHELL_RC"
}

# Show PATH management usage
show_path_usage() {
    echo "Usage: envs path <command>"
    echo "  list                   - List all PATH components"
    echo "  add <directory>        - Add directory to PATH"
    echo "  delete <directory>     - Remove directory from PATH"
    echo "  check <directory>      - Check if directory is in PATH"
}

# Check if variable exists in shell rc file
check_var_exists() {
    local var_name=$1
    grep -q "export ${var_name}=" "$SHELL_RC"
    return $?
}

# List all environment variables
list_vars() {
    if [ "$1" = "--values" ] || [ "$1" = "-v" ]; then
        env | sort | while IFS='=' read -r var_name var_value; do
            printf "%-30s = %s\n" "$var_name" "$var_value"
        done
    else
        env | cut -d= -f1 | sort
    fi
}

# Get specific variable value, supports wildcards
get_var() {
    local var_pattern=$1
    
    # Check if pattern contains wildcard
    if [[ "$var_pattern" == *"*"* ]]; then
        # Use wildcard matching
        local found=false
        local matches=()
        
        while IFS='=' read -r var_name var_value; do
            # Use bash pattern matching
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
            echo "No environment variables matching pattern '$var_pattern'"
            return 1
        fi
    else
        # Single variable query, also show name=value format
        local var_value
        var_value=$(eval "echo \$$var_pattern")
        if [ -n "$var_value" ]; then
            printf "%-30s = %s\n" "$var_pattern" "$var_value"
        else
            echo "Environment variable '$var_pattern' does not exist or is empty"
            return 1
        fi
    fi
}

# Add new environment variable
add_var() {
    local var_name=$1
    local var_value=$2

    if check_var_exists "$var_name"; then
        echo "Error: Environment variable $var_name already exists"
        return 1
    fi

    echo "export ${var_name}=\"${var_value}\"" >> "$SHELL_RC"
    echo "Successfully added environment variable ${var_name}"
}

# Modify environment variable
set_var() {
    local var_name=$1
    local var_value=$2

    if ! check_var_exists "$var_name"; then
        echo "Error: Environment variable $var_name does not exist"
        return 1
    fi

    sed -i.bak "s|export ${var_name}=.*|export ${var_name}=\"${var_value}\"|" "$SHELL_RC"
    echo "Successfully modified environment variable ${var_name}"
}

# Delete environment variable
delete_var() {
    local var_name=$1

    if ! check_var_exists "$var_name"; then
        echo "Error: Environment variable $var_name does not exist"
        return 1
    fi

    sed -i.bak "/export ${var_name}=/d" "$SHELL_RC"
    echo "Successfully deleted environment variable ${var_name}"
}

# PATH management functions
list_path() {
    echo "$PATH" | tr ':' '\n'
}

add_to_path() {
    local dir=$1
    
    # Check if directory is already in PATH
    echo "$PATH" | tr ':' '\n' | grep -Fx "$dir" > /dev/null
    if [ $? -eq 0 ]; then
        echo "Error: Directory is already in PATH"
        return 1
    fi
    
    # Add new PATH to shell rc file
    echo "export PATH=\"\$PATH:${dir}\"" >> "$SHELL_RC"
    echo "Successfully added ${dir} to PATH"
}

delete_from_path() {
    local dir=$1
    local escaped_dir=$(echo "$dir" | sed 's/[\/&]/\\&/g')
    
    # Remove PATH setting from shell rc file
    sed -i.bak "/export PATH=.*:${escaped_dir}\"/d" "$SHELL_RC"
    sed -i.bak "/export PATH=\"${escaped_dir}:\$/d" "$SHELL_RC"
    echo "Successfully removed ${dir} from PATH"
}

check_path() {
    local dir=$1
    echo "$PATH" | tr ':' '\n' | grep -Fx "$dir" > /dev/null
    if [ $? -eq 0 ]; then
        echo "Directory ${dir} is in PATH"
        return 0
    else
        echo "Directory ${dir} is not in PATH"
        return 1
    fi
}

# Main program
case "$1" in
    "list")
        list_vars "$2"
        ;;
    "get")
        if [ -z "$2" ]; then
            echo "Error: Please specify the environment variable name"
            show_usage
            exit 1
        fi
        get_var "$2"
        ;;
    "add")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "Error: Please specify variable name and value"
            show_usage
            exit 1
        fi
        add_var "$2" "$3"
        ;;
    "set")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "Error: Please specify variable name and new value"
            show_usage
            exit 1
        fi
        set_var "$2" "$3"
        ;;
    "delete")
        if [ -z "$2" ]; then
            echo "Error: Please specify the environment variable to delete"
            show_usage
            exit 1
        fi
        delete_var "$2"
        ;;
    "path")
        case "$2" in
            "")
                # Show PATH help when only "envs path" is entered
                show_path_usage
                exit 0
                ;;
            "list")
                list_path
                ;;
            "add")
                if [ -z "$3" ]; then
                    echo "Error: Please specify the directory to add to PATH"
                    show_path_usage
                    exit 1
                fi
                add_to_path "$3"
                ;;
            "delete")
                if [ -z "$3" ]; then
                    echo "Error: Please specify the directory to remove from PATH"
                    show_path_usage
                    exit 1
                fi
                delete_from_path "$3"
                ;;
            "check")
                if [ -z "$3" ]; then
                    echo "Error: Please specify the directory to check"
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

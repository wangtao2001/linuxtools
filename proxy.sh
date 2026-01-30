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

# Show usage
show_usage() {
    echo "Usage: proxy <command>"
    echo ""
    echo "Commands:"
    echo "  set <address>     - Set proxy"
    echo "  unset             - Unset proxy"
    echo "  status            - Show current proxy status"
}

# Check if proxy variables exist in config file
check_proxy_exists() {
    grep -q "export http_proxy=" "$SHELL_RC" || grep -q "export https_proxy=" "$SHELL_RC"
    return $?
}

# Set proxy
set_proxy() {
    local proxy_addr=$1
    
    # Validate proxy address format
    if [[ ! "$proxy_addr" =~ ^https?:// ]]; then
        echo "Error: Invalid proxy address format. Must start with http:// or https://"
        return 1
    fi
    
    # Remove existing proxy settings if present
    if check_proxy_exists; then
        sed -i.bak "/export http_proxy=/d" "$SHELL_RC"
        sed -i.bak "/export https_proxy=/d" "$SHELL_RC"
        sed -i.bak "/export HTTP_PROXY=/d" "$SHELL_RC"
        sed -i.bak "/export HTTPS_PROXY=/d" "$SHELL_RC"
        sed -i.bak "/export no_proxy=/d" "$SHELL_RC"
        sed -i.bak "/export NO_PROXY=/d" "$SHELL_RC"
    fi
    
    # Add proxy settings (both lowercase and uppercase for compatibility)
    {
        echo "export http_proxy=\"${proxy_addr}\""
        echo "export https_proxy=\"${proxy_addr}\""
        echo "export HTTP_PROXY=\"${proxy_addr}\""
        echo "export HTTPS_PROXY=\"${proxy_addr}\""
        echo "export no_proxy=\"localhost,127.0.0.1,::1\""
        echo "export NO_PROXY=\"localhost,127.0.0.1,::1\""
    } >> "$SHELL_RC"
    
    echo "Proxy set to: ${proxy_addr}"
}

# Unset proxy
unset_proxy() {
    if ! check_proxy_exists; then
        echo "No proxy settings found"
        return 0
    fi
    
    # Remove proxy settings from config file
    sed -i.bak "/export http_proxy=/d" "$SHELL_RC"
    sed -i.bak "/export https_proxy=/d" "$SHELL_RC"
    sed -i.bak "/export HTTP_PROXY=/d" "$SHELL_RC"
    sed -i.bak "/export HTTPS_PROXY=/d" "$SHELL_RC"
    sed -i.bak "/export no_proxy=/d" "$SHELL_RC"
    sed -i.bak "/export NO_PROXY=/d" "$SHELL_RC"
    
    echo "Proxy settings removed"
}

# Show proxy status
show_status() {
    echo "Current proxy environment variables:"
    echo ""
    
    if [ -n "$http_proxy" ]; then
        echo "  http_proxy  = $http_proxy"
    else
        echo "  http_proxy  = (not set)"
    fi
    
    if [ -n "$https_proxy" ]; then
        echo "  https_proxy = $https_proxy"
    else
        echo "  https_proxy = (not set)"
    fi
    
    if [ -n "$no_proxy" ]; then
        echo "  no_proxy    = $no_proxy"
    else
        echo "  no_proxy    = (not set)"
    fi
}

# Main program
case "$1" in
    "set")
        if [ -z "$2" ]; then
            echo "Error: Please specify proxy address"
            show_usage
            exit 1
        fi
        set_proxy "$2"
        ;;
    "unset")
        unset_proxy
        ;;
    "status")
        show_status
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

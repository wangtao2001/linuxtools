#!/bin/bash

CUDA_DIR="/usr/local"
DEFAULT_CUDA_FILE="$HOME/.default_cuda"

# List available CUDA versions
list_cuda_versions() {
    if [ ! -d "$CUDA_DIR" ]; then
        echo "Directory $CUDA_DIR not found."
        return 1
    fi

    # Get current CUDA version
    current_cuda=$(echo $PATH | grep -o '/usr/local/cuda-[0-9]\+\(\.[0-9]\+\)\?/bin' | head -n1 | grep -o '[0-9]\+\(\.[0-9]\+\)\?')

    versions=$(ls "$CUDA_DIR" | grep -E '^cuda-[0-9]+(\.[0-9]+)?$')
    if [ -z "$versions" ]; then
        echo "No CUDA versions detected."
        return 1
    fi

    echo "Detected CUDA versions:"
    for version in $versions; do
        version_number=${version#cuda-}
        prefix=" - "
        # Mark current version
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

# Switch to specified CUDA version
switch_cuda_version() {
    # Add cuda- prefix if not present
    if [[ $1 != cuda-* ]]; then
        version="cuda-$1"
    else
        version=$1
    fi
    
    cuda_path="$CUDA_DIR/$version"

    if [ ! -d "$cuda_path" ]; then
        echo "Error: $cuda_path does not exist. Please verify the CUDA version."
        return 1
    fi
    # Check for existing configuration
    zshrc="$HOME/.zshrc"
    
    # Remove existing CUDA path configuration
    sed -i '/^export PATH="\/usr\/local\/cuda-.*\/bin:\$PATH"$/d' "$zshrc"
    sed -i '/^export LD_LIBRARY_PATH="\/usr\/local\/cuda-.*\/lib64:\$LD_LIBRARY_PATH"$/d' "$zshrc"
    
    # Add new configuration
    echo "export PATH=\"$cuda_path/bin:\$PATH\"" >> "$zshrc"
    echo "export LD_LIBRARY_PATH=\"$cuda_path/lib64:\$LD_LIBRARY_PATH\"" >> "$zshrc"

    echo "Switched to CUDA version: $version"
}

# Command line argument parsing
case $1 in
    list)
        list_cuda_versions
        ;;
    switch)
        if [ -z "$2" ]; then
            echo "Usage: cuda switch <version>"
            exit 1
        fi
        switch_cuda_version "$2"
        ;;
    *)
        echo "Usage: cuda {list|switch}"
        echo "  list              - List all available CUDA versions"
        echo "  switch <version>  - Switch to the specified CUDA version"
        exit 1
        ;;
esac

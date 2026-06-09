#!/bin/bash

set -e

echo "[+] Configuring Git"

git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global fetch.prune true
git config --global core.editor "nano"
git config --global color.ui auto
git config --global core.autocrlf input

echo "[✓] Git Ready"

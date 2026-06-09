#!/bin/bash

set -e

echo ""
echo "======================================="
echo " APPOINTLY — MERN DEV ENVIRONMENT"
echo "======================================="
echo ""

bash .devcontainer/setup-git.sh
bash .devcontainer/setup-node.sh
bash .devcontainer/setup-mongo.sh
bash .devcontainer/setup-project.sh
bash .devcontainer/verify-environment.sh

echo ""
echo "======================================="
echo " ENVIRONMENT READY"
echo "======================================="
echo ""
echo " React   → http://localhost:3000"
echo " API     → http://localhost:5000"
echo " MongoDB → mongodb://localhost:27017"
echo ""

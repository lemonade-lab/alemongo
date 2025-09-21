#!/bin/bash
set -e

find . -name '.DS_Store' -type f -delete
yarn --cwd frontend install --ignore-engines
yarn --cwd frontend format
yarn --cwd frontend build
go build
git diff --exit-code
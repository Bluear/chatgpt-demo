#!/bin/bash
set -e

# build pkg
pnpm i
pnpm run build

# start
npx pm2 restart pm2.config.js --env production
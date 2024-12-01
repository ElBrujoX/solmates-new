#!/bin/bash

# 1. Clean up
rm -rf dist
rm -rf node_modules

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Set production env
export NODE_ENV=production

# 5. Start server
npm start 
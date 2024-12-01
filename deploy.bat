@echo off

:: 1. Clean up
rd /s /q dist
rd /s /q node_modules

:: 2. Install dependencies
npm install

:: 3. Build
npm run build

:: 4. Set production env
set NODE_ENV=production

:: 5. Start server
npm start 
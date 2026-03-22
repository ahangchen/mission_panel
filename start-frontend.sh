#!/bin/bash
# Mission Panel Frontend Startup Script
cd /home/cwh/coding/mission_panel/frontend
exec /home/cwh/.npm-global/bin/pnpm run preview --host 0.0.0.0 --port 3000

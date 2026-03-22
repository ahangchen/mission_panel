#!/bin/bash
# Mission Panel - 服务管理脚本

PROJECT_DIR="/home/cwh/coding/mission_panel"

case "$1" in
  start)
    echo "🚀 启动所有服务..."
    cd $PROJECT_DIR
    pm2 start ecosystem.config.js
    pm2 save
    echo "✅ 所有服务已启动"
    pm2 list
    ;;
  
  stop)
    echo "🛑 停止所有服务..."
    pm2 stop all
    echo "✅ 所有服务已停止"
    pm2 list
    ;;
  
  restart)
    echo "🔄 重启所有服务..."
    pm2 restart all
    echo "✅ 所有服务已重启"
    pm2 list
    ;;
  
  restart-backend)
    echo "🔄 重启后端服务..."
    pm2 restart mission-panel-backend
    echo "✅ 后端服务已重启"
    pm2 list
    ;;
  
  restart-frontend)
    echo "🔄 重启前端服务..."
    pm2 restart mission-panel-frontend
    echo "✅ 前端服务已重启"
    pm2 list
    ;;
  
  status)
    echo "📊 服务状态..."
    pm2 list
    echo ""
    echo "🌐 访问地址:"
    echo "  前端: http://192.168.3.23:3000"
    echo "  后端: http://192.168.3.23:8000"
    echo "  API:  http://192.168.3.23:8000/docs"
    ;;
  
  logs)
    echo "📜 查看日志..."
    pm2 logs
    ;;
  
  logs-backend)
    echo "📜 查看后端日志..."
    pm2 logs mission-panel-backend
    ;;
  
  logs-frontend)
    echo "📜 查看前端日志..."
    pm2 logs mission-panel-frontend
    ;;
  
  monit)
    echo "📊 实时监控..."
    pm2 monit
    ;;
  
  *)
    echo "Mission Panel - 服务管理"
    echo ""
    echo "用法: $0 {命令}"
    echo ""
    echo "命令:"
    echo "  start              启动所有服务（前端 + 后端）"
    echo "  stop               停止所有服务"
    echo "  restart            重启所有服务"
    echo "  restart-backend    只重启后端"
    echo "  restart-frontend   只重启前端"
    echo "  status             查看服务状态"
    echo "  logs               查看所有日志"
    echo "  logs-backend       查看后端日志"
    echo "  logs-frontend      查看前端日志"
    echo "  monit              实时监控"
    exit 1
    ;;
esac

exit 0

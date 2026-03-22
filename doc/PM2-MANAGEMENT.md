# Mission Panel - 服务管理快速参考

> PM2 统一管理前端和后端服务

---

## 🚀 快速命令

### 使用管理脚本（推荐）

```bash
cd /home/cwh/coding/mission_panel

# 启动所有服务
./manage.sh start

# 停止所有服务
./manage.sh stop

# 重启所有服务
./manage.sh restart

# 只重启后端
./manage.sh restart-backend

# 只重启前端
./manage.sh restart-frontend

# 查看状态
./manage.sh status

# 查看日志
./manage.sh logs
```

---

## 📊 PM2 命令

### 启动/停止/重启

```bash
# 启动所有服务
pm2 start ecosystem.config.js

# 停止所有服务
pm2 stop all

# 重启所有服务
pm2 restart all

# 只重启后端
pm2 restart mission-panel-backend

# 只重启前端
pm2 restart mission-panel-frontend
```

### 查看状态

```bash
# 列表查看
pm2 list

# 实时监控
pm2 monit

# 查看详情
pm2 describe mission-panel-backend
pm2 describe mission-panel-frontend
```

### 查看日志

```bash
# 所有日志
pm2 logs

# 后端日志
pm2 logs mission-panel-backend

# 前端日志
pm2 logs mission-panel-frontend

# 清空日志
pm2 flush
```

---

## 🌐 访问地址

- **前端**: http://192.168.3.23:3000
- **后端**: http://192.168.3.23:8000
- **API 文档**: http://192.168.3.23:8000/docs

---

## 🔧 常见场景

### 修改后端代码后

```bash
pm2 restart mission-panel-backend
```

### 修改前端代码后

```bash
cd /home/cwh/coding/mission_panel/frontend
pnpm run build
pm2 restart mission-panel-frontend
```

### 系统重启后

```bash
cd /home/cwh/coding/mission_panel
pm2 start ecosystem.config.js
# 或
./manage.sh start
```

---

## 📝 日志位置

- **后端错误**: `/tmp/mission-panel-backend-error.log`
- **后端输出**: `/tmp/mission-panel-backend-out.log`
- **前端错误**: `/tmp/mission-panel-frontend-error.log`
- **前端输出**: `/tmp/mission-panel-frontend-out.log`

查看日志：
```bash
tail -f /tmp/mission-panel-backend-error.log
tail -f /tmp/mission-panel-frontend-error.log
```

---

## 🎯 进程信息

| 服务 | PM2 名称 | 端口 | 自动重启 | 最大重启次数 |
|------|---------|------|---------|-------------|
| 后端 | mission-panel-backend | 8000 | ✅ | 10 |
| 前端 | mission-panel-frontend | 3000 | ✅ | 10 |

---

**Made with ❤️ by OpenClaw AI Assistant**

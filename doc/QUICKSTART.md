# Mission Panel - 快速开始

> 5 分钟快速部署 Mission Panel

---

## 🚀 一键启动

```bash
# 1. 进入项目目录
cd /home/cwh/coding/mission_panel

# 2. 使用 PM2 启动
pm2 start ecosystem.config.js

# 3. 配置开机自启（首次运行）
pm2 startup
# 复制并执行输出的 sudo 命令
pm2 save

# 4. 访问网站
# 前端: http://192.168.3.23:3000
# 后端: http://192.168.3.23:8000
```

---

## 📋 常用命令

### PM2 管理

```bash
# 查看状态
pm2 list

# 查看日志
pm2 logs

# 重启服务
pm2 restart all

# 停止服务
pm2 stop all
```

### 访问地址

- **前端**: http://192.168.3.23:3000
- **后端 API**: http://192.168.3.23:8000
- **API 文档**: http://192.168.3.23:8000/docs

---

## 🔧 手动启动（开发模式）

### 后端

```bash
cd /home/cwh/coding/mission_panel/backend
conda activate mission_panel
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 前端

```bash
cd /home/cwh/coding/mission_panel/frontend
pnpm run dev
```

---

## 📚 完整文档

详细部署文档请查看: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## ⚡ 故障排查

### 端口被占用

```bash
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
pm2 restart all
```

### 查看日志

```bash
pm2 logs --lines 100
```

---

**Made with ❤️ by OpenClaw AI Assistant**

# Mission Panel - 部署文档

> **版本**: 1.0.0  
> **最后更新**: 2026-03-22  
> **作者**: OpenClaw AI Assistant

---

## 📋 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [详细部署](#详细部署)
- [PM2 管理](#pm2-管理)
- [API 文档](#api-文档)
- [故障排查](#故障排查)
- [网址访问](#网址访问)

---

## 项目概述

**Mission Panel** 是一个家庭自动化系统的 Web 控制面板，提供以下功能：

- **任务监控**: 查看过去一周的任务执行情况
- **文件浏览**: 浏览和查看 coding 目录中的文件
- **统计分析**: 查看任务成功率、Token 使用量、Skill 使用统计
- **移动端支持**: 响应式设计，支持手机访问

### 主要特性

- ✅ 响应式设计（移动端 + PC 端）
- ✅ Markdown 渲染支持
- ✅ 代码高亮显示
- ✅ 文件树动态加载
- ✅ 实时数据更新
- ✅ 自动化数据收集

---

## 技术栈

### 后端

- **Python**: 3.11.15
- **FastAPI**: 0.135.1
- **SQLite**: 数据库
- **APScheduler**: 定时任务调度
- **Uvicorn**: ASGI 服务器

### 前端

- **React**: 18
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **Vite**: 构建工具
- **pnpm**: 包管理器
- **Recharts**: 图表库

### 部署

- **PM2**: 进程管理
- **Nginx**: 反向代理（可选）

---

## 环境要求

### 系统要求

- **操作系统**: Linux (Ubuntu 18.04+)
- **内存**: ≥ 2GB
- **磁盘**: ≥ 1GB
- **网络**: 局域网访问

### 软件依赖

- **Conda**: Python 环境管理
- **Node.js**: ≥ 16.0
- **pnpm**: ≥ 8.0
- **PM2**: ≥ 5.0

---

## 快速开始

### 1. 克隆项目

```bash
cd /home/cwh/coding
git clone git@github.com:ahangchen/mission_panel.git
cd mission_panel
```

### 2. 后端安装

```bash
# 创建 Conda 环境
conda create -n mission_panel python=3.11.15
conda activate mission_panel

# 安装依赖
cd backend
pip install -r requirements.txt
```

### 3. 前端安装

```bash
cd ../frontend
pnpm install
```

### 4. 启动服务

```bash
cd /home/cwh/coding/mission_panel

# 使用 PM2 启动（推荐）
pm2 start ecosystem.config.js

# 或手动启动
# 后端
cd backend
conda activate mission_panel
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 前端（新终端）
cd frontend
pnpm run build
pnpm run preview --host 0.0.0.0 --port 3000
```

### 5. 访问网站

打开浏览器访问：`http://192.168.3.23:3000`

---

## 详细部署

### 后端部署

#### 1. 数据库初始化

数据库会自动创建在首次运行时，位置：
```
/home/cwh/coding/mission_panel/data/mission_panel.db
```

#### 2. 环境变量

编辑 `backend/app/config.py` 配置：

```python
class Settings:
    # 数据库
    DATABASE_URL: str = "sqlite:////home/cwh/coding/mission_panel/data/mission_panel.db"
    
    # OpenClaw 数据目录
    OPENCLAW_DATA_DIR: str = "/home/cwh/.openclaw"
    
    # Coding 目录
    CODING_DIR: str = "/home/cwh/coding"
    
    # CORS 配置
    CORS_ORIGINS: list = ["*"]
```

#### 3. 启动后端

```bash
cd /home/cwh/coding/mission_panel/backend
conda activate mission_panel

# 开发模式（热重载）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产模式
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 前端部署

#### 1. 构建前端

```bash
cd /home/cwh/coding/mission_panel/frontend

# 安装依赖
pnpm install

# 构建生产版本
pnpm run build
```

构建产物位于 `dist/` 目录。

#### 2. 预览模式

```bash
# 启动预览服务器
pnpm run preview --host 0.0.0.0 --port 3000
```

#### 3. Vite 配置

`vite.config.ts` 已配置：
```typescript
server: {
  host: '0.0.0.0',  // 允许局域网访问
  port: 3000,
  proxy: {
    '/api': 'http://localhost:8000',
    '/health': 'http://localhost:8000',
    '/ws': 'ws://localhost:8000'
  }
}
```

---

## PM2 管理

### 配置文件

`ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'mission-panel-backend',
      cwd: '/home/cwh/coding/mission_panel/backend',
      script: '/home/cwh/miniconda3/envs/mission_panel/bin/uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8000',
      interpreter: 'none',
      env: {
        PATH: '/home/cwh/miniconda3/envs/mission_panel/bin',
        PYTHONPATH: '/home/cwh/coding/mission_panel/backend'
      },
      restart_delay: 3000,
      max_restarts: 10,
      autorestart: true,
      max_memory_restart: '500M',
      error_file: '/tmp/mission-panel-backend-error.log',
      out_file: '/tmp/mission-panel-backend-out.log'
    },
    {
      name: 'mission-panel-frontend',
      cwd: '/home/cwh/coding/mission_panel/frontend',
      script: '/usr/bin/pnpm',
      args: 'run preview --host 0.0.0.0 --port 3000',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      },
      autorestart: true,
      max_memory_restart: '500M',
      error_file: '/tmp/mission-panel-frontend-error.log',
      out_file: '/tmp/mission-panel-frontend-out.log'
    }
  ]
};
```

### 常用命令

#### 启动服务

```bash
# 启动所有服务
pm2 start ecosystem.config.js

# 启动单个服务
pm2 start ecosystem.config.js --only mission-panel-backend
```

#### 查看状态

```bash
# 列表查看
pm2 list

# 实时监控
pm2 monit

# 查看日志
pm2 logs

# 查看特定服务日志
pm2 logs mission-panel-backend
```

#### 重启服务

```bash
# 重启所有
pm2 restart all

# 重启单个
pm2 restart mission-panel-backend
```

#### 停止服务

```bash
# 停止所有
pm2 stop all

# 停止单个
pm2 stop mission-panel-backend

# 删除所有
pm2 delete all
```

### 开机自启

```bash
# 1. 生成 startup 命令
pm2 startup

# 2. 复制并执行输出的 sudo 命令（类似下面这行）
sudo env PATH=$PATH:/home/cwh/Software/node-v24.13.1-linux-x64/bin \
  /home/cwh/.npm-global/lib/node_modules/pm2/bin/pm2 startup systemd \
  -u cwh --hp /home/cwh

# 3. 保存当前进程列表
pm2 save
```

### 日志管理

日志文件位置：
- **后端错误**: `/tmp/mission-panel-backend-error.log`
- **后端输出**: `/tmp/mission-panel-backend-out.log`
- **前端错误**: `/tmp/mission-panel-frontend-error.log`
- **前端输出**: `/tmp/mission-panel-frontend-out.log`

查看日志：
```bash
# 实时查看
pm2 logs

# 查看最近 100 行
pm2 logs --lines 100

# 清空日志
pm2 flush
```

---

## API 文档

### 后端 API

**基础 URL**: `http://192.168.3.23:8000`

#### 健康检查

```
GET /health
```

**响应**:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-22T17:00:00+08:00"
}
```

#### 任务相关

##### 获取过去一周任务

```
GET /api/tasks/week?status={status}&page={page}&page_size={page_size}
```

**参数**:
- `status` (可选): 过滤状态 (ok/error/running/pending)
- `page` (可选): 页码，默认 1
- `page_size` (可选): 每页数量，默认 50

**响应**:
```json
{
  "items": [...],
  "total": 34,
  "page": 1,
  "page_size": 50
}
```

##### 获取任务统计

```
GET /api/tasks/stats
```

**响应**:
```json
{
  "total": 34,
  "completed": 30,
  "failed": 4,
  "running": 0,
  "pending": 0
}
```

#### 文件相关

##### 列出文件

```
GET /api/files/list?path={path}
```

**参数**:
- `path` (可选): 相对路径，默认根目录

**响应**:
```json
{
  "path": "",
  "items": [
    {
      "name": "README.md",
      "path": "README.md",
      "is_directory": false,
      "size": 1024,
      "modified_time": 1711084800
    }
  ]
}
```

##### 读取文件

```
GET /api/files/read?path={path}
```

**参数**:
- `path` (必填): 文件路径

**响应**:
```json
{
  "path": "README.md",
  "content": "# Mission Panel\n\n...",
  "size": 1024,
  "type": "markdown"
}
```

#### 统计相关

##### 获取概览统计

```
GET /api/stats/overview
```

**响应**:
```json
{
  "tasks": {
    "completed": 30,
    "failed": 4,
    "success_rate": 88.2
  },
  "tokens": {
    "total": 6080187,
    "input": 5971590,
    "output": 108597
  },
  "skills": {
    "unique_count": 0,
    "total_calls": 0
  }
}
```

##### 获取调度器状态

```
GET /api/scheduler/status
```

**响应**:
```json
{
  "status": "running",
  "jobs": [
    {
      "id": "collect_tasks",
      "name": "Collect Tasks from OpenClaw",
      "next_run": "2026-03-22 16:40:09",
      "trigger": "interval[0:05:00]"
    }
  ]
}
```

### API 文档页面

访问 Swagger UI: `http://192.168.3.23:8000/docs`

---

## 故障排查

### 常见问题

#### 1. 端口被占用

**错误**: `Address already in use`

**解决**:
```bash
# 查找占用端口的进程
lsof -ti:8000
lsof -ti:3000

# 杀死进程
kill -9 $(lsof -ti:8000)
kill -9 $(lsof -ti:3000)

# 重启 PM2
pm2 restart all
```

#### 2. 前端无法访问后端 API

**原因**: CORS 配置或代理问题

**解决**:
```bash
# 检查 Vite 代理配置
cat frontend/vite.config.ts

# 检查后端 CORS 配置
cat backend/app/config.py

# 重启服务
pm2 restart all
```

#### 3. 数据库错误

**错误**: `Database locked` 或 `No such table`

**解决**:
```bash
# 检查数据库文件
ls -lh /home/cwh/coding/mission_panel/data/

# 重新初始化（会删除数据）
rm /home/cwh/coding/mission_panel/data/mission_panel.db
pm2 restart mission-panel-backend
```

#### 4. PM2 进程一直重启

**原因**: 启动失败或配置错误

**解决**:
```bash
# 查看错误日志
pm2 logs mission-panel-backend --err

# 检查配置文件
cat ecosystem.config.js

# 手动测试启动
cd backend
conda activate mission_panel
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### 5. 手机无法访问

**原因**: 防火墙或网络问题

**解决**:
```bash
# 检查服务是否监听 0.0.0.0
netstat -tulpn | grep 8000
netstat -tulpn | grep 3000

# 检查防火墙（如果启用）
sudo ufw status
sudo ufw allow 3000
sudo ufw allow 8000

# 测试本地访问
curl http://192.168.3.23:8000/health
curl http://192.168.3.23:3000
```

### 日志查看

```bash
# PM2 日志
pm2 logs

# 后端日志
tail -f /tmp/mission-panel-backend-error.log
tail -f /tmp/mission-panel-backend-out.log

# 前端日志
tail -f /tmp/mission-panel-frontend-error.log
tail -f /tmp/mission-panel-frontend-out.log
```

### 性能监控

```bash
# 实时监控
pm2 monit

# 查看进程详情
pm2 describe mission-panel-backend

# 查看资源使用
pm2 list
```

---

## 网址访问

### 局域网访问

**前端（用户访问）**:
```
http://192.168.3.23:3000
```

**后端 API**:
```
http://192.168.3.23:8000
http://192.168.3.23:8000/docs  （API 文档）
```

### 功能页面

| 页面 | URL | 说明 |
|------|-----|------|
| Dashboard | `http://192.168.3.23:3000/` | 总览页面 |
| Tasks | `http://192.168.3.23:3000/tasks` | 任务列表 |
| Files | `http://192.168.3.23:3000/files` | 文件浏览 |
| Stats | `http://192.168.3.23:3000/stats` | 统计分析 |

### API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/api/tasks/week` | GET | 过去一周任务 |
| `/api/tasks/stats` | GET | 任务统计 |
| `/api/files/list` | GET | 文件列表 |
| `/api/files/read` | GET | 读取文件 |
| `/api/stats/overview` | GET | 统计概览 |
| `/api/scheduler/status` | GET | 调度器状态 |

---

## 定时任务

### 任务列表

| 任务 | 频率 | 说明 |
|------|------|------|
| collect_tasks | 每 5 分钟 | 收集 OpenClaw 任务记录 |
| update_skill_stats | 每 15 分钟 | 更新 Skill 使用统计 |
| index_files | 每 1 小时 | 索引 coding 目录文件 |
| daily_cleanup | 每天凌晨 3 点 | 清理 30 天前的旧数据 |

### 查看任务状态

```bash
curl http://192.168.3.23:8000/api/scheduler/status | jq
```

---

## 数据源

### OpenClaw 数据

**任务数据**:
```
/home/cwh/.openclaw/cron/runs/*.jsonl
```

**Session 数据**:
```
/home/cwh/.openclaw/memory/
```

### Coding 目录

**文件索引**:
```
/home/cwh/coding/
```

### 数据库

**位置**:
```
/home/cwh/coding/mission_panel/data/mission_panel.db
```

---

## 项目结构

```
mission_panel/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI 主入口
│   │   ├── config.py         # 配置文件
│   │   ├── database.py       # 数据库连接
│   │   ├── models.py         # 数据模型
│   │   └── api/              # API 路由
│   ├── collectors/           # 数据采集器
│   │   ├── task_collector.py
│   │   ├── skill_collector.py
│   │   └── file_indexer.py
│   ├── schedulers/           # 定时任务
│   │   └── scheduler.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React 组件
│   │   ├── pages/            # 页面组件
│   │   ├── hooks/            # 自定义 Hooks
│   │   └── api/              # API 客户端
│   ├── package.json
│   └── vite.config.ts
├── data/
│   └── mission_panel.db      # SQLite 数据库
├── doc/
│   └── DEPLOYMENT.md         # 本文档
└── ecosystem.config.js       # PM2 配置
```

---

## 更新日志

### v1.0.0 (2026-03-22)

**功能**:
- ✅ 任务监控（过去一周）
- ✅ 文件浏览（动态加载）
- ✅ 统计分析（饼图 + 卡片）
- ✅ Markdown 渲染
- ✅ 代码高亮
- ✅ 移动端优化（底部抽屉）
- ✅ 深色模式适配
- ✅ 定时数据收集
- ✅ PM2 进程管理

**技术**:
- FastAPI + SQLite
- React + TypeScript + Tailwind
- APScheduler 定时任务
- PM2 进程管理

---

## 支持

**GitHub**: https://github.com/ahangchen/mission_panel

**问题反馈**: 在 GitHub 上创建 Issue

---

**Made with ❤️ by OpenClaw AI Assistant**

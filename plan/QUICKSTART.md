# Mission Panel - 快速开始指南

## 📋 项目概述

**Mission Panel** 是一个家庭自动化系统的Web控制面板，提供：
- 📊 任务状态监控（过去一周）
- 📁 coding目录文件浏览器
- 📈 Skill使用统计排名

## 🚀 快速开始

### 第一步：初始化项目结构

```bash
cd /home/cwh/ubuntu18/home/ubuntu/coding/mission_panel

# 创建目录结构
mkdir -p backend/{app/{models,api},collectors,jobs}
mkdir -p frontend/src/{components,pages,hooks,api,utils}
mkdir -p data/logs
```

### 第二步：后端初始化

```bash
cd backend

# 创建Python虚拟环境
python3 -m venv venv
source venv/bin.activate

# 安装依赖
pip install fastapi uvicorn sqlalchemy aiosqlite python-multipart

# 创建requirements.txt
cat > requirements.txt << EOF
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
aiosqlite==0.19.0
python-multipart==0.0.6
apscheduler==3.10.4
EOF
```

### 第三步：前端初始化

```bash
cd ../frontend

# 使用Vite创建React项目
npm create vite@latest . -- --template react-ts
npm install

# 安装依赖
npm install tailwindcss postcss autoprefixer
npm install recharts react-router-dom axios
npm install react-markdown prismjs react-icons

# 初始化Tailwind
npx tailwindcss init -p
```

### 第四步：开发环境启动

```bash
# 终端1: 启动后端
cd backend
source venv/bin.activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 终端2: 启动前端
cd frontend
npm run dev
```

## 📁 最小可行产品（MVP）结构

```
mission_panel/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI入口
│   │   ├── database.py          # 数据库配置
│   │   └── api/
│   │       ├── tasks.py         # 任务API
│   │       ├── files.py         # 文件API
│   │       └── stats.py         # 统计API
│   ├── collectors/
│   │   └── task_collector.py    # 任务采集器
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx    # 主面板
│   │   │   └── Tasks.tsx        # 任务页
│   │   └── api/
│   │       └── client.ts        # API客户端
│   └── package.json
└── data/
    └── mission_panel.db         # SQLite数据库
```

## 🎯 第一周目标

### Day 1-2: 后端基础
- [x] 创建开发计划
- [ ] 初始化项目结构
- [ ] 实现数据库模型
- [ ] 开发任务采集器

### Day 3-4: 核心API
- [ ] 任务查询API
- [ ] 文件浏览API
- [ ] 统计数据API

### Day 5-7: 前端界面
- [ ] 任务监控面板
- [ ] 简单文件浏览器
- [ ] Skill排名展示

## 🔍 数据源位置

```bash
# OpenClaw任务执行记录
/home/cwh/.openclaw/cron/runs/*.jsonl

# OpenClaw配置文件
/home/cwh/.openclaw/openclaw.json

# Coding目录
/home/cwh/coding/

# 会话记忆
/home/cwh/.openclaw/workspace/memory/
```

## 📝 开发日志

### 2026-03-22
- ✅ 创建plan目录
- ✅ 编写开发计划（DEVELOPMENT_PLAN.md）
- ✅ 编写快速开始指南（本文档）
- 🔄 下一步：初始化项目结构

## 🆘 遇到问题？

1. **数据格式问题**: 查看 `backend/collectors/` 中的适配器
2. **权限问题**: 检查文件系统挂载和访问权限
3. **依赖问题**: 查看 `requirements.txt` 和 `package.json`

## 📚 相关文档

- [完整开发计划](./DEVELOPMENT_PLAN.md)
- [API文档](http://localhost:8000/docs) - 启动后端后访问
- [技术栈说明](./TECH_STACK.md) - 待创建

---

**开始时间**: 2026-03-22
**当前阶段**: Phase 1 - 数据采集和后端API
**下一步**: 初始化项目结构

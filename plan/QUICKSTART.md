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

# 使用 conda 环境（推荐）
conda activate mission_panel

# 如果环境不存在，创建它：
# conda create -n mission_panel python=3.11 -y
# conda activate mission_panel
# pip install -r requirements.txt

# 依赖已在 requirements.txt 中定义
# fastapi==0.135.1
# uvicorn[standard]==0.42.0
# sqlalchemy==2.0.48
# aiosqlite==0.22.1
# python-multipart==0.0.22
# apscheduler==3.11.2
```

### 第三步：前端初始化

```bash
cd ../frontend

# 使用 pnpm 安装依赖（推荐）
pnpm install

# 如果没有 pnpm，先全局安装：
# npm install -g pnpm

# 依赖已在 package.json 中定义
# 主要依赖：
# - React 18 + TypeScript
# - Vite（构建工具）
# - Tailwind CSS（样式）
# - Recharts（图表）
# - react-router-dom（路由）
# - react-markdown + prismjs（Markdown + 代码高亮）
```

### 第四步：开发环境启动

```bash
# 终端1: 启动后端
cd backend
conda activate mission_panel
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 终端2: 启动前端
cd frontend
pnpm run dev
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
- [x] 初始化项目结构
- [x] 实现数据库模型
- [x] 开发任务采集器
- [x] **Phase 1 完成** ✅
  - 数据库初始化
  - 259 条任务记录采集
  - 16,144 个文件索引
  - API 端点测试通过

### Day 3-4: 核心API
- [x] 任务查询API
- [x] 文件浏览API
- [x] 统计数据API

### Day 5-7: 前端界面
- [x] 任务监控面板
- [x] 文件浏览器
- [x] Skill排名展示
- [x] 代码高亮 (react-syntax-highlighter)
- [x] Markdown渲染 (remark-gfm)
- [x] WebSocket 实时更新
- [x] **Phase 2 完成** ✅ (100%)

## 🎉 Phase 1 & 2 已完成！

**当前可用功能**:
- ✅ 任务监控（过去一周 35 个任务）
- ✅ 文件浏览（16,144 个文件索引）
- ✅ 统计分析（Token 消耗、成功率）
- ✅ 代码查看（高亮 + Markdown 渲染）
- ✅ 实时更新（WebSocket）

**访问地址**:
- 前端: http://localhost:3000
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs

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
- ✅ 初始化项目结构（后端 + 前端）
- ✅ 创建 conda 环境：`mission_panel` (Python 3.11.15)
- ✅ 安装后端依赖：FastAPI + SQLAlchemy + APScheduler
- ✅ 安装 pnpm 并配置前端依赖
- 🔄 下一步：初始化数据库 + 测试 API

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

# Mission Panel - 家庭自动化中枢开发计划

## 项目概述

**目标**：开发一个响应式Web界面，作为家庭自动化系统的中央控制面板，提供任务监控、项目浏览和统计功能。

**核心功能**：
1. 过去一周任务状态监控（完成/进行中/失败）
2. coding目录文件浏览器（移动端+PC端友好）
3. Skill使用次数排名统计

---

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **UI库**: Tailwind CSS（响应式设计）
- **图表**: Recharts / Chart.js
- **代码高亮**: Prism.js / Monaco Editor
- **Markdown渲染**: react-markdown
- **文件图标**: react-icons

### 后端
- **框架**: Python FastAPI（高性能，易部署）
- **数据采集**: 自定义脚本读取OpenClaw数据
- **API文档**: 自动生成Swagger UI
- **实时通信**: WebSocket（任务状态更新）

### 数据存储
- **主数据库**: SQLite（轻量级，无需额外服务）
- **配置文件**: JSON（任务配置、统计缓存）
- **日志**: JSONL格式（兼容OpenClaw格式）

### 部署
- **容器化**: Docker + docker-compose
- **反向代理**: Nginx（SSL终止，静态资源）
- **进程管理**: Systemd / PM2
- **监控**: 内置健康检查端点

---

## 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                     前端层 (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 任务监控面板  │  │  文件浏览器   │  │  统计面板    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕ REST API + WebSocket
┌─────────────────────────────────────────────────────────┐
│                   后端层 (FastAPI)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 任务状态API   │  │  文件系统API  │  │  统计API     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕ 读取
┌─────────────────────────────────────────────────────────┐
│                   数据源层                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ cron/runs/   │  │ coding目录   │  │ session日志  │  │
│  │ (JSONL)      │  │ (文件系统)   │  │ (JSONL)      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 开发阶段

### Phase 1: 数据采集和后端API（3-4天）

#### 1.1 数据模型设计

**任务记录表 (tasks)**
```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL,
    session_id TEXT,
    task_name TEXT,
    status TEXT CHECK(status IN ('ok', 'error', 'running', 'pending')),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_ms INTEGER,
    error_message TEXT,
    summary TEXT,
    model TEXT,
    provider TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Skill使用记录表 (skill_usage)**
```sql
CREATE TABLE skill_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_name TEXT NOT NULL,
    session_id TEXT,
    timestamp TIMESTAMP,
    success BOOLEAN,
    duration_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**文件索引表 (file_index)**
```sql
CREATE TABLE file_index (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL UNIQUE,
    file_name TEXT,
    file_type TEXT,
    size_bytes INTEGER,
    modified_time TIMESTAMP,
    is_directory BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.2 数据采集脚本

**位置**: `backend/collectors/`

1. **task_collector.py**
   - 读取 `/home/cwh/.openclaw/cron/runs/*.jsonl`
   - 解析任务执行记录
   - 写入SQLite数据库
   - 支持增量更新（基于文件修改时间）

2. **skill_collector.py**
   - 读取会话日志（从memory目录或session数据库）
   - 提取skill调用记录
   - 统计使用频率
   - 更新统计缓存

3. **file_indexer.py**
   - 遍历 `/home/cwh/coding/` 目录
   - 建立文件索引（名称、类型、大小、修改时间）
   - 支持增量更新
   - 过滤敏感文件（.env, credentials等）

#### 1.3 FastAPI后端开发

**位置**: `backend/app/`

**API端点**:

```python
# 任务相关
GET    /api/tasks/week              # 获取过去一周任务列表
GET    /api/tasks/stats             # 获取任务统计（完成/失败/进行中数量）
GET    /api/tasks/{task_id}         # 获取单个任务详情
GET    /api/tasks/search            # 搜索任务（按名称、状态、时间）

# 文件浏览
GET    /api/files/list              # 列出目录内容
GET    /api/files/read              # 读取文件内容（支持代码高亮）
GET    /api/files/search            # 搜索文件
GET    /api/files/download          # 下载文件

# 统计数据
GET    /api/stats/skills            # Skill使用排名
GET    /api/stats/models            # 模型使用统计
GET    /api/stats/overview          # 总览数据

# 实时通信
WS     /ws/tasks                    # WebSocket任务更新推送
```

**实现细节**:

1. **分页和过滤**
   - 所有列表API支持分页（page, page_size）
   - 支持时间范围过滤（start_date, end_date）
   - 支持状态过滤（status）

2. **缓存策略**
   - 统计数据缓存（5分钟更新一次）
   - 文件索引缓存（1小时更新一次）
   - 任务列表实时查询

3. **错误处理**
   - 统一错误响应格式
   - 文件访问权限检查
   - 路径遍历攻击防护

4. **安全措施**
   - 文件访问白名单（只允许coding目录）
   - 敏感文件过滤
   - API访问日志

---

### Phase 2: 前端界面开发（4-5天）

#### 2.1 项目结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── TaskMonitor/
│   │   │   ├── TaskList.tsx          # 任务列表
│   │   │   ├── TaskCard.tsx          # 任务卡片
│   │   │   ├── TaskStats.tsx         # 统计面板
│   │   │   └── TaskFilter.tsx        # 过滤器
│   │   ├── FileBrowser/
│   │   │   ├── FileTree.tsx          # 文件树
│   │   │   ├── FileViewer.tsx        # 文件查看器
│   │   │   ├── CodeHighlight.tsx     # 代码高亮
│   │   │   └── MarkdownRenderer.tsx  # Markdown渲染
│   │   ├── StatsPanel/
│   │   │   ├── SkillRanking.tsx      # Skill排名
│   │   │   ├── UsageChart.tsx        # 使用图表
│   │   │   └── OverviewCards.tsx     # 总览卡片
│   │   └── common/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Loading.tsx
│   │       └── ErrorBoundary.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx             # 主面板
│   │   ├── Tasks.tsx                 # 任务页
│   │   ├── Files.tsx                 # 文件浏览页
│   │   └── Stats.tsx                 # 统计页
│   ├── hooks/
│   │   ├── useTasks.ts               # 任务数据hook
│   │   ├── useFiles.ts               # 文件数据hook
│   │   └── useWebSocket.ts           # WebSocket hook
│   ├── api/
│   │   ├── client.ts                 # API客户端
│   │   └── types.ts                  # TypeScript类型定义
│   └── utils/
│       ├── formatDate.ts
│       └── formatSize.ts
├── public/
└── package.json
```

#### 2.2 核心组件设计

**1. 任务监控面板**

功能：
- 显示过去7天任务时间线
- 状态过滤（全部/成功/失败/进行中）
- 任务详情展开
- 实时更新（WebSocket）

UI设计：
```
┌──────────────────────────────────────────────────┐
│ 任务监控                     [过滤: 全部 ▼] [刷新] │
├──────────────────────────────────────────────────┤
│ 统计概览                                          │
│ ✅ 完成: 23  ⏳ 进行中: 2  ❌ 失败: 5            │
├──────────────────────────────────────────────────┤
│ 📅 2026-03-21                                    │
│ ├─ ✅ spatial-agi-research  07:00-07:30 (30m)   │
│ │   模型: glm-4.7 | Tokens: 112K                │
│ ├─ ❌ 训练任务              14:00-14:15 (失败)  │
│ │   错误: CUDA out of memory                    │
│ └─ ⏳ 数据处理              16:00-进行中        │
│                                                  │
│ 📅 2026-03-20                                    │
│ └─ ✅ heartbeat-check       00:00-00:01 (1m)    │
└──────────────────────────────────────────────────┘
```

**2. 文件浏览器**

功能：
- 树形目录结构
- 文件搜索
- 代码高亮（支持Python, JS, TS, Markdown等）
- Markdown渲染
- 移动端友好（滑动抽屉）

UI设计：
```
┌────────────┬─────────────────────────────────────┐
│ 文件树      │ 文件内容                             │
├────────────┤─────────────────────────────────────┤
│ 📁 former3d│ # README.md                          │
│   📁 src   │                                      │
│   📁 tests │ Former3D是一个3D重建项目...           │
│   📄 README│                                      │
│ 📁 auto_blog│ ## 安装                             │
│   📄 ...   │ ```bash                             │
│            │ pip install -r requirements.txt      │
│            │ ```                                  │
└────────────┴─────────────────────────────────────┘
```

**3. 统计面板**

功能：
- Skill使用排名（柱状图）
- 模型使用分布（饼图）
- 任务执行趋势（折线图）
- Token消耗统计

UI设计：
```
┌──────────────────────────────────────────────────┐
│ 统计数据                                          │
├──────────────────────────────────────────────────┤
│ Skill使用排名 (过去7天)                           │
│ 1. feishu-bitable        ████████████  156次    │
│ 2. web-search            █████████     89次     │
│ 3. coding-agent          ███████       67次     │
│ 4. spatial-agi-research  ████          45次     │
│ 5. paper-analysis        ███           34次     │
├──────────────────────────────────────────────────┤
│ 模型使用分布                                      │
│ [饼图: glm-5 45%, glm-4.7 30%, deepseek 25%]    │
└──────────────────────────────────────────────────┘
```

#### 2.3 响应式设计

**断点**:
- Mobile: < 768px（单列布局，抽屉菜单）
- Tablet: 768px - 1024px（侧边栏折叠）
- Desktop: > 1024px（完整布局）

**移动端优化**:
- 任务列表改为卡片式
- 文件树改为全屏模态框
- 图表改为简化版
- 底部导航栏

---

### Phase 3: 数据采集自动化（1-2天）

#### 3.1 定时任务配置

**位置**: `backend/jobs/`

1. **任务采集器**（每5分钟）
   ```python
   # jobs/collect_tasks.py
   def collect_recent_tasks():
       """采集最近的任务执行记录"""
       collector = TaskCollector()
       collector.collect_incremental()
   ```

2. **Skill统计更新**（每15分钟）
   ```python
   # jobs/update_skill_stats.py
   def update_skill_statistics():
       """更新Skill使用统计"""
       collector = SkillCollector()
       collector.update_stats()
   ```

3. **文件索引更新**（每小时）
   ```python
   # jobs/index_files.py
   def update_file_index():
       """更新文件索引"""
       indexer = FileIndexer()
       indexer.reindex_directory('/home/cwh/coding/')
   ```

#### 3.2 启动脚本

**位置**: `backend/start_scheduler.py`

```python
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

# 添加定时任务
scheduler.add_job(collect_recent_tasks, 'interval', minutes=5)
scheduler.add_job(update_skill_statistics, 'interval', minutes=15)
scheduler.add_job(update_file_index, 'interval', hours=1)

scheduler.start()
```

---

### Phase 4: 部署和监控（2天）

#### 4.1 Docker配置

**docker-compose.yml**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - /home/cwh/.openclaw:/data/openclaw:ro
      - /home/cwh/coding:/data/coding:ro
      - ./data:/app/data
    environment:
      - OPENCLAW_DATA_DIR=/data/openclaw
      - CODING_DIR=/data/coding
      - DATABASE_URL=sqlite:///data/mission_panel.db
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

#### 4.2 Nginx配置

```nginx
server {
    listen 80;
    server_name mission.local;

    # 前端
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### 4.3 Systemd服务

**/etc/systemd/system/mission-panel.service**
```ini
[Unit]
Description=Mission Panel Service
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=cwh
WorkingDirectory=/home/cwh/ubuntu18/home/ubuntu/coding/mission_panel
ExecStart=/usr/bin/docker-compose up
ExecStop=/usr/bin/docker-compose down
Restart=always

[Install]
WantedBy=multi-user.target
```

#### 4.4 监控和日志

**健康检查端点**:
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": check_database(),
        "openclaw_data": check_data_access(),
        "timestamp": datetime.now().isoformat()
    }
```

**日志配置**:
```python
import logging
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler(
    'logs/mission_panel.log',
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5
)
logger.addHandler(handler)
```

---

## 文件结构

```
mission_panel/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI主入口
│   │   ├── config.py               # 配置管理
│   │   ├── database.py             # 数据库连接
│   │   ├── models/                 # SQLAlchemy模型
│   │   ├── api/                    # API路由
│   │   │   ├── tasks.py
│   │   │   ├── files.py
│   │   │   └── stats.py
│   │   └── websocket.py            # WebSocket处理
│   ├── collectors/                 # 数据采集器
│   │   ├── task_collector.py
│   │   ├── skill_collector.py
│   │   └── file_indexer.py
│   ├── jobs/                       # 定时任务
│   │   ├── collect_tasks.py
│   │   ├── update_skill_stats.py
│   │   └── index_files.py
│   ├── start_scheduler.py          # 调度器启动
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── plan/
│   └── DEVELOPMENT_PLAN.md         # 本文档
├── data/                           # 数据目录（挂载到容器）
│   ├── mission_panel.db            # SQLite数据库
│   └── logs/                       # 日志目录
├── docker-compose.yml
├── nginx.conf
├── .env.example
└── README.md
```

---

## 开发优先级

### P0（必须有）
1. ✅ 任务状态监控（过去一周）
2. ✅ 基础API端点（任务、文件、统计）
3. ✅ 简单的文件浏览器（列表+查看）
4. ✅ Skill使用排名

### P1（应该有）
1. 🔄 实时更新（WebSocket）
2. 🔄 移动端优化
3. 🔄 代码高亮和Markdown渲染
4. 🔄 搜索功能

### P2（可以有）
1. 📋 任务详情展开
2. 📊 高级图表（趋势、分布）
3. 📁 文件下载
4. 🔔 通知功能

---

## 时间估算

| 阶段 | 任务 | 预计时间 | 累计 |
|------|------|---------|------|
| Phase 1 | 数据采集和后端API | 3-4天 | 4天 |
| Phase 2 | 前端界面开发 | 4-5天 | 9天 |
| Phase 3 | 数据采集自动化 | 1-2天 | 11天 |
| Phase 4 | 部署和监控 | 2天 | 13天 |
| **总计** | | **10-13天** | |

---

## 技术风险和应对

### 风险1: OpenClaw数据格式变更
**应对**: 
- 创建数据适配层，隔离格式变化
- 定期检查OpenClaw更新日志
- 添加数据格式验证

### 风险2: 文件系统权限问题
**应对**:
- 使用只读挂载
- 实现白名单机制
- 详细的错误日志

### 风险3: 大文件浏览性能
**应对**:
- 文件大小限制（>5MB禁止在线查看）
- 分块加载
- 虚拟滚动

### 风险4: WebSocket连接不稳定
**应对**:
- 自动重连机制
- 降级到轮询
- 心跳检测

---

## 后续扩展

### 可能的增强功能
1. **任务管理**
   - 手动触发任务
   - 任务暂停/恢复
   - 任务优先级调整

2. **智能推荐**
   - 基于使用模式推荐Skill
   - 任务执行时间预测
   - 异常检测和告警

3. **团队协作**
   - 多用户支持
   - 任务分配
   - 评论和讨论

4. **移动App**
   - React Native版本
   - 推送通知
   - 离线访问

---

## 开发规范

### Git提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试
chore: 构建/工具链
```

### 代码风格
- Python: PEP 8 + Black格式化
- TypeScript: Prettier + ESLint
- 提交前必须通过lint检查

### 测试要求
- 后端: pytest（单元测试 + API测试）
- 前端: Jest + React Testing Library
- 覆盖率: >70%

---

## 下一步行动

1. **环境准备**（今天）
   - [x] 创建plan目录
   - [ ] 初始化前后端项目结构
   - [ ] 配置开发环境

2. **Phase 1启动**（明天）
   - [ ] 创建数据模型
   - [ ] 实现任务采集器
   - [ ] 开发基础API

3. **每日同步**
   - 每天更新开发进度
   - 遇到问题及时记录
   - 定期代码审查

---

*创建时间: 2026-03-22*
*预计完成: 2026-04-05*
*负责人: Weihang + Frank*

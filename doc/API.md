# Mission Panel - API 文档

> 完整的 API 端点文档

---

## 📋 目录

- [基础信息](#基础信息)
- [健康检查](#健康检查)
- [任务 API](#任务-api)
- [文件 API](#文件-api)
- [统计 API](#统计-api)
- [调度器 API](#调度器-api)

---

## 基础信息

**Base URL**: `http://192.168.3.23:8000`

**Content-Type**: `application/json`

**CORS**: 允许所有来源 (`*`)

---

## 健康检查

### GET /health

健康检查端点，用于监控服务状态。

**请求示例**:
```bash
curl http://192.168.3.23:8000/health
```

**响应**:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-22T17:00:00+08:00"
}
```

**状态码**:
- `200`: 服务正常

---

## 任务 API

### GET /api/tasks/week

获取过去一周的任务列表。

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| status | string | 否 | - | 过滤状态: ok/error/running/pending |
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 50 | 每页数量 |

**请求示例**:
```bash
# 获取所有任务
curl http://192.168.3.23:8000/api/tasks/week

# 只获取失败的任务
curl http://192.168.3.23:8000/api/tasks/week?status=error

# 分页查询
curl http://192.168.3.23:8000/api/tasks/week?page=2&page_size=20
```

**响应**:
```json
{
  "items": [
    {
      "id": 1,
      "job_id": "abc123",
      "session_id": "session-456",
      "task_name": "Spatial AGI 每日研究",
      "status": "ok",
      "start_time": "2026-03-22T10:00:00",
      "end_time": "2026-03-22T10:12:30",
      "duration_ms": 750000,
      "error_message": null,
      "summary": "### ✔ 任务完成\n\n执行时间：约12分钟",
      "model": "deepseek/deepseek-chat",
      "provider": "deepseek",
      "input_tokens": 50000,
      "output_tokens": 8000
    }
  ],
  "total": 34,
  "page": 1,
  "page_size": 50
}
```

**状态码**:
- `200`: 成功
- `500`: 服务器错误

---

### GET /api/tasks/stats

获取任务统计信息。

**请求示例**:
```bash
curl http://192.168.3.23:8000/api/tasks/stats
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

**状态码**:
- `200`: 成功

---

### GET /api/tasks/{task_id}

获取单个任务详情。

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| task_id | int | 任务 ID |

**请求示例**:
```bash
curl http://192.168.3.23:8000/api/tasks/1
```

**响应**:
```json
{
  "id": 1,
  "job_id": "abc123",
  "task_name": "Spatial AGI 每日研究",
  "status": "ok",
  "start_time": "2026-03-22T10:00:00",
  "duration_ms": 750000,
  "summary": "### ✔ 任务完成\n\n执行时间：约12分钟",
  "model": "deepseek/deepseek-chat",
  "input_tokens": 50000,
  "output_tokens": 8000
}
```

**状态码**:
- `200`: 成功
- `404`: 任务不存在

---

### GET /api/tasks/search

搜索任务。

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |
| status | string | 否 | 过滤状态 |

**请求示例**:
```bash
curl "http://192.168.3.23:8000/api/tasks/search?q=Spatial&status=ok"
```

**响应**:
```json
{
  "items": [...],
  "total": 5
}
```

---

## 文件 API

### GET /api/files/list

列出目录下的文件。

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| path | string | 否 | "" | 相对路径 |

**请求示例**:
```bash
# 列出根目录
curl http://192.168.3.23:8000/api/files/list

# 列出子目录
curl "http://192.168.3.23:8000/api/files/list?path=baby_care/shopping"
```

**响应**:
```json
{
  "path": "baby_care/shopping",
  "items": [
    {
      "name": "M1-simplified.md",
      "path": "baby_care/shopping/M1-simplified.md",
      "is_directory": false,
      "size": 49664,
      "modified_time": 1711084800
    },
    {
      "name": "M1.md",
      "path": "baby_care/shopping/M1.md",
      "is_directory": false,
      "size": 54476,
      "modified_time": 1711084800
    }
  ]
}
```

**状态码**:
- `200`: 成功
- `403`: 路径不安全
- `404`: 目录不存在

---

### GET /api/files/read

读取文件内容。

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| path | string | 是 | 文件路径 |

**请求示例**:
```bash
curl "http://192.168.3.23:8000/api/files/read?path=README.md"
```

**响应**:
```json
{
  "path": "README.md",
  "content": "# Mission Panel\n\n这是一个任务监控面板...",
  "size": 1024,
  "type": "markdown"
}
```

**状态码**:
- `200`: 成功
- `403`: 文件敏感或路径不安全
- `404`: 文件不存在
- `413`: 文件太大（>10MB）

---

### GET /api/files/search

搜索文件。

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| q | string | 是 | - | 搜索关键词 |
| limit | int | 否 | 50 | 结果数量限制 |

**请求示例**:
```bash
curl "http://192.168.3.23:8000/api/files/search?q=README&limit=10"
```

**响应**:
```json
{
  "items": [
    {
      "name": "README.md",
      "path": "README.md",
      "size": 1024
    }
  ],
  "total": 1
}
```

---

## 统计 API

### GET /api/stats/overview

获取统计概览。

**请求示例**:
```bash
curl http://192.168.3.23:8000/api/stats/overview
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

**状态码**:
- `200`: 成功

---

### GET /api/stats/skills

获取 Skill 使用统计。

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| days | int | 否 | 7 | 统计天数 |
| limit | int | 否 | 20 | 结果数量限制 |

**请求示例**:
```bash
curl "http://192.168.3.23:8000/api/stats/skills?days=7&limit=10"
```

**响应**:
```json
{
  "items": [
    {
      "skill_name": "coding-agent",
      "call_count": 15,
      "success_count": 14,
      "success_rate": 93.3
    }
  ],
  "total": 1
}
```

---

### GET /api/stats/models

获取模型使用统计。

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| days | int | 否 | 7 | 统计天数 |

**请求示例**:
```bash
curl "http://192.168.3.23:8000/api/stats/models?days=7"
```

**响应**:
```json
{
  "items": [
    {
      "model": "deepseek/deepseek-chat",
      "provider": "deepseek",
      "call_count": 30,
      "total_tokens": 500000,
      "input_tokens": 450000,
      "output_tokens": 50000
    }
  ]
}
```

---

## 调度器 API

### GET /api/scheduler/status

获取调度器状态和任务列表。

**请求示例**:
```bash
curl http://192.168.3.23:8000/api/scheduler/status
```

**响应**:
```json
{
  "status": "running",
  "jobs": [
    {
      "id": "collect_tasks",
      "name": "Collect Tasks from OpenClaw",
      "next_run": "2026-03-22 16:40:09+08:00",
      "trigger": "interval[0:05:00]"
    },
    {
      "id": "update_skill_stats",
      "name": "Update Skill Statistics",
      "next_run": "2026-03-22 16:50:09+08:00",
      "trigger": "interval[0:15:00]"
    },
    {
      "id": "index_files",
      "name": "Index Files in Coding Directory",
      "next_run": "2026-03-22 17:35:09+08:00",
      "trigger": "interval[1:00:00]"
    },
    {
      "id": "daily_cleanup",
      "name": "Daily Database Cleanup",
      "next_run": "2026-03-23 03:00:00+08:00",
      "trigger": "cron[hour='3', minute='0']"
    }
  ]
}
```

**状态码**:
- `200`: 成功

---

## 错误响应

所有 API 在发生错误时返回统一格式：

```json
{
  "detail": "错误描述信息"
}
```

**常见错误码**:
- `400`: 请求参数错误
- `403`: 权限不足或路径不安全
- `404`: 资源不存在
- `413`: 请求体太大
- `500`: 服务器内部错误

---

## 在线文档

访问 Swagger UI 查看交互式 API 文档：

```
http://192.168.3.23:8000/docs
```

访问 ReDoc 查看美化版文档：

```
http://192.168.3.23:8000/redoc
```

---

**Made with ❤️ by OpenClaw AI Assistant**

"""
Test Feishu message collection
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from collectors.feishu_chat_collector import FeishuChatTaskCollector
from app.database import SessionLocal
from app.models import Task

# 初始化采集器
collector = FeishuChatTaskCollector()

# 测试消息识别
test_messages = [
    {
        'content': '## ✅ PM2 统一管理配置完成！\n\n服务状态：online',
        'create_time': '2026-03-22T17:30:00+08:00',
        'message_id': 'test_001',
        'sender': {'id': 'ou_xxx'}
    },
    {
        'content': 'HEARTBEAT_OK',
        'create_time': '2026-03-22T17:31:00+08:00',
        'message_id': 'test_002',
        'sender': {'id': 'ou_xxx'}
    },
    {
        'content': '## ❌ 发现错误\n\n任务执行失败',
        'create_time': '2026-03-22T17:32:00+08:00',
        'message_id': 'test_003',
        'sender': {'id': 'ou_xxx'}
    },
]

db = SessionLocal()

print("📊 测试飞书消息采集器")
print("=" * 60)

for msg in test_messages:
    content = msg['content']
    is_task = collector.is_task_message(content)
    
    print(f"\n消息: {content[:50]}...")
    print(f"是否为任务: {'✅ 是' if is_task else '❌ 否'}")
    
    if is_task:
        print(f"  - 状态: {collector.extract_status(content)}")
        print(f"  - 名称: {collector.extract_task_name(content)}")

# 测试数据库保存
print("\n" + "=" * 60)
print("测试数据库保存...")

count = collector.process_feishu_messages(test_messages, db)
print(f"✅ 保存了 {count} 个任务")

# 查询结果
tasks = db.query(Task).filter(Task.source == 'feishu').all()
print(f"\n数据库中的飞书任务数量: {len(tasks)}")
for task in tasks[:3]:
    print(f"  - {task.task_name}: {task.status}")

db.close()

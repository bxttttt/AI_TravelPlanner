#!/bin/bash

# AI旅行规划师启动脚本

echo "🚀 启动AI旅行规划师..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
    echo "⚠️  请编辑 .env 文件，配置您的设置"
fi

# 启动服务
echo "🐳 启动Docker容器..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

echo ""
echo "✅ AI旅行规划师启动完成！"
echo "🌐 访问地址: http://localhost:5000"
echo ""
echo "📋 管理命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo ""
echo "🔧 首次使用请："
echo "  1. 注册新账户"
echo "  2. 在设置中配置OpenAI API Key"
echo "  3. 开始创建您的第一个旅行计划！"

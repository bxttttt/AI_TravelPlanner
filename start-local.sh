#!/bin/bash

echo "🚀 启动AI旅行规划师（本地模式）..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请先安装npm"
    exit 1
fi

# 安装后端依赖
echo "📦 安装后端依赖..."
npm install

# 启动后端服务器
echo "🔧 启动后端服务器..."
PORT=3001 node server-simple.js &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 检查后端是否启动成功
if ! curl -s http://localhost:3001/api/auth/me > /dev/null; then
    echo "❌ 后端服务器启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ 后端服务器启动成功！"
echo "🌐 后端API地址: http://localhost:3001"
echo ""
echo "📝 使用说明："
echo "1. 打开浏览器访问: http://localhost:3001"
echo "2. 注册新账户（演示模式，任何邮箱都可以登录）"
echo "3. 开始创建您的第一个旅行计划！"
echo ""
echo "🛑 停止服务: 按 Ctrl+C"

# 保持脚本运行
wait $BACKEND_PID

# 使用 Node 18 官方精简镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制依赖清单并安装生产依赖
COPY package*.json ./
RUN npm install --omit=dev

# 复制项目源代码
COPY . .

# 设置运行时环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 暴露服务端口
EXPOSE 3001

# 启动 v1.0.0 版本使用的 server-test.js
CMD ["node", "server-test.js"]

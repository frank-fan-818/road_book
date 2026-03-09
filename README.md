# AI 个人路书 (AI Travel Dashboard)

一款将模糊的旅行意愿转化为结构化、可交互时间轴路书的轻量化工具。

## 功能特性

- **语义化行程生成**：输入旅行意愿，AI 自动生成详细行程
- **仪表盘式布局**：左侧日期导航 + 中间时间轴 + 右侧详情
- **数据驱动渲染**：完全基于 JSON 渲染，支持一键更新
- **Supabase 数据持久化**：行程数据自动保存到云端

## 技术栈

- React 18 + Vite
- Tailwind CSS
- 智谱GLM API (AI 生成)
- Supabase (数据库)

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/frank-fan-818/road_book.git
cd road_book/ai-travel-dashboard
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填入您的 API Key：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```
VITE_ZHIPU_API_KEY=your_zhipu_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

## 使用说明

1. 在输入框描述您的旅行意愿，例如：
   - "欧洲10日游，喜欢艺术和历史"
   - "日本7日游，喜欢美食和温泉"
   - "东南亚5日游，喜欢海岛和潜水"

2. 点击「生成路书」按钮

3. AI 将自动生成个性化行程并展示在仪表盘中

## License

MIT

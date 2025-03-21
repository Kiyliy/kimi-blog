# Notion集成指南

本项目支持使用Notion作为内容管理系统（CMS），有两种集成方式：

1. **公共Notion页面**：直接从公共Notion页面获取数据
2. **Notion官方API**：使用Notion官方API获取内容（需要API密钥）

## 设置环境变量

创建`.env.local`文件（或修改现有文件），添加以下变量：

```
# 选择数据源: local | public-notion | notion-api
DATA_SOURCE=public-notion

# 公共Notion页面ID（用于public-notion数据源）
NOTION_PUBLIC_PAGE_ID=your-page-id

# Notion API相关（用于notion-api数据源）
NOTION_API_KEY=your-notion-api-key
NOTION_DATABASE_ID=your-database-id
```

## 使用公共Notion页面

### 1. 设置公共Notion页面

1. 在Notion中创建一个页面，并添加一个数据库（表格视图最佳）
2. 为数据库添加以下属性：
   - `Title`（标题）：文章标题
   - `Slug`（文本）：URL友好的文章标识符
   - `Date`（日期）：发布日期
   - `Category`（选择）：文章分类
   - `Tags`（多选）：文章标签
   - `Excerpt`（文本）：文章摘要
   - `Status`（选择）：文章状态（推荐使用Published/Draft）
   - `Content`（文本）：文章内容（可选，也可以使用页面内容）
3. 点击"分享"按钮，设置为"分享到网络"，获取公共链接

### 2. 获取页面ID

从Notion页面URL中提取页面ID：

```
https://www.notion.so/Your-Page-Title-1234567890abcdef1234567890abcdef
                                     ↑
                                  页面ID
```

页面ID是URL中的最后一部分，通常是32个字符，可能包含连字符（-）。

### 3. 配置环境变量

在`.env.local`文件中设置：

```
DATA_SOURCE=public-notion
NOTION_PUBLIC_PAGE_ID=1234567890abcdef1234567890abcdef
```

## 使用Notion官方API

### 1. 创建Notion集成

1. 访问 [Notion开发者页面](https://www.notion.so/my-integrations)
2. 点击"+ 新建集成"
3. 填写集成名称（如"我的博客"）和选择关联的工作区
4. 创建完成后，复制"Internal Integration Token"

### 2. 分享数据库与集成

1. 在Notion中创建一个数据库（与上述相同的结构）
2. 点击数据库右上角的"···"，选择"添加连接"，选择你刚创建的集成
3. 复制数据库ID（从URL中获取）：

```
https://www.notion.so/your-workspace/1234567890abcdef1234567890abcdef?v=...
                                  ↑
                              数据库ID
```

### 3. 配置环境变量

在`.env.local`文件中设置：

```
DATA_SOURCE=notion-api
NOTION_API_KEY=secret_your_api_key_here
NOTION_DATABASE_ID=1234567890abcdef1234567890abcdef
```

## 测试Notion集成

你可以使用以下命令测试Notion集成是否正常工作：

```bash
# 测试公共Notion页面
node src/scripts/test-notion-client.mjs [Notion页面URL或ID]

# 测试Notion官方API (如果已配置)
node src/scripts/test-notion-api.mjs
```

## 自定义Notion数据解析

如果需要自定义Notion数据的解析方式，可以修改以下文件：

- `src/lib/notion-client-api.mjs`：公共Notion页面数据获取与解析
- `src/lib/notion-api.ts`：Notion官方API数据获取与解析

## 注意事项

- 公共Notion页面方式使用非官方API，功能可能会随Notion更新而变化
- 官方API方式需要服务器端渲染，因为API密钥不应该在客户端公开
- 确保Notion页面和数据库的结构符合预期，以便正确解析数据 
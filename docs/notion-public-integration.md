# 公开Notion页面集成指南

## 概述

本文档详细描述了如何集成已发布（公开）的Notion页面到"优雅博客"中，无需使用API密钥。这种方式适用于那些已经将Notion页面设置为"分享到网络"的用户。

## 公开页面集成优势

- **无需API密钥** - 不需要申请Notion API密钥或创建集成
- **更简单的设置** - 减少配置步骤
- **适用于个人博客** - 非常适合个人博客使用场景
- **实时更新** - 当Notion内容更新时，博客内容也会更新

## 先决条件

1. **已公开发布的Notion页面** - 确保您的Notion页面已设置为"分享到网络"
2. **页面ID** - 需要知道Notion页面的ID（通常在URL中，例如`https://www.notion.so/1bd00c01c1608010ae44f4305a2be2db`）

## 实现步骤

### 1. 设置公开访问

确保您的Notion页面或数据库已公开发布：

1. 打开Notion页面
2. 点击右上角的"分享"按钮
3. 开启"分享到网络"选项
4. 复制公开链接（我们需要从中提取页面ID）

### 2. 配置项目

1. 在`src/lib/notion-content.ts`中设置您的Notion页面ID：

```typescript
// Notion页面ID - 设置为您的公开页面ID
const NOTION_PAGE_ID = process.env.NOTION_PUBLIC_PAGE_ID || '';
```

2. 设置环境变量选择公开Notion页面作为数据源：

```
# .env.local
DATA_SOURCE=public-notion
```

### 3. 实现说明

本项目已实现从公开Notion页面获取内容的功能，主要包括以下文件：

- `src/lib/notion-public.ts` - 用于获取公开Notion页面内容的基础函数
- `src/lib/notion-content.ts` - 用于从Notion页面数据中提取和处理博客文章内容
- `src/tests/notion-public.test.ts` - 测试公开Notion页面访问的测试脚本

### 4. 测试集成

使用内置测试脚本验证公开Notion页面访问：

```bash
# 编译测试脚本
npx tsc src/scripts/test-notion.ts

# 运行测试脚本
node src/scripts/test-notion.js
```

## 工作原理

公开Notion页面集成的工作原理如下：

1. 通过网络请求获取公开Notion页面的HTML内容
2. 从HTML内容中提取嵌入的JSON数据（Notion将页面数据存储在`window.__REDUX_STATE__`变量中）
3. 解析JSON数据，提取出博客文章内容
4. 将Notion数据转换为博客文章格式

## 限制和注意事项

使用公开页面方式相比API集成有一些限制：

1. **仅支持公开内容** - 无法访问私有或受限内容
2. **有限的数据操作** - 只能读取数据，不能创建或修改
3. **页面结构变化风险** - 如果Notion更改其页面结构或数据格式，集成可能会失效
4. **数据提取复杂性** - 提取和解析HTML比使用API更复杂，可能需要更频繁的维护

## 数据模型映射

公开Notion页面的内容会被映射到以下博客数据结构：

| 博客字段 | Notion数据来源 | 备注 |
|---------|---------------|------|
| title | 块属性 `properties.title` | 页面标题 |
| slug | 块ID | 用作唯一标识符 |
| date | 块属性 `created_time` | 创建日期 |
| excerpt | 第一个文本块内容 | 自动提取 |
| content | 所有子块内容 | 转换为Markdown |
| coverImage | 块属性 `format.page_cover` | 页面封面图 |
| tags | 自定义提取 | 需根据页面结构调整 |
| category | 自定义提取 | 需根据页面结构调整 |

## 故障排除

### 无法获取页面内容

- 确认页面已设置为公开访问
- 验证页面ID是否正确
- 检查网络连接和CORS设置

### 数据提取不完整

- Notion页面结构可能已更改
- 检查HTML和JSON结构是否符合预期
- 调整数据提取逻辑以适应新的页面结构

### 内容格式不正确

- 检查块类型到Markdown的转换逻辑
- 针对特定的Notion块类型添加自定义处理

## 从API集成迁移

如果您之前使用的是API集成，迁移到公开页面集成需要：

1. 将Notion页面设置为公开
2. 更新`DATA_SOURCE`环境变量为`public-notion`
3. 可以移除`NOTION_API_KEY`和`NOTION_DATABASE_ID`环境变量
4. 设置正确的页面ID

## 从公开页面迁移到API集成

如果您需要更多功能，可以考虑从公开页面集成迁移到API集成：

1. 申请Notion API密钥
2. 设置Notion集成和数据库权限
3. 配置必要的环境变量
4. 更新`DATA_SOURCE`环境变量为`notion`

## 总结

公开Notion页面集成提供了一种无需API密钥即可从Notion获取内容的简便方法，特别适合个人博客和小型项目。虽然它有一些限制，但对于大多数博客用例来说已经足够了。 
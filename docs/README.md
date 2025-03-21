# 优雅博客 - 文档

本目录包含与优雅博客项目相关的文档。

## Notion集成

优雅博客支持从Notion获取内容的两种方式：

### 1. 使用Notion API（需要API密钥）

详细文档请参阅：[Notion API 集成指南](./notion-integration.md)

这种方式：
- 需要Notion API密钥
- 支持完整的API功能
- 可以访问私有内容
- 适合需要高度自定义和完整功能的用户

### 2. 使用公开Notion页面（无需API密钥）

详细文档请参阅：[公开Notion页面集成指南](./notion-public-integration.md)

这种方式：
- 无需API密钥
- 只能访问已发布的公开页面
- 设置更简单
- 适合个人博客和简单应用场景

## 快速开始

### 选择集成方式

1. **使用Notion API**：
   ```
   # .env.local
   NOTION_API_KEY=your_api_key_here
   NOTION_DATABASE_ID=your_database_id_here
   DATA_SOURCE=notion
   ```

2. **使用公开Notion页面**：
   ```
   # .env.local
   DATA_SOURCE=public-notion
   ```
   然后在 `src/lib/notion-content.ts` 中设置您的页面ID。

### 测试集成

使用以下命令测试Notion集成：

```bash
npm run test:notion
```

## 配置参考

| 环境变量 | 描述 | 是否必需 |
|---------|------|---------|
| `DATA_SOURCE` | 数据源类型：'local', 'notion', 'public-notion' | 是 |
| `NOTION_API_KEY` | Notion API密钥 | 仅API集成需要 |
| `NOTION_DATABASE_ID` | Notion数据库ID | 仅API集成需要 |

## 问题排查

如遇到问题，请参阅各集成方式的文档中的"故障排除"部分。 
# 随记广场

一个使用纯 HTML、CSS 和 JavaScript 实现的最小可用微博/推特类单页应用，零外部依赖（无框架、无库、无 CDN）。

## 功能

- **发布区**：文本输入 + 发布按钮，支持 Ctrl/Cmd+Enter 快捷发布，空内容（含纯空格）不可发布
- **动态列表**：按发布时间倒序展示，每条动态显示内容与中文格式的发布时间
- **本地持久化**：基于 Local Storage 保存数据，刷新页面或重新打开浏览器后内容仍然可见
- **健壮性**：存储损坏时自动回退为空列表；Local Storage 不可用（如隐私模式）时降级为仅内存展示

## 如何使用

无需安装任何依赖，直接用浏览器打开 `index.html` 即可；或启动任意静态服务器，例如：

```bash
python -m http.server 8123
# 然后访问 http://localhost:8123/index.html
```

## 目录结构

```
├── index.html      # 页面结构
├── css/style.css   # 样式（简洁卡片式风格）
├── js/app.js       # 核心逻辑（存储、发布、倒序渲染）
└── .gitignore
```

## 技术说明

- 数据模型：`{ id, content, createdAt }`，存储于 Local Storage（key: `mini-feed-posts`）
- 动态内容通过 `textContent` 插入 DOM，防止 XSS
- 界面与图标均为原创，不含任何第三方品牌 logo

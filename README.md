# 随记广场

一个微博/推特风格的迷你动态分享应用，使用 **Node.js + Vue 3 + Pinia** 实现，数据依旧保存在浏览器 **Local Storage** 中。

项目采用 **TDD（测试驱动开发）** 方式从原生版本重写：先写测试（红）→ 再写实现（绿）→ 最后重构。

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 运行时 | Node.js ≥ 20 |
| 框架 | Vue 3.5（`<script setup>` 组合式 API） |
| 状态管理 | Pinia |
| 构建工具 | Vite |
| 测试 | Vitest + @vue/test-utils + happy-dom |

## 快速开始

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器（默认 http://localhost:5173）
npm test         # 运行全部测试（59 个用例）
npm run build    # 生产构建，产物在 dist/
npm run preview  # 预览生产构建
```

## 功能

- **发布动态**：文本输入 + 发布按钮；支持 `Ctrl/Cmd + Enter` 快捷发布；空白内容与超长（>500 字）内容不可发布
- **动态列表**：按发布时间倒序展示，每条显示内容与中文格式时间
- **本地持久化**：数据写入 Local Storage（key：`mini-feed-posts`），刷新或重开浏览器后依然存在
- **健壮性**：存储内容损坏时自动回退为空列表；存储不可用（隐私模式/配额耗尽）时降级为仅内存展示并提示
- **安全**：动态内容通过模板插值渲染，等价于 `textContent`，天然防 XSS

## 目录结构

```
├── index.html                    # Vite 入口 HTML
├── vite.config.js                # 构建配置（含 @ 别名、相对 base）
├── vitest.config.js              # 测试配置（happy-dom 环境）
├── src/
│   ├── main.js                   # 应用入口，注册 Pinia
│   ├── App.vue                   # 页面骨架：页头 + 发布区 + 列表
│   ├── assets/base.css           # 设计变量、基础样式、动画
│   ├── lib/
│   │   ├── constants.js          # STORAGE_KEY、MAX_CONTENT_LENGTH
│   │   ├── id.js                 # 动态 ID 生成（时间戳 + 序号，防重复）
│   │   ├── time.js               # 时间格式化 / datetime 属性
│   │   └── storage.js            # Local Storage 适配层（序列化、脏数据清洗、降级）
│   ├── stores/posts.js           # Pinia store：加载、倒序视图、发布、错误提示
│   └── components/
│       ├── AppHeader.vue
│       ├── PostComposer.vue
│       ├── PostList.vue
│       └── PostItem.vue
├── tests/
│   ├── unit/                     # time / id / storage / posts.store
│   ├── components/               # AppHeader / PostComposer / PostList / PostItem
│   └── App.spec.js               # 集成测试：首屏、发布、持久化、降级
└── legacy/                       # 旧的原生 HTML/CSS/JS 版本（仅作对照保留）
```

## TDD 实践

测试按「由内到外」的顺序推进，每一步都先红后绿：

1. **纯函数层**（`tests/unit/time.spec.js`、`id.spec.js`、`storage.spec.js`）
   覆盖时间格式、ID 唯一性、JSON 损坏、非数组结构、脏数据过滤、存储抛异常等边界。
2. **状态层**（`tests/unit/posts.store.spec.js`）
   覆盖初始状态、加载、重复加载幂等、倒序计算属性不改原数组、trim、空内容/超长拒绝、写入失败降级。
3. **组件层**（`tests/components/*.spec.js`）
   覆盖按钮禁用态、点击/快捷键发布、错误提示与消失、纯文本渲染防 XSS、空状态切换。
4. **集成层**（`tests/App.spec.js`）
   覆盖首屏渲染、倒序展示、发布后置顶并落库、重新挂载后数据仍在、存储不可用时的降级提示。

```bash
npm test          # 单次运行
npm run test:watch # 监听模式，TDD 循环
```

## 数据模型

```js
{
  id: 'lz3k9a-b7x001',   // 36 进制时间戳 + 6 位后缀
  content: '文本内容',
  createdAt: 1700000000000 // 毫秒时间戳
}
```

存储读写集中在 `src/lib/storage.js`：

- 读取失败、非数组、单条结构不合法 → 过滤或回退为空数组，绝不抛错
- 写入失败 → 返回 `false`，由 store 决定降级策略（保留内存数据 + 提示用户）
- 缺少 `id` 的历史数据会自动补齐，兼容旧版 `mini-feed-posts` 数据

## 旧版本

`legacy/` 目录保留了最初的零依赖原生实现（`legacy/index.html` + `legacy/css` + `legacy/js`），可直接用浏览器打开对照。

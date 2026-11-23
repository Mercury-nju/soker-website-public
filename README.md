# Soker 官网恢复版

按 2026-11-04 确认的方向恢复：保留 Synthetic Humans 的 3D 场景、滚动编排和响应式模型，替换为 Soker 的产品内容。

## 本地启动

需要 Node.js 22 或更新版本，无需安装依赖。

```sh
node server.mjs
```

打开 http://127.0.0.1:5180 。首页“申请内测”打开末尾招募页；流程说明中的产品入口进入现有本机工作区 http://127.0.0.1:5174/find 。工作区需另行保持运行。

更换端口或产品地址：

```sh
MARKETING_PORT=5180 SOKER_PRODUCT_URL=https://your-product.example.com node server.mjs
```

对外部署前把产品地址设为真实公开入口。此服务器仅监听本机；需要部署平台提供 HTTPS 与公开访问代理。静态托管时需要配置 `/product` 重定向至产品入口。线上版本地址见下方 Vercel production。

## 修改与重建

- `index.html`：可直接编辑的页面，保留原动画依赖的 ID/class。
- `soker.css`：中文排版、流程弹窗与可访问性适配。
- `soker.js`：键盘操作、弹窗焦点、菜单导航适配。
- `server.mjs`：独立预览、资源服务与可配置产品入口，不启动获客或发信任务。
- `_astro/`：恢复的原始样式与适配后的 WebGL 引擎。
- `assets/`：本地模型、纹理、字体及 Soker 图标。

## 恢复范围

这是从线上部署文件恢复的可运行工程，并非丢失的原始 Astro/Three.js 作者工程。公开 source map 已不存在，因此无法反推出原始模块、注释或构建配置。原动画引擎保留部署形态；页面、文案与适配代码可独立修改。

已移除原站 GTM、Partytown、第三方表单收集地址和旧产品背书。流程说明不收集联系资料；主按钮进入内测招募尾屏。内测申请表仅为视觉演示，不发送、保存或收集填写资料。招募尾屏可由 `/#beta` 直达，也会在原站最后一个场景末尾自动接续；支持返回产品介绍。当前宣传限于抖音公开需求发现及授权沟通，不承诺回复、成交或关闭电脑后的云端执行。

## Market prototype interactions

`soker-market.js` handles the phone-only recruitment form as a local visual preview. It contains no submission receiver or network request; entered information is not sent.

## Vercel production

Production: https://soker-website.vercel.app

Deploy only this directory: `vercel deploy --prod`. Static configuration excludes the local server and documentation; `/product` redirects to `/#beta`. The application remains preview-only.

## Guided playback

The presentation starts guided playback after a two-second pause, unless reduced motion is requested. Reading windows follow the actual content and mobile/desktop scene ranges: detailed scenes have about four seconds at full visibility, short statements about 2.5 seconds. Empty scenes and transitions advance at up to 30 scene frames per second, with smooth acceleration and deceleration. The closing statement slows before recruitment opens. A timeline simulation takes about 91 seconds from the opening to recruitment; actual time depends on rendering performance. Manual input, dialogs, backgrounding and recruitment pause playback. The top-right control resumes on demand.

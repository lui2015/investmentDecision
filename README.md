# 投资决策系统 (Investment Decision System)

> 把"拍脑袋"变成"填决策表"，把"我觉得"变成"我验证过"。

一套**结构化投资决策表工具**，融合巴菲特、芒格、格雷厄姆、段永平、霍华德·马克斯、达里奥、彼得·林奇、利弗莫尔等投资大师的核心理念，帮助用户在每一次投资决策前系统性审视关键信息。

## 核心功能

- **四类决策表**：股票(12板块) / 基金(12板块) / 债券(12板块) / 期货(12+1板块)
- **一票否决机制**：不通过则终止，期货最严(10项，不可反驳)
- **定性+定量分析**：8维度评分(40分) + 硬指标表格(30分)
- **估值/定价判断**：内置DCF/PEG/格雷厄姆/DDM/YTM计算器
- **风险清单**：先写风险再看收益 + 最坏情况推演
- **评分决策**：100分制量化评分 + 决策阈值
- **投后跟踪复盘**：持续记录 + 定期复盘问题引导
- **6种主题**：经典 / 赛博朋克 / 暗夜 / 自然森林 / 深海 / 暖阳

## 技术栈

- React + TypeScript + TailwindCSS v4
- Zustand (状态管理 + LocalStorage持久化)
- Vite (构建工具)
- React Router (路由)

## 线上访问

- 投资决策系统：**https://www.luliming.xyz/investmentDecision/**
- 全站 HTTPS，HTTP 自动 `301` 跳转

## 快速开始

```bash
cd frontend
npm install
npm run dev
```

## 项目结构

```
docs/                          # 需求文档 + 四份决策表模板
frontend/src/
  ├── types/                   # TypeScript 类型定义
  ├── data/templates.ts        # 四类决策表模板数据
  ├── store/                   # Zustand Store + 主题系统
  ├── pages/                   # 页面组件
  │   ├── HomePage.tsx         # 总览
  │   ├── SheetListPage.tsx    # 决策表列表管理
  │   ├── SheetEditor.tsx      # 决策表分步填写（核心）
  │   ├── ValuationPage.tsx    # 估值计算器
  │   └── KnowledgePage.tsx    # 知识库
  └── App.tsx                  # 顶部导航 + 主题切换
```

## 设计原则

> 先过滤，再评分；先看风险，再看收益；先定计划，再谈买卖。

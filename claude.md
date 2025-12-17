# 五险一金计算器项目 - 上下文管理中枢

## 项目概述

这是一个基于 Next.js 14 + Tailwind CSS + Supabase 构建的五险一金计算器 Web 应用，用于企业计算为员工缴纳的社保公积金费用。

### 技术栈
- **前端框架**: Next.js 14+ (App Router)
- **UI/样式**: Tailwind CSS
- **数据库/后端**: Supabase
- **Excel 解析**: xlsx (SheetJS)
- **类型系统**: TypeScript

---

## 项目目标

提供简单高效的五险一金计算工具：
1. 支持 Excel 文件上传（城市标准、员工工资）
2. 自动计算每位员工的缴费基数和公司应缴金额
3. 清晰展示计算结果
4. 支持数据重新上传和重新计算

---

## 数据结构

### 数据库表设计

#### cities（城市标准表）
```sql
- id: bigint (主键, 自增)
- city_name: text (城市名)
- year: integer (年份, 如 2024)
- rate: decimal(5, 4) (综合缴纳比例, 如 0.14)
- base_min: decimal(10, 2) (社保基数下限, 如 4546)
- base_max: decimal(10, 2) (社保基数上限, 如 26421)
- created_at: timestamptz (创建时间)
```

#### salaries（员工工资表）
```sql
- id: bigint (主键, 自增)
- employee_id: text (员工工号, 如 '0001')
- employee_name: text (员工姓名, 如 '张三')
- month: integer (年份月份, 格式 YYYYMM, 如 202401)
- salary_amount: decimal(10, 2) (工资金额, 如 30000)
- created_at: timestamptz (创建时间)
```

#### results（计算结果表）
```sql
- id: bigint (主键, 自增)
- employee_id: text (员工工号)
- employee_name: text (员工姓名)
- year: integer (年度)
- avg_salary: decimal(10, 2) (年度月平均工资)
- contribution_base: decimal(10, 2) (最终缴费基数)
- company_amount: decimal(10, 2) (公司缴纳金额)
- city_name: text (城市名)
- rate: decimal(5, 4) (费率)
- base_min: decimal(10, 2) (基数下限)
- base_max: decimal(10, 2) (基数上限)
- calculated_at: timestamptz (计算时间)
- unique constraint: (employee_id, year) (防止重复计算)
```

---

## 核心业务逻辑

### 计算流程
1. **数据获取**: 从 `salaries` 表读取所有工资数据
2. **分组计算**: 按 `employee_id` 分组，计算每位员工的年度月平均工资
3. **城市标准**: 从 `cities` 表获取佛山市的社保标准（固定查询城市名）
4. **基数确定**:
   - 平均工资 < base_min → 使用 base_min
   - 平均工资 > base_max → 使用 base_max
   - base_min ≤ 平均工资 ≤ base_max → 使用平均工资
5. **金额计算**: 公司应缴金额 = 最终缴费基数 × rate
6. **结果存储**: 存入 `results` 表（先清空，后插入）

### 数据清空策略
- **上传操作**: 每次上传都会清空对应表的全部数据，然后插入新数据
- **计算操作**: 清空 `results` 表，然后插入新的计算结果

---

## 前端页面结构

### 主页 `/`
- **功能**: 应用入口和导航中心
- **内容**:
  - 应用标题和描述
  - 两个功能卡片（数据上传、结果查询）
  - 点击卡片跳转到对应页面

### 上传页 `/upload`
- **功能**: 数据管理和计算触发
- **步骤**:
  1. 上传城市数据（cities.xlsx）
  2. 上传工资数据（salaries.xlsx）
  3. 执行计算并存储结果
- **特性**: 步骤指示器、文件验证、实时反馈

### 结果页 `/results`
- **功能**: 展示计算结果
- **内容**:
  - 统计信息（员工总数、公司应缴总计、平均缴费基数）
  - 详细结果表格
  - 刷新和重新计算按钮

---

## 文件结构

```
shebaojisuanwangzhan/
├── app/
│   ├── layout.tsx                      # 根布局（全局样式配置）
│   ├── page.tsx                        # 主页（导航卡片）
│   ├── globals.css                     # 全局样式（Tailwind CSS）
│   ├── upload/
│   │   └── page.tsx                    # 上传页（三步流程）
│   ├── results/
│   │   └── page.tsx                    # 结果展示页
│   └── api/
│       ├── upload/
│       │   ├── cities/route.ts         # 上传城市数据 API
│       │   └── salaries/route.ts       # 上传工资数据 API
│       ├── calculate/route.ts          # 执行计算 API
│       └── results/route.ts            # 获取结果 API
├── components/
│   ├── UploadButton.tsx                # 上传按钮组件
│   ├── ResultsTable.tsx                # 结果表格组件
│   └── LoadingSpinner.tsx              # 加载动画组件
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # 客户端配置（前端使用）
│   │   └── server.ts                   # 服务端配置（API 使用）
│   ├── excel/
│   │   └── parser.ts                   # Excel 解析核心逻辑
│   ├── calculator/
│   │   └── insurance.ts                # 保险计算引擎
│   └── types/
│       └── index.ts                    # TypeScript 类型定义
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # 数据库初始化脚本
├── .env.local.example                  # 环境变量示例
├── .gitignore                          # Git 忽略文件
├── package.json                        # 项目依赖
├── tsconfig.json                       # TypeScript 配置
├── tailwind.config.ts                  # Tailwind CSS 配置
├── postcss.config.js                   # PostCSS 配置
├── next.config.js                      # Next.js 配置
├── cities.xlsx                         # 城市数据示例
├── salaries.xlsx                       # 工资数据示例
└── claude.md                           # 本文档
```

---

## 关键实现细节

### Excel 解析处理

#### 列名映射
- **cities.xlsx**: 处理拼写错误 `city_namte` → `city_name`
- **salaries.xlsx**: 直接映射

#### 数据验证
- 必填字段检查
- 数据类型转换（字符串→数字）
- 文件类型和大小验证（限制 10MB）

### 计算逻辑实现

#### 分组算法
```typescript
// 按员工分组
function groupByEmployee(salaries: Salary[]): Record<string, Salary[]> {
  return salaries.reduce((acc, salary) => {
    const key = salary.employee_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(salary);
    return acc;
  }, {});
}
```

#### 基数限制逻辑
```typescript
// 确定缴费基数
let contributionBase = avgSalary;
if (avgSalary < city.base_min) {
  contributionBase = city.base_min;  // 使用下限
} else if (avgSalary > city.base_max) {
  contributionBase = city.base_max;  // 使用上限
}
```

### 错误处理策略

#### 服务端错误
- 文件格式错误提示
- 数据解析失败处理
- 数据库操作异常捕获

#### 前端错误
- 上传失败显示
- 加载状态管理
- 用户友好的错误提示

---

## 部署配置

### 环境变量
```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 数据库设置
1. 创建 Supabase 项目
2. 运行 `001_initial_schema.sql` 创建表结构
3. 配置 RLS（可选）
4. 插入示例城市数据

---

## 使用流程

### 首次使用
1. **环境准备**: 设置 Supabase，配置环境变量
2. **数据库初始化**: 运行迁移脚本
3. **启动应用**: `npm run dev`

### 日常使用
1. **上传城市数据**: cities.xlsx（包含佛山标准）
2. **上传工资数据**: salaries.xlsx（员工工资明细）
3. **执行计算**: 点击计算按钮
4. **查看结果**: 在结果页面查看详细信息

---

## 预期计算结果

基于示例数据：
- **张三**: 月平均 30,000 → 缴费基数 26,421（上限）→ 公司应缴 3,698.94
- **李四**: 月平均 15,000 → 缴费基数 15,000 → 公司应缴 2,100.00
- **王五**: 月平均 4,000 → 缴费基数 4,546（下限）→ 公司应缴 636.44

**总计**: 6,435.38 元/月

---

## 开发状态

### 已完成功能
- ✅ 项目初始化和环境配置
- ✅ 数据库设计和迁移脚本
- ✅ Supabase 客户端配置
- ✅ Excel 文件解析工具
- ✅ 保险计算逻辑引擎
- ✅ 四个 API 端点实现
- ✅ 前端组件开发
- ✅ 三个页面完整实现
- ✅ 错误处理和用户反馈

### 待完成
- ⏳ Supabase 项目创建和配置（用户操作）
- ⏳ 端到端测试验证
- ⏳ 部署和上线

---

## API 端点

### 上传端点
- `POST /api/upload/cities` - 上传城市数据
- `POST /api/upload/salaries` - 上传工资数据
- `POST /api/calculate` - 执行计算
- `GET /api/results` - 获取计算结果

### 请求/响应格式
所有 API 统一返回格式：
```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}
```

---

## 注意事项

### 安全考虑
- 文件大小限制：10MB
- 文件类型验证：仅允许 .xlsx 和 .xls
- 数据验证：必需字段检查
- RLS 策略：根据需要设置访问权限

### 性能优化
- 批量数据库操作
- 索引优化查询
- 分页处理大数据量
- 客户端缓存

### 用户体验
- 加载状态提示
- 进度指示器
- 错误友好提示
- 响应式设计

---

*本文档作为项目开发的上下文参考，确保开发过程中的一致性和准确性。*
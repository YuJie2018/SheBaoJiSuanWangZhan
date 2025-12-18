# 五险一金计算器网站

一个基于 Next.js + Tailwind CSS + Supabase 构建的企业五险一金计算工具。

## 功能特性

- 📊 **Excel 文件上传**: 支持 cities.xlsx 和 salaries.xlsx 文件上传
- 🧮 **自动计算**: 根据城市标准自动计算员工缴费基数和公司应缴金额
- 📋 **结果展示**: 清晰的表格展示计算结果和统计信息
- 🔄 **数据管理**: 支持数据清空和重新计算
- 📱 **响应式设计**: 适配各种设备屏幕

## 技术栈

- **前端**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **Excel 解析**: SheetJS (xlsx)

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- Supabase 账号

### 1. 克隆项目

```bash
git clone https://github.com/YuJie2018/SheBaoJiSuanWangZhan.git
cd shebaojisuanwangzhan
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置 Supabase

1. 访问 [Supabase](https://supabase.com) 创建新项目
2. 在项目的 SQL 编辑器中运行以下迁移脚本：

```sql
-- 创建 cities 表
CREATE TABLE cities (
  id BIGSERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  rate DECIMAL(5, 4) NOT NULL,
  base_min DECIMAL(10, 2) NOT NULL,
  base_max DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 salaries 表
CREATE TABLE salaries (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month INTEGER NOT NULL,
  salary_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 results 表
CREATE TABLE results (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  avg_salary DECIMAL(10, 2) NOT NULL,
  contribution_base DECIMAL(10, 2) NOT NULL,
  company_amount DECIMAL(10, 2) NOT NULL,
  city_name TEXT NOT NULL,
  rate DECIMAL(5, 4) NOT NULL,
  base_min DECIMAL(10, 2) NOT NULL,
  base_max DECIMAL(10, 2) NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, year)
);

-- 创建索引
CREATE INDEX idx_salaries_employee ON salaries(employee_id);
CREATE INDEX idx_salaries_month ON salaries(month);
CREATE INDEX idx_results_employee ON results(employee_id);
CREATE INDEX idx_cities_year ON cities(year);
```

3. 插入示例城市数据：

```sql
INSERT INTO cities (city_name, year, rate, base_min, base_max) VALUES
('佛山', 2024, 0.14, 4546, 26421);
```

### 4. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填入你的 Supabase 配置：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 5. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用指南

### 1. 准备数据文件

#### cities.xlsx 格式
| city_namte | year | rate | base_min | base_max |
|-----------|------|------|----------|----------|
| 佛山 | 2024 | 0.14 | 4546 | 26421 |

**注意**: Excel 中的列名 `city_namte` 是拼写错误，系统会自动修正为 `city_name`。

#### salaries.xlsx 格式
| employee_id | employee_name | month | salary_amount |
|------------|---------------|-------|---------------|
| 0001 | 张三 | 202401 | 30000 |
| 0002 | 李四 | 202401 | 15000 |

### 2. 上传数据

1. 访问 **数据上传** 页面
2. 按顺序上传：
   - 城市数据文件 (cities.xlsx)
   - 工资数据文件 (salaries.xlsx)
3. 点击 **开始计算** 执行计算

### 3. 查看结果

计算完成后，访问 **结果查询** 页面查看：
- 员工详细信息
- 缴费基数和金额
- 统计汇总

## 项目结构

```
shebaojisuanwangzhan/
├── app/                    # Next.js 应用目录
│   ├── api/               # API 路由
│   ├── upload/            # 上传页面
│   └── results/           # 结果页面
├── components/            # React 组件
├── lib/                   # 工具库
│   ├── supabase/         # Supabase 配置
│   ├── excel/            # Excel 解析
│   └── calculator/       # 计算逻辑
└── supabase/             # 数据库脚本
```

## 计算逻辑

1. **分组计算**: 按员工 ID 分组计算年度月平均工资
2. **基数确定**: 根据城市标准确定缴费基数
   - 低于下限：使用下限值
   - 高于上限：使用上限值
   - 区间内：使用实际平均工资
3. **金额计算**: 公司应缴 = 缴费基数 × 缴费比例

## 开发

### 可用脚本

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # 运行 ESLint
```

### 环境变量

开发时需要设置以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 服务角色密钥

## 部署

### Vercel (推荐)

#### 1. 连接 GitHub 仓库
1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入 GitHub 仓库：`https://github.com/YuJie2018/SheBaoJiSuanWangZhan.git`
4. 选择 Next.js 框架（Vercel 会自动检测）

#### 2. 设置环境变量
在 Vercel 项目设置中添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase 项目 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase 匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase 服务角色密钥
```

**获取环境变量值：**
1. 在 Supabase Dashboard 中，进入 Settings → API
2. 复制 Project URL 作为 `NEXT_PUBLIC_SUPABASE_URL`
3. 复制 public API key 作为 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 复制 service_role key 作为 `SUPABASE_SERVICE_ROLE_KEY`

#### 3. 部署验证
1. 点击 "Deploy" 开始部署
2. 部署完成后访问提供的 URL
3. 如果看到配置提示，说明环境变量未正确设置，请检查环境变量配置

#### 4. 配置 Supabase 数据库
如果这是首次部署，需要在 Supabase 中创建数据库表：

1. 进入 Supabase Dashboard → SQL Editor
2. 运行以下 SQL 脚本：

```sql
-- 创建 cities 表
CREATE TABLE cities (
  id BIGSERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  rate DECIMAL(5, 4) NOT NULL,
  base_min DECIMAL(10, 2) NOT NULL,
  base_max DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 salaries 表
CREATE TABLE salaries (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month INTEGER NOT NULL,
  salary_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 results 表
CREATE TABLE results (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  avg_salary DECIMAL(10, 2) NOT NULL,
  contribution_base DECIMAL(10, 2) NOT NULL,
  company_amount DECIMAL(10, 2) NOT NULL,
  city_name TEXT NOT NULL,
  rate DECIMAL(5, 4) NOT NULL,
  base_min DECIMAL(10, 2) NOT NULL,
  base_max DECIMAL(10, 2) NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, year)
);

-- 创建索引
CREATE INDEX idx_salaries_employee ON salaries(employee_id);
CREATE INDEX idx_salaries_month ON salaries(month);
CREATE INDEX idx_results_employee ON results(employee_id);
CREATE INDEX idx_cities_year ON cities(year);

-- 插入示例城市数据
INSERT INTO cities (city_name, year, rate, base_min, base_max) VALUES
('佛山', 2024, 0.14, 4546, 26421);
```

### 其他平台

```bash
npm run build
npm run start
```

### 环境变量配置故障排除

如果应用显示配置错误提示，请检查：

1. **环境变量名称**：确保拼写完全正确
2. **环境变量值**：确保没有多余的空格或换行符
3. **Vercel 重新部署**：修改环境变量后需要触发重新部署
4. **Supabase 项目状态**：确保 Supabase 项目处于活跃状态

### 部署后的配置验证

部署完成后，访问应用并检查：

1. ✅ 应用正常加载，不显示配置错误
2. ✅ 能够访问数据上传页面
3. ✅ 能够上传 Excel 文件（使用提供的示例文件）
4. ✅ 能够执行计算并查看结果

## 注意事项

- 每次上传都会清空对应表的全部数据
- 文件大小限制为 10MB
- 仅支持 .xlsx 和 .xls 格式
- 计算结果会覆盖之前的结果

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

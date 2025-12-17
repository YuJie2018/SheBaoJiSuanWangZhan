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
  UNIQUE(employee_id, year) -- 防止重复计算
);

-- 创建索引优化查询性能
CREATE INDEX idx_salaries_employee ON salaries(employee_id);
CREATE INDEX idx_salaries_month ON salaries(month);
CREATE INDEX idx_results_employee ON results(employee_id);
CREATE INDEX idx_cities_year ON cities(year);

-- 插入示例数据（城市标准）
INSERT INTO cities (city_name, year, rate, base_min, base_max) VALUES
('佛山', 2024, 0.14, 4546, 26421);

-- 启用 RLS（如果需要）
-- ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- RLS 策略示例（如果不使用认证）
-- CREATE POLICY "Enable all for anon" ON cities FOR ALL TO anon USING (true);
-- CREATE POLICY "Enable all for anon" ON salaries FOR ALL TO anon USING (true);
-- CREATE POLICY "Enable all for anon" ON results FOR ALL TO anon USING (true);
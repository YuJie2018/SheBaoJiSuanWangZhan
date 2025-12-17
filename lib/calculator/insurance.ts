import { City, Salary, Result } from '@/lib/types';

/**
 * 计算五险一金
 * @param salaries 工资数据
 * @param city 城市数据
 */
export function calculateInsurance(
  salaries: Salary[],
  city: City
): Result[] {
  // 1. 按员工分组
  const groupedByEmployee = groupByEmployee(salaries);

  // 2. 计算每个员工的保险
  const results: Result[] = [];

  for (const [employeeId, employeeSalaries] of Object.entries(groupedByEmployee)) {
    const result = calculateEmployeeInsurance(employeeSalaries, city);
    results.push(result);
  }

  return results;
}

/**
 * 按员工分组
 */
function groupByEmployee(salaries: Salary[]): Record<string, Salary[]> {
  return salaries.reduce((acc, salary) => {
    const key = salary.employee_id;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(salary);
    return acc;
  }, {} as Record<string, Salary[]>);
}

/**
 * 计算单个员工的保险
 */
function calculateEmployeeInsurance(
  salaries: Salary[],
  city: City
): Result {
  // 1. 计算年度月平均工资
  const totalSalary = salaries.reduce((sum, s) => sum + s.salary_amount, 0);
  const avgSalary = totalSalary / salaries.length;

  // 2. 确定缴费基数（考虑上下限）
  let contributionBase = avgSalary;
  if (avgSalary < city.base_min) {
    contributionBase = city.base_min;
  } else if (avgSalary > city.base_max) {
    contributionBase = city.base_max;
  }

  // 3. 计算公司应缴金额
  const companyAmount = contributionBase * city.rate;

  // 4. 提取年份（从月份字段）
  const year = Math.floor(salaries[0].month / 100);

  return {
    employee_id: salaries[0].employee_id,
    employee_name: salaries[0].employee_name,
    year,
    avg_salary: parseFloat(avgSalary.toFixed(2)),
    contribution_base: parseFloat(contributionBase.toFixed(2)),
    company_amount: parseFloat(companyAmount.toFixed(2)),
    city_name: city.city_name,
    rate: city.rate,
    base_min: city.base_min,
    base_max: city.base_max,
  };
}
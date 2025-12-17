import * as XLSX from 'xlsx';
import { City, Salary } from '@/lib/types';

/**
 * 列名映射 - 处理拼写错误
 */
const COLUMN_MAPPING: Record<string, Record<string, string>> = {
  cities: {
    'city_namte ': 'city_name',  // 修正拼写错误和空格
    'city_namte': 'city_name',
  },
  salaries: {},
};

/**
 * 解析 Excel 文件
 * @param buffer 文件 ArrayBuffer
 * @param type 文件类型 ('cities' | 'salaries')
 */
export async function parseExcelFile(
  buffer: ArrayBuffer,
  type: 'cities' | 'salaries'
): Promise<City[] | Salary[]> {
  try {
    // 读取工作簿
    const workbook = XLSX.read(buffer, { type: 'array' });

    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 转换为 JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,  // 保持文本格式
      defval: null, // 空值设为 null
    });

    if (rawData.length === 0) {
      throw new Error('文件为空');
    }

    // 应用列名映射和数据转换
    const mapping = COLUMN_MAPPING[type];
    const cleanedData = rawData.map((row: any) => {
      const cleanRow: any = {};

      Object.keys(row).forEach(key => {
        // 处理列名映射
        const mappedKey = mapping[key] || key;
        const cleanKey = mappedKey.trim();
        cleanRow[cleanKey] = row[key];
      });

      return cleanRow;
    });

    // 类型转换和验证
    if (type === 'cities') {
      return cleanedData.map(validateCity);
    } else {
      return cleanedData.map(validateSalary);
    }

  } catch (error) {
    throw new Error(`Excel 解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 验证并转换城市数据
 */
function validateCity(row: any): City {
  const required = ['city_name', 'year', 'rate', 'base_min', 'base_max'];
  const missing = required.filter(field => row[field] === undefined || row[field] === null || row[field] === '');

  if (missing.length > 0) {
    throw new Error(`缺少必需字段: ${missing.join(', ')}`);
  }

  return {
    city_name: String(row.city_name).trim(),
    year: parseInt(row.year, 10),
    rate: parseFloat(row.rate),
    base_min: parseFloat(row.base_min),
    base_max: parseFloat(row.base_max),
  };
}

/**
 * 验证并转换工资数据
 */
function validateSalary(row: any): Salary {
  const required = ['employee_id', 'employee_name', 'month', 'salary_amount'];
  const missing = required.filter(field => row[field] === undefined || row[field] === null || row[field] === '');

  if (missing.length > 0) {
    throw new Error(`缺少必需字段: ${missing.join(', ')}`);
  }

  return {
    employee_id: String(row.employee_id).trim(),
    employee_name: String(row.employee_name).trim(),
    month: parseInt(row.month, 10),
    salary_amount: parseFloat(row.salary_amount),
  };
}
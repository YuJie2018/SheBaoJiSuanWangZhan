export interface City {
  id?: number;
  city_name: string;
  year: number;
  rate: number;
  base_min: number;
  base_max: number;
  created_at?: string;
}

export interface Salary {
  id?: number;
  employee_id: string;
  employee_name: string;
  month: number;
  salary_amount: number;
  created_at?: string;
}

export interface Result {
  id?: number;
  employee_id: string;
  employee_name: string;
  year: number;
  avg_salary: number;
  contribution_base: number;
  company_amount: number;
  city_name: string;
  rate: number;
  base_min: number;
  base_max: number;
  calculated_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  requiresSetup?: boolean;
  missingVars?: string[];
}

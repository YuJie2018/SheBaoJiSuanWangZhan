import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getEnvConfig } from '@/lib/env';
import { calculateInsurance } from '@/lib/calculator/insurance';
import { ApiResponse, Result } from '@/lib/types';

export async function POST() {
  try {
    // 检查环境变量配置
    const envConfig = getEnvConfig();
    if (!envConfig.isConfigured) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        requiresSetup: true,
        missingVars: envConfig.missingVars,
      } as ApiResponse, { status: 503 });
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create database client',
        requiresSetup: true,
      } as ApiResponse, { status: 503 });
    }

    // 1. 获取工资数据
    const { data: salaries, error: salaryError } = await supabase
      .from('salaries')
      .select('*');

    if (salaryError) throw new Error(`获取工资数据失败: ${salaryError.message}`);
    if (!salaries || salaries.length === 0) {
      return NextResponse.json(
        { success: false, error: '未找到工资数据，请先上传' } as ApiResponse,
        { status: 400 }
      );
    }

    // 2. 获取城市数据（佛山）
    const { data: cities, error: cityError } = await supabase
      .from('cities')
      .select('*')
      .eq('city_name', '佛山')
      .limit(1)
      .single();

    if (cityError) throw new Error(`获取城市数据失败: ${cityError.message}`);
    if (!cities) {
      return NextResponse.json(
        { success: false, error: '未找到佛山的城市数据，请先上传城市数据' } as ApiResponse,
        { status: 400 }
      );
    }

    // 3. 执行计算
    const results = calculateInsurance(salaries, cities);

    // 4. 清空旧结果并插入新结果
    await supabase.from('results').delete().neq('id', 0);

    const { error: insertError } = await supabase
      .from('results')
      .insert(results);

    if (insertError) {
      throw new Error(`保存计算结果失败: ${insertError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `成功计算 ${results.length} 名员工的保险数据`,
      data: results,
    } as ApiResponse<Result[]>);

  } catch (error) {
    console.error('计算保险错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '计算失败'
      } as ApiResponse,
      { status: 500 }
    );
  }
}
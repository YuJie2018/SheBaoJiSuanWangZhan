import { NextRequest, NextResponse } from 'next/server';
import { parseExcelFile } from '@/lib/excel/parser';
import { createServerClient } from '@/lib/supabase/server';
import { getEnvConfig } from '@/lib/env';
import { ApiResponse } from '@/lib/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
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
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '未找到文件' } as ApiResponse,
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: '文件大小超过 10MB' } as ApiResponse,
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, error: '请选择 Excel 文件（.xlsx 或 .xls）' } as ApiResponse,
        { status: 400 }
      );
    }

    // 解析 Excel
    const buffer = await file.arrayBuffer();
    const data = await parseExcelFile(buffer, 'cities');

    if (data.length === 0) {
      return NextResponse.json(
        { success: false, error: '文件为空或格式错误' } as ApiResponse,
        { status: 400 }
      );
    }

    // 插入数据库
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create database client',
        requiresSetup: true,
      } as ApiResponse, { status: 503 });
    }

    // 先清空表
    const { error: deleteError } = await supabase
      .from('cities')
      .delete()
      .neq('id', 0); // 删除所有记录

    if (deleteError) {
      throw new Error(`删除旧数据失败: ${deleteError.message}`);
    }

    // 批量插入
    const { error: insertError } = await supabase
      .from('cities')
      .insert(data);

    if (insertError) {
      throw new Error(`插入数据失败: ${insertError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `成功上传 ${data.length} 条城市数据`,
      count: data.length,
    } as ApiResponse);

  } catch (error) {
    console.error('上传城市数据错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      } as ApiResponse,
      { status: 500 }
    );
  }
}
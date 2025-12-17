import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { ApiResponse, Result } from '@/lib/types';

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('employee_id', { ascending: true });

    if (error) {
      throw new Error(`获取结果失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    } as ApiResponse<Result[]>);

  } catch (error) {
    console.error('获取结果错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取失败'
      } as ApiResponse,
      { status: 500 }
    );
  }
}
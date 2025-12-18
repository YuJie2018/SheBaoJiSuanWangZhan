'use client';

import React from 'react';
import { getEnvConfig } from '../lib/env';

interface ConfigurationStatusProps {
  showSetupGuide?: boolean;
  className?: string;
}

export default function ConfigurationStatus({
  showSetupGuide = true,
  className = ''
}: ConfigurationStatusProps) {
  const envConfig = getEnvConfig();

  if (envConfig.isConfigured) {
    return null;
  }

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-6 ${className}`}>
      <div className="max-w-4xl mx-auto">
        {/* 状态标题 */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-amber-800">
              需要配置 Supabase 数据库
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              检测到缺少以下环境变量：{envConfig.missingVars.join(', ')}
            </p>
          </div>
        </div>

        {/* 配置指导 */}
        {showSetupGuide && (
          <div className="mt-6 bg-white bg-opacity-50 rounded-lg p-4">
            <h4 className="text-base font-semibold text-amber-900 mb-4">
              配置步骤：
            </h4>

            <ol className="list-decimal list-inside space-y-3 text-sm text-amber-800">
              <li>
                <strong>创建 Supabase 项目</strong>
                <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-amber-700">
                  <li>访问 <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a> 创建新项目</li>
                  <li>选择你的组织或创建新组织</li>
                  <li>设置项目名称和数据库密码</li>
                  <li>选择离你最近的区域</li>
                </ul>
              </li>

              <li>
                <strong>获取项目配置信息</strong>
                <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-amber-700">
                  <li>在项目仪表板中，点击 Settings → API</li>
                  <li>复制 Project URL 和 anon public key</li>
                  <li>在 Database → Settings 中获取 service_role key</li>
                </ul>
              </li>

              <li>
                <strong>创建数据库表</strong>
                <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-amber-700">
                  <li>在项目仪表板中，点击 SQL Editor</li>
                  <li>创建以下表结构：
                    <pre className="mt-2 p-2 bg-amber-100 rounded text-xs overflow-x-auto">
{`-- 创建 cities 表
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
);`}
                    </pre>
                  </li>
                </ul>
              </li>

              <li>
                <strong>配置环境变量</strong>
                <div className="mt-2 p-3 bg-amber-100 rounded">
                  <p className="font-mono text-xs text-amber-900 mb-2">
                    对于本地开发，创建 <code>.env.local</code> 文件：
                  </p>
                  <pre className="font-mono text-xs text-amber-900 whitespace-pre">
{`NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
SUPABASE_SERVICE_ROLE_KEY=你的service_role密钥`}
                  </pre>
                  <p className="font-mono text-xs text-amber-900 mt-3">
                    对于 Vercel 部署，在 Vercel Dashboard → Settings → Environment Variables 中添加相同的环境变量
                  </p>
                </div>
              </li>
            </ol>

            <div className="mt-4 p-3 bg-amber-200 rounded">
              <p className="text-xs text-amber-900">
                <strong>提示：</strong>配置完成后，重新启动开发服务器或重新部署应用即可。
              </p>
            </div>
          </div>
        )}

        {/* 功能限制提示 */}
        <div className="mt-4 text-sm text-amber-700">
          <p>
            在完成配置之前，以下功能将不可用：
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-amber-600">
            <li>Excel 文件上传和数据存储</li>
            <li>五险一金计算功能</li>
            <li>计算结果查询和展示</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ConfigurationBanner() {
  return (
    <ConfigurationStatus
      showSetupGuide={false}
      className="mb-6"
    />
  );
}
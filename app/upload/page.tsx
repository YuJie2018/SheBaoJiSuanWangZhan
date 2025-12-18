'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UploadCard, { CardStatus } from '@/components/UploadCard';
import ProgressIndicator, { StepStatus } from '@/components/ProgressIndicator';
import ConfigurationStatus from '@/components/ConfigurationStatus';
import { getEnvConfig } from '@/lib/env';

export default function UploadPage() {
  const router = useRouter();
  const [citiesUploaded, setCitiesUploaded] = useState(false);
  const [salariesUploaded, setSalariesUploaded] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [citiesStatus, setCitiesStatus] = useState<CardStatus>('pending');
  const [salariesStatus, setSalariesStatus] = useState<CardStatus>('pending');
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    const envConfig = getEnvConfig();
    setIsConfigured(envConfig.isConfigured);
  }, []);

  const handleCalculate = async () => {
    if (!citiesUploaded || !salariesUploaded) {
      setError('请先上传城市数据和工资数据');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '计算失败');
      }

      alert(result.message);
      router.push('/results');

    } catch (err) {
      setError(err instanceof Error ? err.message : '计算失败');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCitiesUploadStart = () => {
    setCitiesStatus('uploading');
    setError(null);
  };

  const handleCitiesUploadSuccess = () => {
    setCitiesUploaded(true);
    setCitiesStatus('completed');
  };

  const handleCitiesUploadError = (errorMessage: string) => {
    setCitiesStatus('error');
    setError(errorMessage);
  };

  const handleSalariesUploadStart = () => {
    setSalariesStatus('uploading');
    setError(null);
  };

  const handleSalariesUploadSuccess = () => {
    setSalariesUploaded(true);
    setSalariesStatus('completed');
  };

  const handleSalariesUploadError = (errorMessage: string) => {
    setSalariesStatus('error');
    setError(errorMessage);
  };

  // 获取进度指示器状态
  const getProgressSteps = () => {
    const steps: Array<{ title: string; status: StepStatus }> = [
      { title: '城市数据', status: citiesUploaded ? 'completed' : citiesStatus === 'uploading' ? 'active' : 'pending' },
      { title: '工资数据', status: salariesUploaded ? 'completed' : salariesStatus === 'uploading' ? 'active' : citiesUploaded ? 'active' : 'pending' },
      { title: '执行计算', status: isCalculating ? 'active' : (citiesUploaded && salariesUploaded) ? 'active' : 'pending' }
    ];
    return steps;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 返回主页链接 */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            返回主页
          </Link>
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            数据上传与计算
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            上传城市标准和员工工资数据，自动计算五险一金缴费金额
          </p>
        </div>

        {/* 配置状态提示 */}
        {!isConfigured && (
          <div className="mb-8">
            <ConfigurationStatus showSetupGuide={true} />
          </div>
        )}

        {/* 进度指示器 */}
        <div className="mb-12">
          <ProgressIndicator steps={getProgressSteps()} />
        </div>

        {/* 卡片布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* 城市数据上传卡片 */}
          <UploadCard
            step={1}
            title="城市数据上传"
            description="上传包含城市社保标准的 Excel 文件"
            status={citiesStatus}
            endpoint="/api/upload/cities"
            onUploadSuccess={handleCitiesUploadSuccess}
            onUploadError={handleCitiesUploadError}
            buttonText="选择 cities.xlsx"
          />

          {/* 工资数据上传卡片 */}
          <UploadCard
            step={2}
            title="工资数据上传"
            description="上传包含员工工资明细的 Excel 文件"
            status={salariesStatus}
            endpoint="/api/upload/salaries"
            onUploadSuccess={handleSalariesUploadSuccess}
            onUploadError={handleSalariesUploadError}
            buttonText="选择 salaries.xlsx"
          />

          {/* 执行计算卡片 */}
          <UploadCard
            step={3}
            title="执行计算"
            description="基于上传的数据计算五险一金缴费金额"
            status={isCalculating ? 'uploading' : (citiesUploaded && salariesUploaded) ? 'completed' : 'pending'}
            isCalculating={isCalculating}
            onCalculate={handleCalculate}
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">错误提示</h3>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">使用说明</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">📄 文件格式要求</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 支持 Excel 文件（.xlsx, .xls）</li>
                    <li>• 文件大小限制：10MB</li>
                    <li>• 每次上传会清空原有数据</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">📊 数据字段说明</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 城市数据：城市名、年份、缴费比例、基数上下限</li>
                    <li>• 工资数据：员工工号、姓名、月份、工资金额</li>
                    <li>• 计算结果自动保存到数据库</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🚀 操作提示</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 可点击按钮选择文件</li>
                    <li>• 支持拖拽文件到上传区域</li>
                    <li>• 按步骤依次完成上传和计算</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">💡 计算规则</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 按员工计算年度月平均工资</li>
                    <li>• 根据城市标准确定缴费基数</li>
                    <li>• 自动应用基数上下限限制</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useRef, DragEvent } from 'react';
import UploadButton from './UploadButton';
import LoadingSpinner from './LoadingSpinner';

export type CardStatus = 'pending' | 'uploading' | 'completed' | 'error';

interface UploadCardProps {
  step: number;
  title: string;
  description: string;
  status: CardStatus;
  endpoint?: string;
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
  buttonText?: string;
  isCalculating?: boolean;
  onCalculate?: () => void;
}

export default function UploadCard({
  step,
  title,
  description,
  status,
  endpoint,
  onUploadSuccess,
  onUploadError,
  buttonText,
  isCalculating = false,
  onCalculate
}: UploadCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && endpoint) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!endpoint) return;

    // 验证文件类型
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      onUploadError?.('请选择 Excel 文件（.xlsx 或 .xls）');
      return;
    }

    // 验证文件大小
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      onUploadError?.('文件大小超过 10MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '上传失败');
      }

      onUploadSuccess?.();
      alert(result.message);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '上传失败';
      onUploadError?.(errorMessage);
    }
  };

  const getCardStyles = () => {
    const baseStyles = "relative bg-white rounded-xl shadow-md transition-all duration-300 border-2 overflow-hidden";

    if (isDragOver) {
      return `${baseStyles} border-blue-400 bg-blue-50 shadow-lg transform scale-[1.02]`;
    }

    switch (status) {
      case 'completed':
        return `${baseStyles} border-green-200 bg-green-50`;
      case 'uploading':
        return `${baseStyles} border-blue-200 bg-blue-50`;
      case 'error':
        return `${baseStyles} border-red-200 bg-red-50`;
      default:
        return `${baseStyles} border-gray-200 hover:border-gray-300 hover:shadow-lg`;
    }
  };

  const getIconStyles = () => {
    const baseStyles = "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg";

    switch (status) {
      case 'completed':
        return `${baseStyles} bg-green-500`;
      case 'uploading':
        return `${baseStyles} bg-blue-500`;
      case 'error':
        return `${baseStyles} bg-red-500`;
      default:
        return `${baseStyles} bg-gray-400`;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'uploading':
        return <LoadingSpinner />;
      case 'error':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return step;
    }
  };

  const isUploadCard = endpoint && !isCalculating;

  return (
    <div
      className={getCardStyles()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 拖拽覆盖层 */}
      {isDragOver && isUploadCard && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-90 flex items-center justify-center z-10">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-blue-600 font-medium">释放文件以上传</p>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={getIconStyles()}>
              {getStatusIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <p className="text-sm text-gray-600">
                {description}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            {status === 'completed' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                已完成
              </span>
            )}
            {status === 'uploading' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                上传中
              </span>
            )}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="space-y-4">
          {isUploadCard ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />

              <div className="space-y-3">
                {/* 点击上传按钮 */}
                <div>
                  <UploadButton
                    endpoint={endpoint}
                    onSuccess={onUploadSuccess}
                    onError={onUploadError}
                    label={buttonText || '选择文件'}
                  />
                </div>

                {/* 拖拽提示 */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    或将文件拖拽到此处
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    支持 .xlsx 和 .xls 格式，最大 10MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* 计算按钮 */
            <button
              onClick={onCalculate}
              disabled={status !== 'completed' || isCalculating}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg
                       hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                       transition-colors duration-200 font-medium text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isCalculating ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner />
                  <span className="ml-2">计算中...</span>
                </span>
              ) : (
                '开始计算'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
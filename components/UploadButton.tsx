'use client';

import { useState, useRef } from 'react';

interface UploadButtonProps {
  endpoint: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  label: string;
}

export default function UploadButton({
  endpoint,
  onSuccess,
  onError,
  label,
}: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      if (onError) onError('请选择 Excel 文件（.xlsx 或 .xls）');
      return;
    }

    setIsUploading(true);
    if (onError) onError(''); // 清空错误

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

      if (onSuccess) onSuccess();
      alert(result.message);

    } catch (err) {
      if (onError) onError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setIsUploading(false);
      // 重置文件选择器
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        id={`file-${endpoint}`}
      />
      <label
        htmlFor={`file-${endpoint}`}
        className={`inline-block px-6 py-3 border border-gray-300 rounded-lg
                   cursor-pointer transition-colors duration-200 font-medium text-sm
                   ${isUploading
                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                     : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
      >
        {isUploading ? '上传中...' : label}
      </label>
    </div>
  );
}
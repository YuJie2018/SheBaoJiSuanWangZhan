'use client';

import React from 'react';

export type StepStatus = 'pending' | 'active' | 'completed';

interface ProgressIndicatorProps {
  steps: Array<{
    title: string;
    status: StepStatus;
  }>;
}

export default function ProgressIndicator({ steps }: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => (
            <li
              key={index}
              className={`relative ${
                index !== steps.length - 1 ? 'flex-1' : ''
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                    ${step.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : step.status === 'active'
                      ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {step.status === 'completed' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`
                    ml-3 text-sm font-medium transition-colors duration-300
                    ${step.status === 'active'
                      ? 'text-blue-600'
                      : step.status === 'completed'
                      ? 'text-green-600'
                      : 'text-gray-500'
                    }
                  `}
                >
                  {step.title}
                </span>
              </div>

              {/* 连接线 */}
              {index !== steps.length - 1 && (
                <div className="absolute top-5 left-10 w-full h-0.5 -ml-px">
                  <div
                    className={`
                      h-full transition-all duration-500 ease-in-out
                      ${step.status === 'completed'
                        ? 'bg-green-500'
                        : step.status === 'active'
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                      }
                    `}
                    style={{
                      width: step.status === 'completed' || step.status === 'active' ? '100%' : '0%',
                      transitionDelay: step.status === 'completed' || step.status === 'active' ? '0.2s' : '0s'
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
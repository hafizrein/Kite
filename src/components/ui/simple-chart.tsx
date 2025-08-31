"use client";

import React from 'react';

interface SimpleChartProps {
  data: Array<{ month: string; desktop: number; mobile: number }>;
}

export function SimpleChart({ data }: SimpleChartProps) {
  const maxDesktop = Math.max(...data.map(d => d.desktop));
  const maxMobile = Math.max(...data.map(d => d.mobile));
  const maxValue = Math.max(maxDesktop, maxMobile);

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="text-xs font-medium">{item.month}</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-16 text-xs text-muted-foreground">Desktop</div>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="h-2 bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(item.desktop / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-12 text-xs text-right">{item.desktop}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 text-xs text-muted-foreground">Mobile</div>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="h-2 bg-chart-2 rounded-full transition-all duration-300"
                  style={{ width: `${(item.mobile / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-12 text-xs text-right">{item.mobile}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

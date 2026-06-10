'use client';

import { Pagination as AntPagination } from 'antd';

interface PaginationProps {
  current: number;
  total: number;
  pageSize?: number;
  onChange: (page: number) => void;
}

export default function Pagination({ current, total, pageSize = 10, onChange }: PaginationProps) {
  return (
    <AntPagination
      current={current}
      total={total}
      pageSize={pageSize}
      onChange={onChange}
      showSizeChanger={false}
    />
  );
}

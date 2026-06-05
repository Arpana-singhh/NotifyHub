interface PaginationProps {
  current: number;
  total: number;
}

export default function Pagination({ current, total }: PaginationProps) {
  return (
    <div className="nh-pagination">
      <button className="nh-pagination__btn">
        <i className="fas fa-chevron-left" />
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          className={`nh-pagination__btn${n === current ? ' nh-pagination__btn--active' : ''}`}
        >
          {n}
        </button>
      ))}
      <button className="nh-pagination__btn">
        <i className="fas fa-chevron-right" />
      </button>
    </div>
  );
}

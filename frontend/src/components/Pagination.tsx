import { LeftOutlined, RightOutlined } from '@ant-design/icons'

interface PaginationProps {
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  showSizeChanger?: boolean
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

const usePagination = ({
  page,
  total,
  pageSize
}: {
  page: number
  total: number
  pageSize: number
}) => {
  const totalPages = Math.ceil(total / pageSize)

  const getVisiblePages = () => {
    const pages = []
    const maxVisible = 7 // 最多显示7个页码

    if (totalPages <= maxVisible) {
      // 如果总页数小于等于最大显示数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 否则显示部分页码
      if (page <= 4) {
        // 当前页在前4页，显示前5页 + ... + 最后一页
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (page >= totalPages - 3) {
        // 当前页在后4页，显示第一页 + ... + 后5页
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // 当前页在中间，显示第一页 + ... + 当前页前后各2页 + ... + 最后一页
        pages.push(1)
        pages.push('...')
        for (let i = page - 2; i <= page + 2; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return {
    totalPages,
    visiblePages: getVisiblePages(),
    hasPrevious: page > 1,
    hasNext: page < totalPages,
    startItem: (page - 1) * pageSize + 1,
    endItem: Math.min(page * pageSize, total)
  }
}

const Pagination = ({
  page,
  total,
  pageSize,
  onPageChange,
  showSizeChanger = false,
  onPageSizeChange,
  pageSizeOptions = [8, 16, 24, 32]
}: PaginationProps) => {
  const { visiblePages, hasPrevious, hasNext, startItem, endItem } =
    usePagination({
      page,
      total,
      pageSize
    })

  if (total === 0) {
    return null
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1    border-gray-200 dark:border-zinc-700  duration-200">
      {/* 信息显示 */}
      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
        <span className="font-medium">
          显示第 {startItem} - {endItem} 条，共 {total} 条记录
        </span>
      </div>

      {/* 分页控制 */}
      <div className="flex items-center gap-2">
        {/* 每页条数选择器 */}
        {showSizeChanger && onPageSizeChange && (
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              每页
            </span>
            <select
              value={pageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent  duration-200"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">条</span>
          </div>
        )}

        {/* 分页按钮 */}
        <nav className="flex items-center gap-1">
          {/* 上一页按钮 */}
          <button
            onClick={() => hasPrevious && onPageChange(page - 1)}
            disabled={!hasPrevious}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-600 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed  duration-200 group"
            aria-label="上一页"
          >
            <LeftOutlined className="text-sm group-hover:scale-110 transition-transform duration-200" />
          </button>

          {/* 页码按钮 */}
          {visiblePages.map((pageNumber, index) => (
            <div key={index}>
              {pageNumber === '...' ? (
                <span className="flex items-center justify-center w-8 h-8 text-gray-500 dark:text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(pageNumber as number)}
                  className={`flex items-center justify-center w-8 h-8 rounded-md border  duration-200 font-medium ${
                    page === pageNumber
                      ? 'border-blue-500 bg-blue-500 text-white shadow-md hover:bg-blue-600 hover:shadow-lg'
                      : 'border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
                  }`}
                >
                  {pageNumber}
                </button>
              )}
            </div>
          ))}

          {/* 下一页按钮 */}
          <button
            onClick={() => hasNext && onPageChange(page + 1)}
            disabled={!hasNext}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-600 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed  duration-200 group"
            aria-label="下一页"
          >
            <RightOutlined className="text-sm group-hover:scale-110 transition-transform duration-200" />
          </button>
        </nav>
      </div>
    </div>
  )
}

export default Pagination

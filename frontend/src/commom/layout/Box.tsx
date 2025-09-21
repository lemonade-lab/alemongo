import classNames from 'classnames'
import { PropsWithChildren } from 'react'

/**
 * 自由滚动的盒子
 * @param param
 * @returns
 */
const Box = ({
  boxRef,
  children,
  rootClassName,
  className
}: PropsWithChildren<{
  boxRef?: React.RefObject<HTMLDivElement>
  className?: string
  rootClassName?: string
}>) => {
  return (
    <div
      ref={boxRef}
      className={classNames('flex-1 p-4 h-full w-full flex overflow-auto transition-colors', rootClassName)}
    >
      <div className="flex-1 flex w-[100px]">
        <div className={classNames(className, 'flex-1 flex flex-col')}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Box

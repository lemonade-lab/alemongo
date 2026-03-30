import { Tabs } from 'antd'
import { lazy, useMemo, useState } from 'react'
import { WithSuspense } from '@/WithSuspense'
import { Box } from '@/commom'

const Online = lazy(() => import('./Online'))
const Query = lazy(() => import('./Query'))

const App = () => {
  const [activeKey, setActiveKey] = useState('online')

  const items = useMemo(
    () => [
      {
        key: 'online',
        label: '在线日志'
      },
      {
        key: 'query',
        label: '查询日志'
      }
    ],
    []
  )

  return (
    <Box rootClassName="!overflow-hidden">
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="flex-shrink-0">
          <Tabs activeKey={activeKey} items={items} onChange={setActiveKey} />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeKey === 'online' ? (
            <WithSuspense>
              <Online />
            </WithSuspense>
          ) : (
            <WithSuspense>
              <Query />
            </WithSuspense>
          )}
        </div>
      </div>
    </Box>
  )
}

export default App

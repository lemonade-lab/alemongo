import { Tabs } from 'antd'
import { lazy, useMemo } from 'react'
import { WithSuspense } from '@/WithSuspense'
import { Box } from '@/commom'

const Online = lazy(() => import('./Online'))
const Query = lazy(() => import('./Query'))

const App = () => {
  const items = useMemo(
    () => [
      {
        key: 'online',
        label: '在线日志',
        children: (
          <WithSuspense>
            <Online />
          </WithSuspense>
        )
      },
      {
        key: 'query',
        label: '查询日志',
        children: (
          <WithSuspense>
            <Query />
          </WithSuspense>
        )
      }
    ],
    []
  )

  return (
    <Box rootClassName="!overflow-hidden">
      <Tabs
        className="flex-1 flex flex-col [&_.ant-tabs-content-holder]:flex-1 [&_.ant-tabs-content-holder]:min-h-0 [&_.ant-tabs-content]:h-full [&_.ant-tabs-tabpane]:h-full"
        defaultActiveKey="online"
        items={items}
      />
    </Box>
  )
}

export default App

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
    <Box>
      <Tabs defaultActiveKey="online" items={items} />
    </Box>
  )
}

export default App

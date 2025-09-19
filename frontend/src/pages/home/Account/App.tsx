import { useEffect, useState } from 'react'
import { User } from '../../../api'
import Pagination from '../../../components/Pagination'
import { apiUserDelete, apiUserList } from '@/api/users/admin'
import { Button, Popconfirm, Table, TableProps } from 'antd'
import { apiIdentityList, apiIdentityUpdate } from '@/api/users/identity'
import Headings from './Headings'
import {
  UserOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  CrownOutlined
} from '@ant-design/icons'
import { Box } from '@/commom'

/**
 * 用户管理表格组件
 * @returns
 */
const UserTable = () => {
  // 数据
  const [data, setData] = useState<User[]>([])
  const [curData, setCurData] = useState<User[]>([])
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    pageSize: 8,
    total: 0
  })

  useEffect(() => {
    const start = (pageInfo.page - 1) * pageInfo.pageSize
    const end = pageInfo.page * pageInfo.pageSize
    setCurData(data.slice(start, end))
    setPageInfo(info => ({
      ...info,
      total: data.length
    }))
  }, [data, pageInfo.page, pageInfo.pageSize])

  const initData = () => {
    apiUserList().then(res => {
      setData(res)
    })
  }

  useEffect(() => {
    initData()
  }, [])

  const onDelete = (item: User) => {
    apiUserDelete({
      username: item.username
    }).then(() => {
      initData()
    })
  }

  // 更新身份
  const updateIdentity = (item: User, value) => {
    apiIdentityUpdate({
      username: item.username,
      identity: value
    }).then(() => {
      // 针对性替换数据，而不是重新请求数据。
      setData(prev => {
        const index = prev.findIndex(i => i.username === item.username)
        if (index !== -1) {
          prev[index].identity = value
        }
        return [...prev]
      })
    })
  }

  const [selects, setSelects] = useState<string[]>([])
  useEffect(() => {
    const getList = async () => {
      const data = await apiIdentityList()
      setSelects(data)
    }
    getList()
  }, [])

  const columns: TableProps<User>['columns'] = [
    {
      width: 160,
      fixed: 'left',
      title: (
        <div className="flex items-center gap-2">
          <UserOutlined className="text-purple-500" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            昵称
          </span>
        </div>
      ),
      dataIndex: 'username',
      key: 'username',
      render: value => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg">
            {value.charAt(0).toUpperCase()}
          </div>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {value}
          </span>
        </div>
      )
    },
    {
      width: 130,
      title: (
        <div className="flex items-center gap-2">
          <SafetyCertificateOutlined className="text-blue-500" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            身份
          </span>
        </div>
      ),
      dataIndex: 'identity',
      key: 'identity',
      render: (value, data) => {
        return (
          <select
            className="w-full px-3 py-2 text-sm font-medium bg-white/70 dark:bg-zinc-800/70 border border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
            value={value}
            onChange={e => {
              updateIdentity(data, e.target.value)
            }}
          >
            {selects.map(item => (
              <option
                key={item}
                value={item}
                className="dark:bg-zinc-900 dark:text-gray-100"
              >
                {item}
              </option>
            ))}
          </select>
        )
      }
    },
    {
      width: 160,
      title: (
        <div className="flex items-center gap-2">
          <CrownOutlined className="text-green-500" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            主账号
          </span>
        </div>
      ),
      dataIndex: 'mastername',
      key: 'mastername',
      render: value => (
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {value || '-'}
        </span>
      )
    },
    {
      width: 160,
      title: (
        <div className="flex items-center gap-2">
          <TeamOutlined className="text-red-500" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            操作
          </span>
        </div>
      ),
      key: 'action',
      render: item => (
        <div>
          <Popconfirm
            title={
              <div className="flex items-center gap-2">
                <ExclamationCircleOutlined className="text-red-500" />
                <span className="font-semibold">危险操作</span>
              </div>
            }
            description="你确定要删除这个用户吗？此操作不可撤销。"
            onConfirm={() => onDelete(item)}
            okText="确认删除"
            cancelText="取消"
            okButtonProps={{
              danger: true,
              className:
                'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg'
            }}
            className="dark:[&>.ant-popover-content]:bg-zinc-900/95 backdrop-blur-xl"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
            >
              删除
            </Button>
          </Popconfirm>
        </div>
      )
    }
  ]

  return (
    <Box>
      <div className="sm:p-6  gap-2 flex-1 flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
        {/* 头部区域 */}
        <Headings
          selects={selects}
          onUpdate={() => {
            initData()
          }}
        />

        {/* 表格区域 */}
        <div className="flex-1 overflow-hidden">
          <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-zinc-900/90 dark:to-zinc-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50 rounded-xl shadow-sm">
            <Table
              pagination={false}
              columns={columns}
              dataSource={curData}
              direction='ltr'
              virtual
              // {
              //   {
              //     'virtual'
              //   }
              // }
              className="[&_.ant-table-thead_.ant-table-cell]:bg-gradient-to-r [&_.ant-table-thead_.ant-table-cell]:from-blue-50/80 [&_.ant-table-thead_.ant-table-cell]:to-purple-50/80 [&_.ant-table-thead_.ant-table-cell]:dark:from-blue-900/30 [&_.ant-table-thead_.ant-table-cell]:dark:to-purple-900/30 [&_.ant-table-thead_.ant-table-cell]:backdrop-blur-sm [&_.ant-table-thead_.ant-table-cell]:border-b [&_.ant-table-thead_.ant-table-cell]:border-blue-200/30 [&_.ant-table-thead_.ant-table-cell]:dark:border-blue-700/30 [&_.ant-table-tbody_.ant-table-cell]:border-b [&_.ant-table-tbody_.ant-table-cell]:border-gray-200/20 [&_.ant-table-tbody_.ant-table-cell]:dark:border-gray-700/20 [&_.ant-table-tbody_.ant-table-row]:hover:bg-gradient-to-r [&_.ant-table-tbody_.ant-table-row]:hover:from-blue-50/50 [&_.ant-table-tbody_.ant-table-row]:hover:to-purple-50/50 [&_.ant-table-tbody_.ant-table-row]:dark:hover:from-blue-900/20 [&_.ant-table-tbody_.ant-table-row]:dark:hover:to-purple-900/20 [&_.ant-table-tbody_.ant-table-row]:transition-all [&_.ant-table-tbody_.ant-table-row]:duration-300"
              rowClassName={() =>
                'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300'
              }
            />
          </div>
        </div>

        {/* 分页区域 */}
        {pageInfo.total ? (
          <div className="mt-6 flex justify-center w-full">
            <div className="w-full bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-zinc-900/80 dark:to-zinc-800/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-gray-200/50 dark:border-zinc-700/50 shadow-sm">
              <Pagination
                total={pageInfo.total}
                pageSize={pageInfo.pageSize}
                page={pageInfo.page}
                onPageChange={page => {
                  setPageInfo({
                    ...pageInfo,
                    page
                  })
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </Box>
  )
}

export default UserTable

import { useEffect, useState } from 'react'
import { User } from '../../../api'
import Pagination from '../../../components/Pagination'
import { apiUserDelete, apiUserList } from '@/api/users/admin'
import { Button, Popconfirm, Table, TableProps, message } from 'antd'
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
import PermissionGuard from '@/components/PermissionGuard'
import { IDENTITY } from '@/utils/permission'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'

/**
 * 用户管理表格组件
 * @returns
 */
const UserTable = () => {
  // 获取当前登录用户信息
  const currentUser = useSelector((state: RootState) => state.me.info)

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
    // 检查是否在删除自己
    if (currentUser.username === item.username) {
      message.error('禁止删除自己')
      return
    }

    // 检查管理员是否尝试删除超级管理员
    const isSuperAdmin = item.identity === IDENTITY.SUPER_ADMIN
    const currentUserIsSuperAdmin =
      currentUser.identity === IDENTITY.SUPER_ADMIN
    if (isSuperAdmin && !currentUserIsSuperAdmin) {
      message.error('只有超级管理员才能删除超级管理员')
      return
    }

    apiUserDelete({
      username: item.username
    })
      .then(() => {
        initData()
        message.success('用户删除成功')
      })
      .catch(error => {
        message.error(error.response?.data?.msg || '用户删除失败')
      })
  }

  // 更新身份
  const updateIdentity = (item: User, value) => {
    // 检查是否在修改自己的身份
    if (currentUser.username === item.username) {
      message.error('禁止修改自己的身份')
      return
    }

    // 检查管理员是否尝试修改超级管理员身份
    const isSuperAdmin = item.identity === IDENTITY.SUPER_ADMIN
    const currentUserIsSuperAdmin =
      currentUser.identity === IDENTITY.SUPER_ADMIN
    if (isSuperAdmin && !currentUserIsSuperAdmin) {
      message.error('只有超级管理员才能修改超级管理员身份')
      return
    }

    // 检查管理员是否尝试将用户设置为超级管理员
    if (value === IDENTITY.SUPER_ADMIN && !currentUserIsSuperAdmin) {
      message.error('只有超级管理员才能设置用户为超级管理员')
      return
    }

    apiIdentityUpdate({
      username: item.username,
      identity: value
    })
      .then(() => {
        // 针对性替换数据，而不是重新请求数据。
        setData(prev => {
          const index = prev.findIndex(i => i.username === item.username)
          if (index !== -1) {
            prev[index].identity = value
          }
          return [...prev]
        })
        message.success('身份修改成功')
      })
      .catch(error => {
        message.error(error.response?.data?.msg || '身份修改失败')
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
        // 检查是否应该禁用下拉框
        const isCurrentUser = currentUser.username === data.username
        const isSuperAdmin = data.identity === IDENTITY.SUPER_ADMIN
        const currentUserIsSuperAdmin =
          currentUser.identity === IDENTITY.SUPER_ADMIN

        // 禁用条件：1. 当前用户自己 2. 管理员尝试修改超级管理员身份
        const isDisabled =
          isCurrentUser || (isSuperAdmin && !currentUserIsSuperAdmin)

        let title = ''
        if (isCurrentUser) {
          title = '不能修改自己的身份'
        } else if (isSuperAdmin && !currentUserIsSuperAdmin) {
          title = '只有超级管理员才能修改超级管理员身份'
        }

        return (
          <select
            className={`w-full px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-300 ${
              isDisabled
                ? 'bg-gray-100 dark:bg-zinc-700 border-gray-200 dark:border-zinc-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 focus:border-blue-500 dark:focus:border-blue-400'
            }`}
            value={value}
            disabled={isDisabled}
            onChange={e => {
              updateIdentity(data, e.target.value)
            }}
            title={title}
          >
            {selects.map(item => {
              // 如果当前用户不是超级管理员，过滤掉超级管理员选项
              const currentUserIsSuperAdmin =
                currentUser.identity === IDENTITY.SUPER_ADMIN
              if (item === IDENTITY.SUPER_ADMIN && !currentUserIsSuperAdmin) {
                return null
              }

              return (
                <option
                  key={item}
                  value={item}
                  className="dark:bg-zinc-900 dark:text-gray-100"
                >
                  {item}
                </option>
              )
            })}
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
      render: item => {
        // 检查是否应该禁用删除按钮
        const isCurrentUser = currentUser.username === item.username
        const isSuperAdmin = item.identity === IDENTITY.SUPER_ADMIN
        const currentUserIsSuperAdmin =
          currentUser.identity === IDENTITY.SUPER_ADMIN

        // 禁用条件：1. 当前用户自己 2. 管理员尝试删除超级管理员
        const isDisabled =
          isCurrentUser || (isSuperAdmin && !currentUserIsSuperAdmin)

        return (
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
              disabled={isDisabled}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={isDisabled}
                className={`border-0 shadow-md transition-all duration-300 rounded-lg ${
                  isDisabled
                    ? 'bg-gray-300 dark:bg-zinc-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 hover:shadow-lg'
                }`}
                title={
                  isCurrentUser
                    ? '不能删除自己'
                    : isSuperAdmin && !currentUserIsSuperAdmin
                      ? '只有超级管理员才能删除超级管理员'
                      : ''
                }
              >
                删除
              </Button>
            </Popconfirm>
          </div>
        )
      }
    }
  ]

  return (
    <Box>
      <div className="gap-2 flex-1 flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
        {/* 头部区域 */}
        <Headings
          selects={selects}
          currentUserIdentity={currentUser.identity}
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
              rowKey="username"
              dataSource={curData}
              direction="ltr"
              virtual
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

// 使用权限守卫包装组件
const AccountApp = () => {
  return (
    <PermissionGuard requiredIdentity={IDENTITY.ADMIN}>
      <UserTable />
    </PermissionGuard>
  )
}

export default AccountApp

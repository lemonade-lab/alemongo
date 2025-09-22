import React, { useEffect, useState, useCallback } from 'react'
import {
  Card,
  Table,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  message,
  Row,
  Col,
  Select,
  Spin,
  Empty
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons'
import {
  apiGetAllPorts,
  apiGetPortsByPort,
  apiGetPortsByProcess,
  PortInfo
} from '@/api/portMonitor'
import { Box } from '@/commom'

const { Text } = Typography
const { Search } = Input
const { Option } = Select

const PortMonitor: React.FC = () => {
  const [ports, setPorts] = useState<PortInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [searchType, setSearchType] = useState<'all' | 'port' | 'process'>(
    'all'
  )
  const [searchValue, setSearchValue] = useState('')
  const [filteredPorts, setFilteredPorts] = useState<PortInfo[]>([])
  const [protocolFilter, setProtocolFilter] = useState<string>('all')
  const [stateFilter, setStateFilter] = useState<string>('all')

  // 获取唯一的协议类型
  const getUniqueProtocols = useCallback(() => {
    const protocols = new Set(ports.map(port => port.protocol))
    return Array.from(protocols).sort()
  }, [ports])

  // 获取唯一的状态类型
  const getUniqueStates = useCallback(() => {
    const states = new Set(ports.map(port => port.state))
    return Array.from(states).sort()
  }, [ports])

  // 获取协议统计信息
  const getProtocolStats = useCallback(() => {
    const stats: Record<string, number> = {}
    ports.forEach(port => {
      stats[port.protocol] = (stats[port.protocol] || 0) + 1
    })
    return stats
  }, [ports])

  // 获取状态统计信息
  const getStateStats = useCallback(() => {
    const stats: Record<string, number> = {}
    ports.forEach(port => {
      stats[port.state] = (stats[port.state] || 0) + 1
    })
    return stats
  }, [ports])

  // 应用所有过滤器
  const applyFilters = useCallback(
    (data: PortInfo[]) => {
      let filtered = data

      // 协议过滤
      if (protocolFilter !== 'all') {
        filtered = filtered.filter(port => port.protocol === protocolFilter)
      }

      // 状态过滤
      if (stateFilter !== 'all') {
        filtered = filtered.filter(port => port.state === stateFilter)
      }

      return filtered
    },
    [protocolFilter, stateFilter]
  )

  // 获取所有端口信息
  const fetchAllPorts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGetAllPorts()
      setPorts(data)
      const filtered = applyFilters(data)
      setFilteredPorts(filtered)
    } catch (error) {
      console.error('获取端口信息失败:', error)
      message.error('获取端口信息失败')
    } finally {
      setLoading(false)
    }
  }, [applyFilters])

  // 搜索端口
  const handleSearch = useCallback(async () => {
    if (!searchValue.trim()) {
      const filtered = applyFilters(ports)
      setFilteredPorts(filtered)
      return
    }

    setLoading(true)
    try {
      let data: PortInfo[] = []

      if (searchType === 'port') {
        const portNumber = parseInt(searchValue)
        if (isNaN(portNumber)) {
          message.error('请输入有效的端口号')
          return
        }
        data = await apiGetPortsByPort(portNumber)
      } else if (searchType === 'process') {
        data = await apiGetPortsByProcess(searchValue)
      } else {
        // 全量搜索，在本地过滤
        data = ports.filter(
          port =>
            port.local.toLowerCase().includes(searchValue.toLowerCase()) ||
            port.remote.toLowerCase().includes(searchValue.toLowerCase()) ||
            port.pid.includes(searchValue) ||
            port.protocol.toLowerCase().includes(searchValue.toLowerCase())
        )
      }

      const filtered = applyFilters(data)
      setFilteredPorts(filtered)
    } catch (error) {
      console.error('搜索端口失败:', error)
      message.error('搜索端口失败')
    } finally {
      setLoading(false)
    }
  }, [searchType, searchValue, ports, applyFilters])

  // 重置搜索
  const handleReset = useCallback(() => {
    setSearchValue('')
    setSearchType('all')
    setProtocolFilter('all')
    setStateFilter('all')
    setFilteredPorts(ports)
  }, [ports])

  // 处理过滤器变化
  const handleFilterChange = useCallback(() => {
    const filtered = applyFilters(ports)
    setFilteredPorts(filtered)
  }, [ports, applyFilters])

  // 监听过滤器变化
  useEffect(() => {
    handleFilterChange()
  }, [handleFilterChange])

  // 获取状态标签颜色
  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'listening':
      case 'listen':
        return 'green'
      case 'established':
        return 'blue'
      case 'time_wait':
        return 'orange'
      case 'close_wait':
        return 'red'
      default:
        return 'default'
    }
  }

  // 获取协议标签颜色
  const getProtocolColor = (protocol: string) => {
    switch (protocol.toLowerCase()) {
      case 'tcp':
        return 'blue'
      case 'udp':
        return 'green'
      case 'tcp6':
        return 'purple'
      default:
        return 'default'
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '协议',
      dataIndex: 'protocol',
      key: 'protocol',
      width: 80,
      render: (protocol: string) => (
        <Tag color={getProtocolColor(protocol)}>{protocol}</Tag>
      )
    },
    {
      title: '本地地址',
      dataIndex: 'local',
      key: 'local',
      width: 150,
      render: (local: string) => <Text code>{local}</Text>
    },
    {
      title: '远程地址',
      dataIndex: 'remote',
      key: 'remote',
      width: 150,
      render: (remote: string) => <Text code>{remote}</Text>
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (state: string) => <Tag color={getStateColor(state)}>{state}</Tag>
    },
    {
      title: '进程ID',
      dataIndex: 'pid',
      key: 'pid',
      width: 80,
      render: (pid: string) => <Text strong>{pid}</Text>
    }
  ]

  useEffect(() => {
    fetchAllPorts()
  }, [fetchAllPorts])

  return (
    <Box>
      {/* 统计信息卡片 */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {ports.length}
              </div>
              <div className="text-gray-500">总端口数</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getUniqueProtocols().length}
              </div>
              <div className="text-gray-500">协议类型</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getUniqueStates().length}
              </div>
              <div className="text-gray-500">连接状态</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredPorts.length}
              </div>
              <div className="text-gray-500">当前显示</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 协议和状态分布 */}
      <Row gutter={16} className="mb-4">
        <Col span={12}>
          <Card size="small" title="协议分布">
            <Space wrap>
              {Object.entries(getProtocolStats()).map(([protocol, count]) => (
                <Tag key={protocol} color={getProtocolColor(protocol)}>
                  {protocol}: {count}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="状态分布">
            <Space wrap>
              {Object.entries(getStateStats()).map(([state, count]) => (
                <Tag key={state} color={getStateColor(state)}>
                  {state}: {count}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space.Compact style={{ width: '100%' }}>
              <Select
                value={searchType}
                onChange={setSearchType}
                style={{ width: 120 }}
              >
                <Option value="all">全部</Option>
                <Option value="port">端口号</Option>
                <Option value="process">进程名</Option>
              </Select>
              <Search
                placeholder={
                  searchType === 'port'
                    ? '请输入端口号'
                    : searchType === 'process'
                      ? '请输入进程名'
                      : '搜索端口、地址、PID等'
                }
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onSearch={handleSearch}
                enterButton={<SearchOutlined />}
                style={{ flex: 1 }}
              />
            </Space.Compact>
          </Col>
          <Col>
            <Space>
              <Button
                onClick={handleSearch}
                loading={loading}
                icon={<SearchOutlined />}
              >
                搜索
              </Button>
              <Button onClick={handleReset} icon={<FilterOutlined />}>
                重置
              </Button>
              <Button
                onClick={fetchAllPorts}
                loading={loading}
                icon={<ReloadOutlined />}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Row gutter={16} className="mb-4">
          <Col flex="auto">
            <Space>
              <Text strong>端口列表</Text>
              <Text type="secondary">({filteredPorts.length} 个端口)</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text strong>协议:</Text>
              <Select
                value={protocolFilter}
                onChange={setProtocolFilter}
                style={{ width: 100 }}
                placeholder="协议"
                size="small"
              >
                <Option value="all">全部</Option>
                {getUniqueProtocols().map(protocol => (
                  <Option key={protocol} value={protocol}>
                    <Tag color={getProtocolColor(protocol)}>{protocol}</Tag>
                  </Option>
                ))}
              </Select>
              <Text strong>状态:</Text>
              <Select
                value={stateFilter}
                onChange={setStateFilter}
                style={{ width: 100 }}
                placeholder="状态"
                size="small"
              >
                <Option value="all">全部</Option>
                {getUniqueStates().map(state => (
                  <Option key={state} value={state}>
                    <Tag color={getStateColor(state)}>{state}</Tag>
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>
          {filteredPorts.length === 0 ? (
            <Empty
              description="暂无端口信息"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredPorts}
              rowKey={(record, index) =>
                `${record.protocol}-${record.local}-${record.remote}-${index}`
              }
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }}
              scroll={{ x: 600 }}
              size="small"
            />
          )}
        </Spin>
      </Card>
    </Box>
  )
}

export default PortMonitor

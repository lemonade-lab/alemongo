import React, { useState, useEffect } from 'react'
import { message, Card, Row, Col, Progress, Spin } from 'antd'
import { useCommon } from '@/hook/useCommon'
import { apiGetSystemStats, SystemStats } from '@/api/common'
import { Box } from '@/commom'

const About: React.FC = () => {
  const [common] = useCommon()
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // 获取系统统计信息
  const fetchSystemStats = async () => {
    setStatsLoading(true)
    try {
      const stats = await apiGetSystemStats()
      setSystemStats(stats)
    } catch (error) {
      console.error('获取系统统计信息失败:', error)
      message.error('获取系统统计信息失败')
    } finally {
      setStatsLoading(false)
    }
  }

  // 格式化字节大小
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 获取进度条颜色
  const getProgressColor = (usage: number): string => {
    if (usage < 50) return '#52c41a' // 绿色
    if (usage < 80) return '#faad14' // 橙色
    return '#ff4d4f' // 红色
  }

  useEffect(() => {
    fetchSystemStats()
  }, [])

  //   const app = {
  //     name: 'Alemongo',
  //     version: common.info.base?.version || '未知',
  //     buildTime: common.info.base?.build_time || '未知',
  //     description: '机器人管理平台',
  //     icon: '🤖',
  //     color: 'from-blue-500 to-cyan-500'
  //   }

  // 工具信息
  const tools = [
    {
      name: 'IP地址',
      data: {
        installed: true,
        version: common.info.location || 'N/A'
      },
      icon: '🌐',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'NodeJS',
      data: common.info.node,
      icon: '🟢',
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'NVM',
      data: common.info.nvm,
      icon: '📦',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Git',
      data: common.info.git,
      icon: '🔧',
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'Browser',
      data: common.info.browser,
      icon: '🌍',
      color: 'from-indigo-500 to-blue-500'
    }
  ]

  return (
    <Box>
      {/* 系统监控信息 */}
      <Card
        className="mb-6"
        title={
          <div className="flex items-center gap-2">
            🖥️ 系统监控 V{common.info.base?.version}(
            {common.info.base?.build_time})
          </div>
        }
      >
        <Spin spinning={statsLoading}>
          {systemStats ? (
            <Row gutter={[16, 16]}>
              {/* CPU信息 */}
              <Col xs={24} sm={12} lg={6}>
                <Card size="small" className="text-center">
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {systemStats.cpu.usage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">CPU使用率</div>
                  </div>
                  <Progress
                    percent={systemStats.cpu.usage}
                    strokeColor={getProgressColor(systemStats.cpu.usage)}
                    size="small"
                    showInfo={false}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {systemStats.cpu.count} 核心
                  </div>
                  {systemStats.cpu.model && (
                    <div
                      className="text-xs text-gray-400 mt-1 truncate"
                      title={systemStats.cpu.model}
                    >
                      {systemStats.cpu.model}
                    </div>
                  )}
                </Card>
              </Col>

              {/* 内存信息 */}
              <Col xs={24} sm={12} lg={6}>
                <Card size="small" className="text-center">
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-green-600">
                      {systemStats.memory.usage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">内存使用率</div>
                  </div>
                  <Progress
                    percent={systemStats.memory.usage}
                    strokeColor={getProgressColor(systemStats.memory.usage)}
                    size="small"
                    showInfo={false}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {formatBytes(systemStats.memory.used)} /{' '}
                    {formatBytes(systemStats.memory.total)}
                  </div>
                </Card>
              </Col>

              {/* 磁盘信息 */}
              <Col xs={24} sm={12} lg={6}>
                <Card size="small" className="text-center">
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-orange-600">
                      {systemStats.disk.usage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">磁盘使用率</div>
                  </div>
                  <Progress
                    percent={systemStats.disk.usage}
                    strokeColor={getProgressColor(systemStats.disk.usage)}
                    size="small"
                    showInfo={false}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {formatBytes(systemStats.disk.used)} /{' '}
                    {formatBytes(systemStats.disk.total)}
                  </div>
                </Card>
              </Col>

              {/* 系统运行时间 */}
              <Col xs={24} sm={12} lg={6}>
                <Card size="small" className="text-center">
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-purple-600">⏱️</div>
                    <div className="text-sm text-gray-500">系统运行时间</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {systemStats.uptime}
                  </div>
                </Card>
              </Col>
            </Row>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无系统监控数据
            </div>
          )}
        </Spin>
      </Card>

      {/* 环境工具信息 */}
      <Card title="🔧 环境工具">
        <div className="flex flex-col gap-4">
          {tools.map(
            tool =>
              tool.data?.installed && (
                <div
                  key={tool.name}
                  className="group flex items-center justify-between w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg border border-white/20 dark:border-gray-600/20 hover:shadow-xl hover:scale-105 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-lg flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}
                    >
                      {tool.icon}
                    </div>
                    <div>
                      <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {tool.name}
                      </span>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        已安装
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold gradient-text">
                      {tool.data.version}
                    </span>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              )
          )}
        </div>
      </Card>

      {/* 系统信息 */}
      <Card className="mt-6" title="ℹ️ 系统信息">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {navigator.platform || '未知'}
              </div>
              <div className="text-sm text-gray-500">操作系统</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {navigator.userAgent.split(' ').pop() || '未知'}
              </div>
              <div className="text-sm text-gray-500">浏览器</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {navigator.language || '未知'}
              </div>
              <div className="text-sm text-gray-500">语言</div>
            </div>
          </Col>
        </Row>
      </Card>
    </Box>
  )
}

export default About

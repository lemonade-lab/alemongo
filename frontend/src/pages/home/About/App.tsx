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

  return (
    <Box>
      {/* 系统监控信息 */}
      <Card
        className="mb-6"
        title={
          <div className="flex items-center gap-2">
            🖥️ {common.info.base?.version}(
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
    </Box>
  )
}

export default About

import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { useEffect, useState } from 'react'
import { apiSSHList, apiSSHRead, apiSSHUpdate } from '@/api/ssh'
import FileEdit from '@/commom/FileEdit'
import Box from '@/commom/Box'
const SSHUpdate = () => {
  const navigate = useNavigate()
  const [configNames, setConfigNames] = useState<string[]>([])
  const [data, setData] = useState<string>('')
  // 是否是更新配置
  const isUpdate = window.location.pathname.includes('update')
  // 获取当前配置名称
  const getName = () => {
    if (isUpdate) {
      const names = window.location.pathname.split('/')
      // 获取倒数第二个元素
      const name = names[names.length - 2]
      return name || 'id_rsa.pub'
    }
    const path = window.location.pathname
    const name = path.split('/').pop()
    return name
  }

  useEffect(() => {
    if (!isUpdate) {
      // 获取当前配置数据
      const name = getName()
      if (!name) {
        message.error('错误访问')
        return
      }
      apiSSHRead({
        name: name
      }).then(res => {
        setData(res)
      })
    } else {
      apiSSHList().then(res => {
        setConfigNames(res)
      })
    }
  }, [isUpdate])

  const updateContent = (name: string, value: string) => {
    apiSSHUpdate({
      name: name,
      content: value
    }).then(() => {
      message.success('更新成功')
      if (isUpdate) {
        navigate('/ssh')
      }
    })
  }

  const onSave = (name: string, value: string) => {
    if (!isUpdate) {
      // 查看模式，使用URL中的名称
      const path = window.location.pathname
      const urlName = path.split('/').pop()
      if (!urlName) {
        message.error('错误访问')
        return
      }
      updateContent(urlName, value)
      return
    }
    // 更新模式，可以修改名称，但需要检查是否已存在
    if (configNames.includes(name)) {
      message.error('配置名称已存在')
      return
    }
    updateContent(name, value)
  }
  return (
    <Box>
      <div className="p-2 flex gap-4 flex-col  transition-colors flex-1">
        <FileEdit
          disableName={!isUpdate}
          onSave={onSave}
          name={getName()}
          value={data}
        />
      </div>
    </Box>
  )
}

export default SSHUpdate

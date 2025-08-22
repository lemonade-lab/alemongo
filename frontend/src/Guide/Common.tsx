import { useEffect, useState } from 'react'
import Joyride from 'react-joyride'
// 引导
const KEY = 'FIRST_GUIDE_COMMON'
// 条件
const KEY_DATA = '1'
// 定义引导步骤
const steps = [
  {
    target: '.steps-common-1',
    content: '',
    disableBeacon: true
  }
]
export default function GuideCommon() {
  const [run, setRun] = useState(false)
  // 引导回调函数
  const handleJoyrideCallback = (data: {
    action: string
    index: number
    type: string
  }) => {
    console.log('Joyride:', data)
    if (data.action == 'skip' && data.type == 'tour:end') {
      console.log('跳过')
      localStorage.setItem(KEY, KEY_DATA)
    }
  }
  useEffect(() => {
    const guide = localStorage.getItem(KEY)
    if (!guide || (guide && guide != KEY_DATA)) {
      setRun(true)
    }
  }, [])
  return (
    <Joyride
      steps={steps} // 引导步骤
      run={run} // 是否运行引导
      callback={handleJoyrideCallback} // 回调函数
      continuous={true} // 是否连续显示步骤（显示“Next”按钮）
      showProgress={false} // 显示进度条
      showSkipButton={true} // 显示跳过按钮
      locale={{
        skip: '不再显示'
      }}
      styles={{
        options: {
          zIndex: 1000 // 设置 z-index
        }
      }}
    />
  )
}

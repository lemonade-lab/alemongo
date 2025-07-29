import {useEffect, useState} from "react";
import Joyride from "react-joyride";

// 引导
const KEY = "FIRST_GUIDE";
// 条件
const KEY_DATA = "2";

// 定义引导步骤
const steps = [
  {
    target: ".steps-1",
    content:
      "这是“加载依赖”按钮。依赖是机器人运行所需要的软件包。可不进行加载，但会无法使用和“机器人”相关的功能",
    disableBeacon: true,
  }
];

export default function GuideMain({stepIndex}: {stepIndex: number}) {
  const [step, setSetp] = useState(-1);

  // 引导回调函数
  const handleJoyrideCallback = (data: {
    action: string;
    index: number;
    type: string;
  }) => {
    console.log("Joyride:", data);
    if (data.action == "skip" && data.type == "tour:end") {
      console.log("跳过");
      localStorage.setItem(KEY, KEY_DATA);
    }
  };
  useEffect(() => {
    if (stepIndex == -1) {
      return;
    }
    const guide = localStorage.getItem(KEY);
    if (!guide || (guide && guide != KEY_DATA)) {
      setSetp(stepIndex);
    }
  }, [stepIndex]);
  return (
    <Joyride
      steps={step == -1 ? [] : steps.slice(step - 1, steps.length)} // 引导步骤
      run={step == -1 ? false : true} // 是否运行引导
      callback={handleJoyrideCallback} // 回调函数
      continuous={true} // 是否连续显示步骤（显示“Next”按钮）
      showProgress={false} // 显示进度条
      showSkipButton={true} // 显示跳过按钮
      locale={{
        skip: "不再显示",
      }}
      styles={{
        options: {
          zIndex: 1000, // 设置 z-index
        },
      }}
    />
  );
}

import React, {useEffect, useState, useCallback} from "react";
import {UnControlled as CodeMirror} from "react-codemirror2";
// // 脚本
import "codemirror/lib/codemirror.js";
// // 样式
import "codemirror/lib/codemirror.css";
// // 模型
import "codemirror/mode/properties/properties.js";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/yaml/yaml.js";
// // 主题
import "codemirror/theme/solarized.css";
import "codemirror/theme/xq-light.css";
// // 样式修改
import "@/assets/css/CodeMirror.css";

type CodeMirrorProps = {
  value: CodeMirror["props"]["value"];
  onChange?: CodeMirror["props"]["onChange"];
  mode?: CodeMirror["props"]["options"]["mode"];
};

const useTheme = () => {
  const [theme, setTheme] = useState("");
  const handleClassChange = useCallback(() => {
    const hasDarkClass = document.documentElement.classList.contains("dark");
    setTheme(hasDarkClass ? "solarized" : "xq-light");
  }, []);
  useEffect(() => {
    // 创建 MutationObserver 实例
    const observer = new MutationObserver(() => handleClassChange());
    // 开始监听 HTML 的 class 属性变化
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    // 初始化时检查当前主题
    handleClassChange();
    return () => {
      // 停止监听，防止内存泄漏
      observer.disconnect();
    };
  }, [handleClassChange]);

  return theme;
};

/**
 * CodeMirror 编辑器组件
 * @param props 组件属性
 * @returns JSX.Element
 */
const Code: React.FC<CodeMirrorProps> = React.memo((props) => {
  const {value, mode, onChange} = props;
  const theme = useTheme();

  useEffect(() => {
    // 强制删除多余的 CodeMirror 实例，只保留最后一个
    const editors = document.querySelectorAll(".CodeMirror");
    if (editors.length > 1) {
      editors.forEach((editor, index) => {
        if (index < editors.length - 1) {
          editor.remove();
        }
      });
    }
  }, []);

  return (
    <CodeMirror
      autoCursor={false}
      className="flex-1"
      options={{
        mode: mode ?? "text/x-properties",
        theme: theme,
        lineNumbers: true,
      }}
      value={value}
      onChange={onChange}
    />
  );
});

export default Code;

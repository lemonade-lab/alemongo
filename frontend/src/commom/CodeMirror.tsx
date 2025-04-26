import {UnControlled as CodeMirror} from "react-codemirror2";
// 脚本
import "codemirror/lib/codemirror.js";
// 样式
import "codemirror/lib/codemirror.css";
// 模型
import "codemirror/mode/properties/properties.js";
// josn
import "codemirror/mode/javascript/javascript.js";
// yaml
import "codemirror/mode/yaml/yaml.js";
// 主题
import "codemirror/theme/solarized.css";
import "codemirror/theme/xq-light.css";
// 样式修改
import "@/assets/css/CodeMirror.css";
import {useEffect, useState} from "react";

type CodeMirrorProps = {
  value: CodeMirror["props"]["value"];
  onChange?: CodeMirror["props"]["onChange"];
  mode?: CodeMirror["props"]["options"]["mode"];
  onBeforeChange?: CodeMirror["props"]["onBeforeChange"];
};

const useTheme = () => {
  const [themex, setTheme] = useState("xq-light");
  useEffect(() => {
    const res = localStorage.getItem("theme");
    if (res === "dark") {
      setTheme("solarized");
    } else {
      setTheme("xq-light");
    }
    // 监听 html class 变化
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const hasDarkClass =
            document.documentElement.classList.contains("dark");
          if (hasDarkClass) {
            setTheme("solarized");
          } else {
            setTheme("xq-light");
          }
        }
      }
    });
    // 开始监听
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      // 停止监听
      observer.disconnect();
    };
  }, []);
  return [themex];
};

/**
 *
 * @param props
 * @returns
 */
export default function Code(props: CodeMirrorProps) {
  const {value, mode, onBeforeChange, onChange} = props;
  const [themex] = useTheme();
  return (
    <CodeMirror
      autoCursor={false}
      className="size-full"
      options={{
        mode: mode ?? "text/x-properties",
        theme: themex,
        lineNumbers: true, // 显示行号
        // indentUnit: 2, // 缩进单位
        // smartIndent: true, // 智能缩进
        // foldGutter: true, // 启用代码折叠
        // autoCloseBrackets: true, // 自动闭合括号
        // gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'], // 行号和折叠槽
        // matchBrackets: true // 高亮匹配的括号
      }}
      value={value}
      onChange={onChange}
      onBeforeChange={onBeforeChange}
    />
  );
}

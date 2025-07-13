import dayjs from "dayjs";
import {Buffer} from "buffer";
import {Button} from "antd";
/**
 *
 * @param param0
 * @returns
 */
export default function MessageBubble({
  messageBody,
  createAt,
  onSend = () => {},
  onInput = () => {},
}: {
  messageBody: any;
  createAt: number;
  onSend: (value: string) => void;
  onInput: (value: string) => void;
}) {
  return (
    <div className="rounded-md relative p-3 shadow-md bg-[var(--vscode-panel-background)]">
      {
        // 消息是一个body。需要按格式解析
      }
      {messageBody.map((item, index) => {
        if (item.type == "MD.template") {
          return <div key={index}>暂时不支持</div>;
        } else if (item.type === "Ark.BigCard") {
          return <div key={index}>暂时不支持</div>;
        } else if (item.type === "Ark.Card") {
          return <div key={index}>暂时不支持</div>;
        } else if (item.type === "Ark.list") {
          return <div key={index}>暂时不支持</div>;
        } else if (item.type == "Image") {
          // 数组，buffer 被格式化的数据
          // 字符串，buffer base64 编码的数据
          const data = Array.isArray(item.value)
            ? Buffer.from(item.value)
            : Buffer.from(item.value, "base64");
          const blob = new Blob([data]);
          // 转为本地地址
          const url = URL.createObjectURL(blob);
          return (
            <img
              key={index}
              className="max-w-[15rem] xl:max-w-[20rem] rounded-md"
              src={url}
              alt="Image"
            />
          );
        } else if (item.type == "ImageURL") {
          const url = item.value;
          return (
            <img
              key={index}
              className="max-w-[15rem] xl:max-w-[20rem] rounded-md"
              src={url}
              alt="ImageURL"
            />
          );
        } else if (item.type == "Text") {
          // 换行
          const text = item.value.includes("\n")
            ? item.value.split("\n").map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))
            : item.value;
          if (item.options?.style == "bold") {
            return (
              <span key={index}>
                <strong key={index}>{text}</strong>
              </span>
            );
          } else if (item.options?.style == "italic") {
            return <span key={index}>{text}</span>;
          } else if (item.options?.style == "boldItalic") {
            return <span key={index}>{text}</span>;
          } else if (item.options?.style == "block") {
            return (
              <span className="shadow-inner" key={index}>
                {text}
              </span>
            );
          } else if (item.options?.style == "strikethrough") {
            return <code key={index}>{text}</code>;
          } else if (item.options?.style == "none") {
            return text;
          } else {
            return text;
          }
        } else if (item.type == "Mention") {
          // 根据提示渲染。
          if (
            item.value == "all" ||
            item.value == "everyone" ||
            item.value == "全体成员"
          ) {
            return (
              <span key={index}>
                <strong>@全体成员</strong>
              </span>
            );
          } else if (item.options?.belong == "channel") {
            return (
              <span key={index}>
                <strong>#{item.value}</strong>
              </span>
            );
          } else if (item.options?.belong == "user") {
            return (
              <span key={index}>
                <strong>@{item.value}</strong>
              </span>
            );
          } else if (item.options?.belong == "everyone") {
            return (
              <span key={index}>
                <strong>@全体成员</strong>
              </span>
            );
          } else if (item.options?.belong == "guild") {
            return (
              <span key={index}>
                <strong>#{item.value}</strong>
              </span>
            );
          } else {
            return <span key={index}></span>;
          }
        } else if (item.type === "ImageFile") {
          return <div key={index}>暂时不支持file图片</div>;
        } else if (item.type === "Link") {
          return <div key={index}>{item.value}</div>;
        } else if (item.type === "BT.group") {
          if (item.options?.template_id) {
            return <div key={index}>暂时不支持BT template_id</div>;
          }
          const groups = item.value;
          if (!Array.isArray(groups)) {
            return <div key={index}>BT.group value is not an array</div>;
          }
          return (
            <div className="flex flex-col gap-3" key={index}>
              {groups.map((group, groupIdx) => {
                const bts = group.value;
                if (!Array.isArray(bts)) {
                  return (
                    <div key={groupIdx}>BT.group value is not an array</div>
                  );
                }
                return (
                  <div key={groupIdx} className="flex flex-wrap gap-2">
                    {bts.map((bt, btIdx) => {
                      const value =
                        typeof bt.value === "string"
                          ? {
                              label: bt.value,
                              title: bt.value,
                            }
                          : bt.value;
                      const autoEnter = bt.options?.autoEnter;
                      const data =
                        typeof bt.options?.data === "string"
                          ? {
                              click: bt.options?.data,
                              confirm: bt.options?.data,
                              cancel: bt.options?.data,
                            }
                          : bt.options?.data;
                      return (
                        <Button
                          key={btIdx}
                          onClick={() => {
                            if (autoEnter) {
                              onSend(data?.click || "");
                            } else {
                              // 上输入框
                              onInput(data?.click || "");
                            }
                          }}
                        >
                          {value.label}
                        </Button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        } else if (item.type === "Markdown") {
          const markdown = item.value;
          return (
            <div key={index}>
              {markdown.map((item, index) => {
                if (item.type === "MD.title") {
                  return <h1 key={index}>{item.value}</h1>;
                } else if (item.type === "MD.blockquote") {
                  return <blockquote key={index}>{item.value}</blockquote>;
                } else if (item.type === "MD.bold") {
                  return <strong key={index}>{item.value}</strong>;
                } else if (item.type === "MD.divider") {
                  return <hr key={index} />;
                } else if (item.type === "MD.text") {
                  return <span key={index}>{item.value}</span>;
                } else if (item.type === "MD.link") {
                  return (
                    <a
                      key={index}
                      href={item.value.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.value.text}
                    </a>
                  );
                } else if (item.type === "MD.image") {
                  const w = item.options?.width || "100";
                  const h = item.options?.height || "100";
                  return (
                    <img
                      key={index}
                      style={{width: `${w}px`, height: `${h}px`}}
                      className="max-w-[15rem] xl:max-w-[20rem] rounded-md"
                      src={item.value}
                      alt="Image"
                    />
                  );
                } else if (item.type === "MD.italic") {
                  return <em key={index}>{item.value}</em>;
                } else if (item.type === "MD.italicStar") {
                  return (
                    <em key={index} className="italic">
                      {item.value}
                    </em>
                  );
                } else if (item.type === "MD.list") {
                  const listItem = item.value;
                  return (
                    <div className="list-disc">
                      {listItem.map((li, liIndex) => {
                        if (typeof li.value === "string") {
                          return <li key={liIndex}>{li.value}</li>;
                        }
                        return (
                          <div key={liIndex}>
                            {li.value.index}.{li.value.text}
                          </div>
                        );
                      })}
                    </div>
                  );
                } else if (item.type === "MD.template") {
                  return <div key={index}>暂时不支持MD.template</div>;
                } else if (item.type === "MD.subtitle") {
                  return <h2 key={index}>{item.value}</h2>;
                } else if (item.type === "MD.strikethrough") {
                  return <s key={index}>{item.value}</s>;
                } else if (item.type === "MD.newline") {
                  return <br key={index} />;
                }
                return;
              })}
            </div>
          );
        }
      })}
      <span className="absolute -bottom-3 whitespace-nowrap right-0 text-[0.5rem]">
        {
          // 时间戳格式化
          dayjs(createAt).format("YYYY-MM-DD HH:mm:ss")
        }
      </span>
    </div>
  );
}

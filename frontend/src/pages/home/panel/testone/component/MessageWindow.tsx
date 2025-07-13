import { useEffect, useRef } from 'react';
// import { Message } from '../typing';
import MessageBubble from './MessageBubble';

export default function MessageWondow({
  message,
  onClickDel,
  onSend = () => {},
  onInput = () => {}
}: {
  message: any[];
  onClickDel: (item: any) => void;
  onSend: (value: string) => void;
  onInput: (value: string) => void;
}) {
  const MessageWindowRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (MessageWindowRef.current) {
      MessageWindowRef.current.scrollTo(
        0,
        MessageWindowRef.current.scrollHeight
      );
    }
  }, [message]);

  return (
    <section
      ref={MessageWindowRef}
      className="flex-1 flex flex-col overflow-auto"
    >
      <section className="flex-1 px-3 py-2 flex gap-4 flex-col ">
        {message.map((item, index) => (
          <div
            key={index}
            className={`flex gap-2 ${
              !item.IsBot ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {
              // 头像地址
            }
            {item.IsBot ? (
              <div className="size-12">BOT</div>
            ) : (
              <img
                className="size-12 rounded-full"
                src={item.UserAvatar}
                alt="Avatar"
              />
            )}
            {
              // 气泡框
            }
            <MessageBubble
              messageBody={item.MessageBody}
              onSend={onSend}
              onInput={onInput}
              createAt={item.createAt}
            />
            {
              // 删除消息
            }
            <div
              onClick={() => onClickDel(item)}
              className="select-none cursor-pointer flex justify-end items-end"
            >
              del
            </div>
          </div>
        ))}
      </section>
    </section>
  );
}

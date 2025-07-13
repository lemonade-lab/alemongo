import { Button } from 'antd';
import { Input } from 'antd';
/**
 * @returns
 */
export default function Setting({
  value,
  onSubmit
}: {
  value: {
    host: string;
    port: string;
  };
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="flex-1 flex flex-col overflow-auto scrollbar">
      <section className=" h-full w-full flex-1 flex flex-col gap-2 py-2 select-none">
        <form
          onSubmit={async event => {
            // 阻止表单默认提交行为
            event.preventDefault();
            try {
              await onSubmit(event);
            } catch {
              console.log('error');
            }
          }}
          className="md:flex-1 flex flex-col gap-2 py-2  px-2 border-[var(--vscode-sidebar-border)]"
        >
          <div className="font-semibold">连接配置</div>
          <Input
            type="text"
            id="host"
            name="host"
            defaultValue={value.host}
            placeholder="host"
          />
          <Input
            type="text"
            id="port"
            name="port"
            defaultValue={value.port}
            placeholder="port"
          />
          <Button htmlType="submit">保存</Button>
        </form>
      </section>
    </section>
  );
}

/**
 * @param param0
 * @returns
 */
const EditBox = ({
  right,
  left,
  rightHeader,
  leftHeader,
}: {
  right: React.ReactNode; // 增加dark，优化布局和色调。
  left: React.ReactNode;
  rightHeader?: React.ReactNode;
  leftHeader?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-1 flex-col xl:flex-row gap-2">
      <div className="flex-1 flex flex-col rounded-md bg-white dark:bg-zinc-900 transition-colors shadow">
        {leftHeader}
        <div className="flex overflow-auto flex-1">
          <div className="flex-1 flex w-[100px] max-h-[120vh] xl:max-h-none">
            {left}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col rounded-md bg-white dark:bg-zinc-900 transition-colors shadow">
        {rightHeader}
        <div className="flex overflow-auto flex-1 max-h-[120vh] xl:max-h-none dark:text-white">
          <div className="flex-1 flex w-[100px]">{right}</div>
        </div>
      </div>
    </div>
  );
};

export default EditBox;

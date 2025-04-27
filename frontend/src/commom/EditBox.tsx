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
  right: React.ReactNode;
  left: React.ReactNode;
  rightHeader?: React.ReactNode;
  leftHeader?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-1 flex-col xl:flex-row gap-2">
      <div className="flex-1 flex flex-col rounded-md bg-white">
        {leftHeader}
        <div className="flex overflow-auto flex-1">
          <div className="flex-1 flex w-[100px] max-h-[120vh] xl:max-h-none">
            {left}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col rounded-md bg-white">
        {rightHeader}
        <div className="flex overflow-auto flex-1 max-h-[120vh] xl:max-h-none">
          <div className="flex-1 flex w-[100px]">{right}</div>
        </div>
      </div>
    </div>
  );
};

export default EditBox;

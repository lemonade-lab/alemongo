/**
 *
 * @param param0
 * @returns
 */
const Form = ({
  selects = [],
  onSubmit = () => {},
}: {
  selects: string[];
  onSubmit: (values: HTMLFormElement) => void;
}) => {
  return (
    <form
      className="space-y-6"
      onSubmit={(
        e: React.FormEvent<HTMLFormElement> & {
          target: HTMLFormElement;
        }
      ) => {
        e.preventDefault();
        if (onSubmit) {
          onSubmit(e.target);
        }
      }}
    >
      <div>
        <label className="block text-sm/6 font-medium text-gray-900">
          账户
        </label>
        <div className="mt-2">
          <input
            name="username"
            id="username"
            onClick={(e) => e.stopPropagation()}
            required
            className="block w-full border rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
        </div>
      </div>
      {
        // 身份选择
      }
      <div>
        <label className="block text-sm/6 font-medium text-gray-900">
          身份
        </label>
        <div className="mt-2">
          <select
            name="identity"
            id="identity"
            onClick={(e) => e.stopPropagation()}
            required
            className="block w-full border rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm "
          >
            {selects.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm/6 font-medium text-gray-900">
          密码
        </label>
        <div className="mt-2">
          <input
            type="password"
            name="password"
            id="password"
            onClick={(e) => e.stopPropagation()}
            required
            className="block w-full border rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm/6 font-medium text-gray-900">
          确认密码
        </label>
        <div className="mt-2">
          <input
            type="password"
            name="confirm_password"
            id="confirm_password"
            onClick={(e) => e.stopPropagation()}
            required
            className="block w-full border rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          创建
        </button>
      </div>
    </form>
  );
};

export default Form;

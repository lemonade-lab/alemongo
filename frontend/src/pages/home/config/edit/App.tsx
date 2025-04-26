import {useNavigate} from "react-router-dom";
import CommonConfgEdit from "../../panel/CommonConfgEdit";
const ConfigEdit = () => {
  const output = "";
  const navigate = useNavigate();
  const onSave = (name: string, value: string) => {
    console.log(name, value);
  };
  return (
    <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
      <div className="h-11  rounded-md flex justify-between   text-white items-start">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          配置编辑
        </h2>
        <button
          type="button"
          onClick={() => {
            navigate("/config/list");
          }}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <svg
            className="mr-1.5 -ml-0.5 size-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
          列表
        </button>
      </div>
      <CommonConfgEdit
        onSave={onSave}
        name={window.location.pathname.split("/")[2]}
        value={output}
      />
    </div>
  );
};

export default ConfigEdit;

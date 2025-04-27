import {
  apiBotConfig,
  apiBotConfigs,
  apiBotConfigsList,
  apiBotConfigUpdate,
} from "@/api";
import {useEffect, useState} from "react";
import CommonConfgEdit from "../../../../commom/ConfgEdit";
import {Button, message, Select} from "antd";

const Conifg = () => {
  const [yamlData, setYamlData] = useState<string>("");

  const [concifgNames, setConfigNames] = useState<string[]>([]);
  useEffect(() => {
    apiBotConfigsList().then((res) => {
      setConfigNames(res);
    });
  }, []);

  useEffect(() => {
    const name = window.location.pathname.split("/")[2];
    apiBotConfig({
      name: name,
    }).then((res) => {
      console.log("res", res);
      setYamlData(res);
    });
  }, []);
  const onSave = (_name: string, value: string) => {
    const name = window.location.pathname.split("/")[2];
    apiBotConfigUpdate({
      name: name,
      content: value,
    })
      .then((res) => {
        console.log("res", res);
        message.success("保存成功");
        setYamlData(value);
      })
      .catch((err) => {
        message.error("保存失败");
        console.log("err", err);
      });
  };
  const [isLoading, setIsLoading] = useState(false);
  const [select, setSelect] = useState<string>("");
  return (
    <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
      <div className="h-11  rounded-md flex justify-between   text-white items-start">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          配置文件
        </h2>
        <div className="flex gap-2">
          <Select
            showSearch
            placeholder="Select a person"
            optionFilterProp="label"
            className="min-w-40"
            loading={isLoading}
            value={select}
            onChange={(value) => setSelect(value)}
            options={concifgNames.map((item) => ({
              label: item,
              value: item,
            }))}
          />
          <Button
            loading={isLoading}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => {
              if (!select) {
                message.warning("请选择配置文件后载入当前配置");
                return;
              }
              setIsLoading(true);
              apiBotConfigs({
                name: select,
              })
                .then((res) => {
                  setYamlData(res);
                  message.success("载入成功");
                })
                .catch((err) => {
                  console.log("err", err);
                  message.error("载入失败");
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }}
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
            引入
          </Button>
        </div>
      </div>
      <CommonConfgEdit value={yamlData} onSave={onSave} />
    </div>
  );
};

export default Conifg;

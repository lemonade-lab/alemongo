import React from "react";
import Box from "@/commom/Box";
import {useNavigate} from "react-router-dom";
import {BorderOutlined} from "@ant-design/icons";
import {message} from "antd";
import classNames from "classnames";

/**
 * @returns
 */
const Apps: React.FC = () => {
  const navigate = useNavigate();

  const closeApps = [
    {
      name: "ALmeonB",
      icon: (
        <img
          className="w-20 h-20 object-contain"
          src="https://alemonjs.com/img/alemon.png"
        />
      ),
      onClick: () => navigate("/bots"),
      open: true,
    },
    {
      name: "QQ MD",
      icon: (
        <img
          className="w-20 h-20 object-contain"
          src="https://qq-web.cdn-go.cn/im.qq.com_new/863ecfe8/img/qq9logo.2a076d03.png"
        />
      ),
      onClick: () => navigate("/apps/qqbot-button-template"),
      open: true,
    },
    {
      name: "Kook MD",
      icon: (
        <img
          className="w-20 h-20 object-contain"
          src="https://developer.kookapp.cn/img/kooklogo.png"
        />
      ),
      onClick: () => {
        window.open(
          "https://www.kookapp.cn/tools/message-builder.html#/card",
          "_blank"
        );
      },
      open: true,
    },
    {
      name: "OneBOT",
      icon: (
        <img
          className="w-20 h-20 object-contain"
          src="https://avatars.githubusercontent.com/u/56297293?s=200&v=4"
        />
      ),
      onClick: () => {
        message.warning("功能正在开发中，敬请期待！");
      },
      open: false,
    },
    {
      name: "NodeJS",
      icon: (
        <img
          className="w-20 h-20 object-contain"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEhklEQVR4AbWXNbDkRhCG/x49NB4z5snlkZk5MjMzM23k7CA2MzPzhs58eXLM9PjpSZr+XaWZamtqZTjq2qnWLEx/9f89q5HgCOPaT859QD1fnMk5Ukz5ztd3/fYGjiAOG+DGz887rSJfoMdp6gnvielJBYjNvnKXf3fPzxuPC8Cd35+3qqi4zntcph5QBVQJ9URZEEVOiANc5t4Ql3W+uOmHzccE4MHPL5s1MVQ8QPJB9Zyl3goHiDjPJzUsKKhBJJMXv7jpl85RAdz20wU3CvECiVVWNAWw7EuimGEN4JxAXK3IZoHrfHbTz28cFsC9v190WlnxBZCnKQEweE0raDmMilANVmhFiJNgx995Y79ml3/QYoskcv9+2awC5TpV3ggKyFhUQ/ZqEClIzL5CDSFCuBQiKJPJG1mWdT64ykDgEOOiV057oEC1CcCNAgFBhFeQFSBCarAzzaEIQAZoyxreo+LGqqr+vOLts17oARgfK9dPTpSzEMIKCQSAtDqWEtFgSQANiKBksAmUWeP7/IunvXjarASAAuzcOgUQIGi1SIYMsaJtrUMabC27aoCgxsEwpic9yhkCg0gBxAFFqTiwfwYCgdWRaANCtpVSoSDBJ4MmAEYINqyamlBQlD0WUFiPfXtzeE9bSGA4EUrAf9tGAcYKKwllaNJ8WusMiPQAwJHISK+KgwfzdHkSFoT93JpQwiRim20aty5jL+RTPumb1AKJLwccODADVaI92NA9wrCJKzbRRiPO5BosARO7EgvgCELhqdi7L09XtpBEGBooTAFTCoCvghJF6Rm9B9sUQEZSNLwjwMGRHFWZLJle2/++9HwqzWYk6r9oKoPCQLsCcARcABEXZN61qeipKjahFUm2TGJDzApQyGBZqkAKkCkgFDpCJvsxNe7rkYakOUAklITNLUSdEIycZBuAQAhkBAoH0fDR/l0FBP8Syb8lkUpMgAEHKkE/K94DoKG4Ai7vN5mmJxQTo20qMNmGBAOIKSIQhLuQhbcWkB4AurALJB8AK0l82rejQG9Isi1tRTZ7hDZP3hIAQykAxDHINNFnsoYIt9iDe8pklWQ7SUMVkbRdxVYyFeiUbdsQMjrY9DCJkf0V1MeFicb3JPLQVDEEg7I1gy3eoRdgYmAEU/3JPaAZ6omRA2Wyu8AWSwgw0Tsm0j53PhMAIwmA23tiB4KRdCulMXbAoyw1qdl2LkjPEOklHEbg8VD3oW5dK0OMzb9u/mP1mas/JDhbIGvQE3aqwfCJGUjEQbtWElQJcxtivxPIBuS4vPtct9vGZnHaS6etguBzkq0gC5YPYGDQxYOqHc/juZDw4fTczF1W6HSfssL4F4AE5EaCLwBYhUYMDjvMXzoAOymrFTKICLS5KvnQr492vzjCBxMDeZHCB0DMigdWzFvaX6ugPlUgQoxoiQ0Dla7/Inp9pACpLcCLBG8AgKETMsxZ1Jc+qITrL6T0D31xV/dYPJq1g1D4OYg1s+b31SA1gLLrPTpf3PRL9zg+Haf9kQ3IC3MX9s1SsPPJtb+sxxHEX3WUaVLftBigAAAAAElFTkSuQmCC"
        />
      ),
      onClick: () => {
        message.warning("功能正在开发中，敬请期待！");
      },
      open: false,
    },
    {
      name: "防火墙",
      icon: (
        <div className="flex-1 flex justify-center text-3xl text-indigo-600 dark:text-indigo-400">
          <BorderOutlined />
        </div>
      ),
      onClick: () => {
        message.warning("防火墙功能正在开发中，敬请期待！");
      },
    },
    {
      name: "Dokcer",
      icon: (
        <img
          className="w-20 h-20 object-contain"
          src="https://www.docker.com/app/uploads/2024/01/icon-docker-square.svg"
        />
      ),
      onClick: () => {
        message.warning("Docker 功能正在开发中，敬请期待！");
      },
    },
    {
      name: "Nginx",
      icon: (
        <img
          className="w-20 h-20 object-contain"
          src="https://nginx.org/img/nginx_logo_dark.png"
        />
      ),
      onClick: () => {
        message.warning("Nginx 功能正在开发中，敬请期待！");
      },
    },
    {
      name: "NVM",
      icon: (
        <img
          className="w-20 h-20 object-contain"
          src="https://avatars.githubusercontent.com/u/49963700?s=200&v=4"
        />
      ),
      onClick: () => {
        message.warning("NVM 功能正在开发中，敬请期待！");
      },
    },
    {
      name: "Git",
      icon: (
        <img
          className="w-20 h-20 object-contain"
          src="https://git-scm.com/images/logo@2x.png"
        />
      ),
      onClick: () => {
        message.warning("Git 功能正在开发中，敬请期待！");
      },
    },
  ];

  return (
    <Box>
      <div className=" p-2 flex flex-col gap-4  flex-1 dark:bg-zinc-900 bg-white transition-colorsmin-h-[300px]">
        <div className="flex flex-wrap gap-4">
          {closeApps.map((app, index) => (
            <div
              key={index}
              className={classNames(
                "min-h-28 min-w-28 sm:min-w-36 sm:min-h-36 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 rounded-xl cursor-pointer flex flex-col items-center justify-between gap-2 shadow hover:shadow-lg transition hover:scale-105",
                {
                  "opacity-50 cursor-not-allowed": !app.open,
                }
              )}
              onClick={app.onClick}
            >
              {app.icon}
              <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                {app.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default Apps;

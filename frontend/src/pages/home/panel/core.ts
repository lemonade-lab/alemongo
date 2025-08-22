// 机器人名
export const getBotName = () => {
  return window.location.pathname.split('/')[2]
}

// git 包名
export const getGitPackageName = () => {
  return window.location.pathname.split('/')[4]
}

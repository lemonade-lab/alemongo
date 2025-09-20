# 常见问题

## 机器人应用仓库拉取出现ssh错误

- 需要记录指定来源

```sh
ssh-keyscan github.com >> ~/.ssh/known_hosts
```

- 确保有生成SSH密钥，并配置
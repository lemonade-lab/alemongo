docker buildx rm gobuilder
docker buildx create --name gobuilder --config ./buildkitd.toml --use --driver-opt network=host
docker buildx inspect --bootstrap
yarn --cwd frontend install --ignore-engines
yarn --cwd frontend build
docker buildx build \
   --platform linux/amd64,linux/arm64 \
   -t ccr.ccs.tencentyun.com/ningmengchongshui/alemongo:latest \
   --push . 
# docker exec -it <name> bash
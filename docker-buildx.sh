docker buildx rm gobuilder
docker buildx create --name gobuilder --config ./buildkitd.toml --use --driver-opt network=host
docker buildx inspect --bootstrap
docker buildx build --platform linux/amd64,linux/arm64 -t ccr.ccs.tencentyun.com/ningmengchongshui/alemongo:latest --push . 
# docker exec -it <name> bash
# docker run -d -p 17187:17187
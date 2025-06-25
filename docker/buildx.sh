docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ningmengchongshui/alemongo:latest \
  .
# docker exec -it <name> bash
# docker run -d -p 17187:17187
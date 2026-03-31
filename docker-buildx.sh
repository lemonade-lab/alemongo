set -eu

docker buildx rm gobuilder
docker buildx create --name gobuilder --config ./buildkitd.toml --use --driver-opt network=host
docker buildx inspect --bootstrap
yarn --cwd frontend install --ignore-engines
yarn --cwd frontend build
VERSION=$(git describe --tags --abbrev=0 2>/dev/null || git rev-parse --short HEAD 2>/dev/null || echo "0.0.1")
NAME="alemongo"
PLATFORMS=${PLATFORMS:-linux/amd64,linux/arm64,linux/arm/v7}
echo "Using VERSION=${VERSION}"
echo "Using PLATFORMS=${PLATFORMS}"
docker buildx build \
   --platform ${PLATFORMS} \
   -t ccr.ccs.tencentyun.com/ningmengchongshui/${NAME}:latest \
   -t ccr.ccs.tencentyun.com/ningmengchongshui/${NAME}:${VERSION} \
   --build-arg VERSION=${VERSION} \
   --push . 
# docker exec -it <name> bash
#!/bin/bash

# Set BUILD_ID
export BUILD_ID=$(date +%Y%m%d)

# Build development images
docker compose --env-file .env -f docker-compose.dev.yml build

# Build production images
docker compose --env-file .env -f docker-compose.yml build

# Tag development images as latest
docker tag vectorinstitute/clinical-ai-monitor:frontend-dev-${BUILD_ID} vectorinstitute/clinical-ai-monitor:frontend-dev-latest
docker tag vectorinstitute/clinical-ai-monitor:backend-dev-${BUILD_ID} vectorinstitute/clinical-ai-monitor:backend-dev-latest

# Tag production images as latest
docker tag vectorinstitute/clinical-ai-monitor:frontend-${BUILD_ID} vectorinstitute/clinical-ai-monitor:frontend-latest
docker tag vectorinstitute/clinical-ai-monitor:backend-${BUILD_ID} vectorinstitute/clinical-ai-monitor:backend-latest

# Push all images (uncomment when ready to push)
# docker push vectorinstitute/clinical-ai-monitor:frontend-dev-${BUILD_ID}
# docker push vectorinstitute/clinical-ai-monitor:backend-dev-${BUILD_ID}
# docker push vectorinstitute/clinical-ai-monitor:frontend-${BUILD_ID}
# docker push vectorinstitute/clinical-ai-monitor:backend-${BUILD_ID}
docker push vectorinstitute/clinical-ai-monitor:frontend-dev-latest
docker push vectorinstitute/clinical-ai-monitor:backend-dev-latest
docker push vectorinstitute/clinical-ai-monitor:frontend-latest
docker push vectorinstitute/clinical-ai-monitor:backend-latest

#!/bin/bash

set -e

GREEN='\033[0;32m'
NC='\033[0m' # No Color

ENV_FILE="mongo-cluster.env"
CLEAN=false
VERBOSE=false

# Usage/help message
show_help() {
  echo -e "${GREEN}MongoDB Replica Set Setup Script${NC}"
  echo
  echo "Usage: $0 [OPTIONS]"
  echo
  echo "Options:"
  echo "  --verbose       Show detailed command output"
  echo "  --clean         Stop containers and delete volumes after setup"
  echo "  --help          Show this help message and exit"
  echo
  echo "Example:"
  echo "  $0 --verbose --clean"
}

# Parse arguments
for arg in "$@"; do
  case $arg in
    --clean)
      CLEAN=true
      ;;
    --verbose)
      VERBOSE=true
      ;;
    --help)
      show_help
      exit 0
      ;;
    *)
      echo -e "${GREEN}❌ Unknown option: $arg${NC}"
      show_help
      exit 1
      ;;
  esac
done

# Helper to run commands conditionally
run_cmd() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${GREEN}    ↳ Running: $*${NC}"
    "$@"
  else
    "$@" &> /dev/null
  fi
}

# Check env file
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${GREEN}❌ Missing $ENV_FILE file! Exiting.${NC}"
  exit 1
fi

# Load environment variables
echo -e "${GREEN}🔄 Loading environment variables: ${NC} $ENV_FILE"
export $(grep -v '^#' "$ENV_FILE" | xargs)
if [ "$VERBOSE" = true ]; then
  echo -e "${GREEN}✅ Environment variables loaded:${NC}"
  grep -v '^#' "$ENV_FILE" | sed 's/^/    /'
else
  echo -e "${GREEN}✅ Environment variables loaded.${NC}"
fi

# Create volume directories
echo -e "${GREEN}📁 Creating MongoDB volume directories...${NC}"
mkdir -p "${MONGO_VOLUME_1}" "${MONGO_VOLUME_2}" "${MONGO_VOLUME_3}" "${MONGO_VOLUME_4}" "${MONGO_VOLUME_5}"
echo -e "${GREEN}✅ Volume directories created:${NC} ${MONGO_VOLUME_1}, ${MONGO_VOLUME_2}, ${MONGO_VOLUME_3}, ${MONGO_VOLUME_4}, ${MONGO_VOLUME_5}"

# Start containers
echo -e "${GREEN}🚀 Starting MongoDB containers...${NC}"
run_cmd docker compose --env-file "$ENV_FILE" up -d
echo -e "${GREEN}✅ MongoDB containers started.${NC}"

# Wait for mongo1 to be ready
echo -e "${GREEN}⏳ Waiting for mongo1 to become ready...${NC}"
sleep 2
run_cmd docker exec mongo1 mongo --eval "print('MongoDB is ready')"
echo -e "${GREEN}✅ mongo1 is ready to accept connections.${NC}"

# Initialize replica set
echo -e "${GREEN}🔧 Initiating replica set...${NC}"
run_cmd docker exec mongo1 mongo --eval "
rs.initiate({
  _id: 'myReplicaSet',
  members: [
    { _id: 0, host: '172.0.0.11:27017' },
    { _id: 1, host: '172.0.0.12:27017' },
    { _id: 2, host: '172.0.0.13:27017' },
    { _id: 3, host: '172.0.0.14:27017' },
    { _id: 4, host: '172.0.0.15:27017' }
  ]
})
"
echo -e "${GREEN}✅ MongoDB replica set initialized successfully!${NC}"

# Clean up if requested
if [ "$CLEAN" = true ]; then
  echo -e "${GREEN}🛑 Cleaning up: stopping containers and removing volumes...${NC}"
  run_cmd docker compose down
  echo -e "${GREEN}🗑️ Removing MongoDB volume directories...${NC}"
  run_cmd sudo rm -rfv "${MONGO_VOLUME_1}" "${MONGO_VOLUME_2}" "${MONGO_VOLUME_3}" "${MONGO_VOLUME_4}" "${MONGO_VOLUME_5}"
  echo -e "${GREEN}✅ Cleanup complete.${NC}"
fi

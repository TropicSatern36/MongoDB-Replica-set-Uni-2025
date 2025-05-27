# MongoDB Replica Set with Docker Compose for E-commerce Marketplace

This repository contains a Docker Compose setup for a **MongoDB distributed replica set** tailored for an e-commerce marketplace. The setup includes five MongoDB nodes configured as a replica set and a Mongo Express web UI for database management.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Usage](#usage)
- [Cleanup LINUX ONLY](#cleanup-LINUX-ONLY)
- [Configuration](#configuration)
- [Connection String](#connection-string)
- [Future Enhancements](#future-enhancements)

---

## Overview

This project deploys a highly available MongoDB replica set to provide redundancy and fault tolerance for your e-commerce application database needs. It uses Docker containers to simplify deployment and management.

---

## Architecture

- **5 MongoDB containers** running MongoDB 5, configured in a replica set named `myReplicaSet`.
- **Mongo Express container** provides a web-based UI to view and manage the MongoDB data.
- All containers share a custom Docker bridge network with fixed IPs for predictable replica set communication.
- Data is persisted using Docker volumes bound to local directories.

---

## Prerequisites

- Docker Engine (20.10+)
- Docker Compose (v2+)
- Bash shell (for running the setup script)

---

## Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/TropicSatern36/MongoDB-Replica-set-Uni-2025-.git
   cd MongoDB-Replica-set-Uni-2025-
   ```

2. Create and edit the environment file `mongo-cluster.env` with your preferred configuration. Example:

   ```env
   MONGO_PORT_1=27017
   MONGO_VOLUME_1=./data/mongo1
   MONGO_PORT_2=27018
   MONGO_VOLUME_2=./data/mongo2
   MONGO_PORT_3=27019
   MONGO_VOLUME_3=./data/mongo3
   MONGO_PORT_4=27020
   MONGO_VOLUME_4=./data/mongo4
   MONGO_PORT_5=27021
   MONGO_VOLUME_5=./data/mongo5

   MONGOEXPRESS_PORT=8081
   MONGOEXPRESS_USER=admin
   MONGOEXPRESS_PASSWORD=adminpass
   ```

3. Run the setup script to start containers and initialize the replica set, or setup manually:

  **Linux setup:**
   ```bash
   chmod +x setup_mongo_cluster.sh
   ./setup_mongo_cluster.sh --verbose
   ```

   **Windows setup:**

   ```bash
   Windows-setup.bat
   ```

   **Manual setup:**
   
   1. Create volumes. (Defined in `mongo-cluster.env`)
   2. Run compose file.
   ```bash
docker compose --env-file mongo-cluster.env up -d
   ```
   3. Initialize the Replica Set
   ```bash
docker exec mongo1 mongo --eval "
rs.initiate({
  _id: 'myReplicaSet',
  members: [
    { _id: 0, host: 'mongo1:27017' },
    { _id: 1, host: 'mongo2:27017' },
    { _id: 2, host: 'mongo3:27017' },
    { _id: 3, host: 'mongo4:27017' },
    { _id: 4, host: 'mongo5:27017' }
  ]
})
"
   ```
---

## Usage

* Access Mongo Express Web UI at: `http://localhost:8081`
* Connect your application to the MongoDB replica set with the following connection string:

  ```
  mongodb://mongo1:27017,mongo2:27017,mongo3:27017,mongo4:27017,mongo5:27017/?replicaSet=myReplicaSet
  ```

---

## Cleanup - **LINUX ONLY**

To stop all containers and remove volumes, run:

```bash
./setup_mongo_cluster.sh --clean
```

This will:

* Stop and remove all MongoDB and Mongo Express containers.
* Delete all persistent volume directories to reset the cluster.

---

## Configuration Details

### docker-compose.yml

* Defines five MongoDB services with static IPs on a custom Docker bridge network.
* Each MongoDB instance runs with the replica set option enabled.
* Mongo Express runs on port configured in `mongo-cluster.env`.

### setup\_mongo\_cluster.sh - **LINUX ONLY**

* Parses options (`--verbose`, `--clean`, `--help`).
* Loads environment variables.
* Creates local directories for MongoDB data volumes.
* Starts MongoDB and Mongo Express containers.
* Waits for MongoDB primary to be ready.
* Initializes the replica set configuration.
* Supports cleaning up the cluster.

---

## Future Enhancements

* Enable authentication with MongoDB users and roles.
* Add TLS/SSL encryption for secure communication.
* Integrate with Kubernetes for scalable production deployment.
* Implement sharding for horizontal scaling.

---





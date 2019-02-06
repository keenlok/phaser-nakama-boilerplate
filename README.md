Instructions:

1. Install Docker
2. Install CockroachDB: `brew install cockroachdb`
   * PostgreSQL is unofficially supported by Nakama
3. Create a `docker-compose.yml` file and paste this:

```
version: '3'
services:
  cockroachdb:
    container_name: cockroachdb
    image: cockroachdb/cockroach:v2.1.3
    command: start --insecure --store=attrs=ssd,path=/var/lib/cockroach/
    restart: always
    volumes:
      - data:/var/lib/cockroach
    expose:
      - "8080"
      - "26257"
    ports:
      - "26257:26257"
      - "8080:8080"
  nakama:
    container_name: nakama
    image: heroiclabs/nakama:2.3.1
    entrypoint:
      - "/bin/sh"
      - "-ecx"
      - >
          /nakama/nakama migrate up --database.address root@cockroachdb:26257 &&
          exec /nakama/nakama --name nakama1 --database.address root@cockroachdb:26257
    restart: always
    links:
      - "cockroachdb:db"
    depends_on:
      - cockroachdb
    volumes:
      - ./:/nakama/data
    expose:
      - "7350"
      - "7351"
    ports:
      - "7350:7350"
      - "7351:7351"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7350/"]
      interval: 10s
      timeout: 5s
      retries: 5
volumes:
  data:
``` 
    
   
   This starts both cockroach DB and Nakama at port 26257 and 7350 respectively. 

4. 
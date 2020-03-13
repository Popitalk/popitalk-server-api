## Setup

- Install [Docker](https://docs.docker.com/install/)
- Initialize docker swarm
	- `docker swarm init`
- Deploy docker containers
	- `docker stack deploy -c postgres.yaml postgres-playnows-dev`
		- File contains a container for admirer, a web interface that can be used to log into postgres. You can delete this if you do not want it.
	- `docker stack deploy -c redis.yaml redis-playnows-dev`
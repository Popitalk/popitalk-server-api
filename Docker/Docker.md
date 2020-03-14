## Setup

- Install [Docker](https://docs.docker.com/install/)
- Deploy docker containers
	- `CD` into each directory
	- Change the password (and optionally the ports) in `docker-compose` for both Redis and Postgres.
		- Postgres Docker compose file contains a container for admirer, a web interface that can be used to log into postgres. You can delete this if you do not want it.
	- `docker-compose up -d`
	- Verify that the services are running
		- `docker container ls`
# reddit-newsletter
A Nodejs service which sends out a personalized daily email newsletter at 8 am containing top 3 most voted posts (within the last 24 hours) from the user’s favorite sub-reddit channels.

# API & Postgres
The following commands will build and run the necessary services (Node API, Liquibase DB Change Management Service, PostGIS Database Server)

Build the docker images
```
docker-compose build
```

Run the services 
```
docker-compose up
```

# Database Migrations through Liquibase
To apply the Database changes:
- In a separate terminal, (and after the command `docker-compose up`)

```
docker-compose run liquibase liquibase update
```

# Interact with the Postgres Server in the Docker Container
- connect to the docker container: 
```
docker exec -it CONTAINER_NAME /bin/bash
```
- connect to the DB within the container (on the command prompt):
```
psql postgres://postgres:postgres@127.0.0.1:5432/reddit_newsletter
```

## Interact with the schemas and tables within the `reddit_newsletter` database
- set default schema: `SET search_path TO reddit_newsletter;`
- see list of tables: `\dt`
- see records of the `user` table: `SELECT * FROM "user";`
- exit psql: `\q`
- exit the contrainer: `exit`

# Interact with the API via Postman
User the provided postman collection to hit various endpoints and check that the data is stored in the database. 

# View the newsletter template
Visit `http://localhost:5000/preview`

# View the API Documentation
Visit `http://localhost:5000/api-docs/`
# reddit-newsletter
A Nodejs service which sends out a personalized daily email newsletter at 8 am containing top 3 most voted posts (within the last 24 hours) from the user’s favorite sub-reddit channels.


## Database and Liquibase
To run the migrations:

```
docker-compose run liquibase liquibase update
```


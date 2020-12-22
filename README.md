## Authentication microservice (work in progress)

### Installation

 [Node.js](https://nodejs.org/) required.
 [MySql](https://yarnpkg.com/) required.



Create .env file and make it match .env.example (Change database user etc)
Create database 

Install the dependencies and devDependencies and start the server.

```sh
$ cd auth-ms
$ yarn 
$ yarn dev
```

Or if you prefer using docker all you need to do is setup env variables and run:

```sh
$ cd auth-ms
$ docker-compose up 
$ 
```

### Usage

This app can be used as a starter template for NodeJS projects or as seperate MICROSERVICE proxy for handling user authentication

#### As stand-alone app

Intro TBA

#### As proxy

Setup proxy for routes that you want to use (currently supports register, login, password recover, password changing and refreshing token)
Sample app can be found at https://github.com/mustjoon/sample-auth-app

.postman-folder contains export files for endpoints to use on Postman (https://www.postman.com/)





### Todo

* Add more mailer options
* Maybe create detailed documentation of contents and  endpoints etc
* Add some kind of logging
* Add unit tests (who needs those?)

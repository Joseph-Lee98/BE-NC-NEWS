# BE-NC-NEWS

Link to the location where the API is hosted below (/api endpoint provides a list of endpoints for users to interact with):

https://be-nc-news-q4om.onrender.com/api

## Front-End Repository and Hosted Application

This project is part of a full-stack application. The front-end is built using React and can be found in the following repository: https://github.com/Joseph-Lee98/FE-NC-NEWS

The live application is hosted on Netlify and can be accessed here: https://joseph-nc-news.netlify.app/

## Summary

Northcoders News API is a backend service designed to provide programmatic access to application data, similar to how services like Reddit expose their data. This project demonstrates the creation of a real-world backend service using Node.js, the Express.js framework, and PostgreSQL. The API allows for the retrieval and manipulation of news articles, comments, users, and other related data, providing a robust platform for a front-end application to interact with. 

For secure user authentication, this API uses bcrypt to handle password hashing. Instead of storing plain text passwords in the database, bcrypt allows passwords to be encrypted before being saved. When a user registers or updates their password, bcrypt creates a cryptographic hash of the password. This ensures that in the unlikely event of a database breach, the original passwords remain secure. When users attempt to log in, their provided password is hashed and compared to the stored hash to verify their identity. Passwords are also hashed with a salt, meaning that users with the same password will have a unique hash, adding an extra layer of protection.

The API also uses JSON Web Tokens (JWT) for user authorization. Upon a successful login or registration, the server generates a JWT for the user, which the client must include in the Authorization header of subsequent requests to access protected routes. The server verifies the token’s validity before granting access to the protected routes.

## Getting Started

### Prerequisites

Ensure you have the following software installed:

Node.js: Minimum version required is v21.7.1

PostgreSQL: Minimum version required is v14.11

### Cloning the Repository

To clone the repository, run:

git clone https://github.com/Joseph-Lee98/BE-NC-NEWS.git

### Installing Dependencies

Install the necessary dependencies using npm:

npm install

### Environment Variables

This application makes use of several environment variables used in the .env files:

PGDATABASE: This sets the database name of the PostgreSQL that the application will connect to.

DATABASE_URL: This variable is used to specify the URL of the PostgreSQL database (only needed in the .env.production file).

JWT_SECRET: The JWT secret key environment variable is used to securely sign and verify tokens, ensuring their integrity without exposing the key in the code.

ADMIN_USERNAME and ADMIN_PASSWORD: These environment variables constitute the username and password for the admin account, and storing these as environment variables minmises risk of unauthorised access.

You will need to create three .env files in the root directory: .env.development, .env.test and .env.production

### Setting up environment files

The below files should be stored in the root directory.

.env.development:

PGDATABASE=nc_news

JWT_SECRET, ADMIN_USERNAME and ADMIN_PASSWORD assigned appropriate values.

.env.test:

PGDATABASE=nc_news_test

JWT_SECRET, ADMIN_USERNAME and ADMIN_PASSWORD assigned appropriate values.

.env.production:

DATABASE_URL, JWT_SECRET, ADMIN_USERNAME and ADMIN_PASSWORD assigned appropriate values.

### Setting up local database

To setup your local database, run:

npm run setup-dbs

### Seeding the Local Database

To seed your local database, run:

npm run seed

## Usage

Once everything is set up, you can start the development server with:

npm start

Visit http://localhost:9090 to see the app in action, or change the port number at the end of the url if using a different port number.

As mentioned, the /api endpoint lists all endpoints, and how to use them. Use this information to interact with the various endpoints.

### Running Tests

In order to facilitate testing and development, we need to initialise husky by running:

npm run prepare

To run the tests, use:

npm test

## Contributing

If you would like to contribute, please follow these guidelines:

1) Fork the repository: Click the "Fork" button at the top right of the repository page on GitHub.

2) Clone your forked repository:
   
git clone https://github.com/yourusername/your-forked-repo.git

cd your-forked-repo

3) Create a new branch:
   
git checkout -b feature-branch

4) Make your changes: Make the necessary changes to the codebase.
   
5) Commit your changes:
    
git commit -m 'Add some feature'

6) Push to the branch:
    
git push origin feature-branch

7) Create a new Pull Request: Go to the original repository on GitHub, and you will see a button to create a pull request from your forked repository.

# Northcoders Ownership Declaration

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by Northcoders

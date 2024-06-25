# Northcoders News API

Link to the location where the API is hosted below (/api endpoint provides a list of endpoints for users to interact with):

https://be-nc-news-d1cb.onrender.com/api

## Summary

Northcoders News API is a backend service designed to provide programmatic access to application data, similar to how services like Reddit expose their data. This project demonstrates the creation of a real-world backend service using Node.js, the Express.js framework, and PostgreSQL. The API allows for the retrieval and manipulation of news articles, comments, users, and other related data, providing a robust platform for a front-end application to interact with.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

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

### Setting Up Environment Variables
You will need to create two .env files in the root directory: .env.development and .env.test

.env.development:
PGDATABASE=nc_news

.env.test:
PGDATABASE=nc_news_test

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

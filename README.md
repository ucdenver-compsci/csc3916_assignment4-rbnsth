# Movie API

This is a web API for managing movies reviews. It allows users to sign up, sign in, create reviews for movies, and retrieve movie information along with their reviews. The API also includes functionality to track events using Google Analytics.

## Student Information

- **Name:** Robin Shrestha
- **Due Date:** March 10, 2024

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- npm

### Installing

1. Clone the repository
```zsh
git clone https://github.com/ucdenver-compsci/csc3916_assignment4-rbnsth.git
```

2. Install dependencies
```zsh
cd current_Repository
npm install
```

3. Start the server
```zsh
npm start
```

The server will start on `localhost:8000`.

## Running the tests

To run the tests, use the following command:

```bash
npm test
```

## Built With

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)


## API Endpoints

### User Authentication

- `POST /signup`: Create a new user account.
- `POST /signin`: Sign in with an existing user account.

### Movies

- `GET /movies`: Get a list of all movies. Add the query parameter `reviews=true` to include reviews for each movie.

### Reviews

- `POST /reviews`: Create a new review for a movie.
- `GET /reviews`: Get a list of all reviews.

## Custom Analytics

The API includes functionality to track events using Google Analytics. When a review is created, an event is sent to Google Analytics with the following information:

- Event Category: Review
- Event Action: /reviews
- Event Label: API Request for Movie Review
- Event Value: 1
- Custom Dimension: Movie Name
- Custom Metric: Requested: Value 1

## Testing

To test the API endpoints, you can use a tool like Postman. Import the provided Postman test collection and run the included tests to verify the functionality of the API.

## Postman Enviroment: 
- Collection: CSCI3916_HW3
- Enviroment: Robin_HW3

## Postman Link
[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/32232262-10b5ffff-a2e6-41de-b61f-e85663456f04?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D32232262-10b5ffff-a2e6-41de-b61f-e85663456f04%26entityType%3Dcollection%26workspaceId%3Dca3c3d1e-eea4-46ea-b8aa-d5044f56b4cf#?env%5BRobin_HW4%5D=W3sia2V5IjoidG9rZW4iLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWUsInR5cGUiOiJkZWZhdWx0Iiwic2Vzc2lvblZhbHVlIjoiSldULi4uIiwic2Vzc2lvbkluZGV4IjowfSx7ImtleSI6ImJhc2ljIiwidmFsdWUiOiJZM1ZmZFhObGNqcGpkVjl5ZFd4bGVnPT0iLCJlbmFibGVkIjp0cnVlLCJ0eXBlIjoiZGVmYXVsdCIsInNlc3Npb25WYWx1ZSI6IlkzVmZkWE5sY2pwamRWOXlkV3hsZWc9PSIsInNlc3Npb25JbmRleCI6MX1d)




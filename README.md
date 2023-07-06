# pricelee-mern-backend

The backend server for Pricelee.
Pricelee is a price tracking service. It allows you to search products from popular online stores and to create alerts for the products you want to track after you sign up. You can use filters to improve the search and get more specific results.

For the moment, pricelee only supports calls to the ebay api. It can search by keywords, category id, and price range.

The authentication model depends on refresh tokens to avoid frequent signin. Refresh token rotation and reuse detection is implemented to block unauthorized requests.

After a user is authenticated, they can add alerts, edit and delete them. They can see the complete list of the alerts they created.

The server runs scheduled tasks to search for a specific product by item id in order to update products tracked by users periodically.

The project is hosted at [https://pricelee-mern-backend.onrender.com/](https://pricelee-mern-backend.onrender.com/)

The frontend repository is located at [https://github.com/KhadidjaArezki/pricelee-mern-frontend]

## Stack

This project uses the MERN stack:

- Mongoose.js (MongoDB): database
- Express.js: backend framework
- React: frontend framework
- Node.js: runtime environment

## Routers

### Users

- Handles signup POST requests.
- Receives a user name and password.
- Creates a new user - from username and hashed password - and stores it in the database.
- Updates the user record with a new refresh token.
- Returns username, token, and an http-only secure cookie with the new refresh token.

### Login

- Handles login POST requests.
- Verifies the validity of the received user credentials.
- Updates refresh token in user table and checks for token reuse cases.
- Returns username, token, and an http-only secure cookie with a new refresh token.

### Tokens

1. GET requests:

- Verifies the validity of the received refresh token.
- Updates refresh token in user table and checks for token reuse cases.
- Returns a valid access token and an http-only secure cookie with a new refresh token.

2. DELETE requests:

- Logs the user out by deleting the current refresh token from the user table.
- Clears the secure cookie holding the current refresh token

### Products

Handles two types of requests:

1. POST requests:

- Receives an object that includes search keywords and filters if provided.
- Sends a request to appropriate third-party market api with search object.
- Returns received search results.

2. GET requests:

- Receives a product identifier.
- Sends a request to appropriate third-party market api to retrieve details about a particular product.
- Returns the product's current price.

### Trackers

Requires an authentication token in request headers. Handles requests to:

1. Retrieve user's tracked products from database.
2. Add a product to the list of user's tracked products.
3. Update the desired price of a tracked product.
4. Delete a product from the list of tracked products.

## Models

### User

Defines a schema with three fields:

- two local fields: username and passwaord hash.
- alerts: array of ObjectId objects, is a reference to the Alert collection.

### Product

Defines a schema with ten fields:

- nine local fields to store product details.
- alerts: array of Alert ObjectId objects, is a reference to the Alert collection.

### Alert

Defines a schema with four fields:

- two local fields to store creation date and desired price.
- two references:
  - product: a reference to the Product collection,
  - user: a reference to the User collection

## Third-Party

The server connects with third-party market APIs through the following modules:

- ebay_api: connects to the ebay API and sends AdvnacesSearch and getItem requests,
- scheduled_products_update: runs scheduled tasks to connect to market APIS in order to
  update products tracked by users.

## Error Handling

The app module uses a errorHandler middleware to which all errors are forwarded.
This middleware is responsible for returning appropriate error messages.

## Authors: Khadidja Arezki

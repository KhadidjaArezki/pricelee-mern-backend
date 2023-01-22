# pricelee-mern-backend

The backend server for Pricelee.
Pricelee is a price tracking service. It allows you to search products from popular online stores and to create alerts for the products you want to track after you sign up. You can use filters to improve the search and get more specific results.

For the moment, pricelee only supports calls to the ebay api. It can search by keywords, category id, and price range.

After a user is authenticated, they can add alerts, edit and delete them. They can see the complete list of the alerts they created.

The server runs scheduled tasks to search for a specific product by item id in order to update products tracked by users periodically.

The project is hosted at [https://web-production-b540a.up.railway.app/](https://web-production-b540a.up.railway.app/)

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
- Upon signup, router redirects to login with user credentials.

### Login

- Handles login POST requests.
- Verifies the validity of the received user credentials.
- Returns username and token.

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

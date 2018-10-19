# Breadmarket
# vol 2
> A Vue.js project

## Start the server
```bash
npm run server
```

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

## API endpoints
#### GET `/breads`:
Returns all breads:
```
[{
    id: Number,
    name: String,
    qty: Number, // 0-100
    price: Number // 0.1 to 10
}, 
...]
```
#### POST `/user`:
Creates a new user with the following request:
```json
  {
    "username": "mySelectedUsername"
  }
```
Returns a new user object:
```
  {
    id: Number,
    items: [{
      id: Number, // id of bread
      qty: Number // Number of item in user's stock
    }],
    name: String,
    credits: Number, // starts at 10
  }
```
#### POST `/buy`
Buys some amount of bread. Request body:
```
  {
   	"userId": Number, // The name of the user making the purchase
   	"purchases": [
   		{
   		  "id": Number, // ID of bread
   		  "qty": Number // How much of the bread you wish to buy
      }, ...
   	]
  }

```
Returns a list of your purchases with their success status, your items and your remaining credits.

#### POST `/sell`
Sells an amount of bread from your inventory:
```
  {
  	"userId": Number,
  	"id": Number, //ID of the bread you want to sell
  	"qty": Number, //Quantity of the bread you want to sell
  }
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

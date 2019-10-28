# Breadmarket
> A Vue.js project

## Develop in Codesandbox
Back-End can be run online:  
https://codesandbox.io/s/cool-dust-mc97i

Front-End can be developped online:  
https://codesandbox.io/s/github/hannesaasamets/breadmarket

## Develop locally
1. Install project dependencies. Presumes you have npm installed (Node Package Manager).
```bash
npm install
```

2. Run the Back-end. Presumes you have Node installed. 
```bash
node server.js
``` 

3. Run the Front-End with hot reload at localhost:8080.
``` bash
npm run dev
```

## API endpoints
#### GET `/breads`:
Returns all breads and time remaining until next update:
```
{
  breads: 
  [{
      id: Number,
      name: String,
      qty: Number, // 0-100
      price: Number // 0.1 to 10
  }, 
  ...],
  nextUpdate: Number // Milliseconds until next update
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

const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const {PORT = 3333} = process.env


const app = express()
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})
app.use(bodyParser.json())

let users = []
let breads = []
let nextDayUpdate = ""

const randomNumberUpTo = (number) => Math.floor(Math.random() * (number + 1))
const randomPriceUpTo = (number) => Math.floor(Math.random() * number * 100) / 100

const loadBreads = () => new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, 'resources/breads.txt'), "utf8", (err, data) => {
        if (err) reject(err)
        resolve(data.split('\n'))
    })
})

const breadsToProducts = (breads) => {
    return breads.map((bread, index) => ({
        id: index + 1,
        name: bread,
        qty: randomNumberUpTo(100),
        price: randomPriceUpTo(10)
    }))
}

const purchaseBread = (userId, breadId, purchaseQuantity) => {
    console.log(`attempting to buy bread#${breadId} in quantity ${purchaseQuantity} for user ${userId}`)
    const [user] = users.filter(u => u.id === userId)
    const [bread] = breads.filter(b => b.id === breadId)
    const canAfford = user.credits > (bread.price * purchaseQuantity)
    const breadInStock = bread.qty > purchaseQuantity

    if (!breadInStock) {
        return { error: 'There\'s not enough of these products!', breadId, userId }
    }
    if (!canAfford) {
        return { error: 'User can\'t afford that product!', userId, breadId }
    }
    bread.qty -= purchaseQuantity;
    user.credits -= (bread.price * purchaseQuantity)
    const [itemInUsersInventory = null] = user.items.filter(item => item.id === breadId)
    if (itemInUsersInventory) {
        itemInUsersInventory.qty += purchaseQuantity;
    } else {
        user.items.push({id: breadId, qty: purchaseQuantity})
    }
    return bread
}
const sellBread = (userId, breadId, saleQuantity) => {
    console.log(`attempting to sell bread#${breadId} in quantity ${saleQuantity} from user ${userId}`)
    const [user] = users.filter(u => u.id === userId)
    const [bread] = breads.filter(b => b.id === breadId)
    const breadInUsersStock = user.items.filter(i => i.id === breadId)[0]
    if (saleQuantity > breadInUsersStock.qty) {
        return {error: 'You don\'t have that many of this item!'}
    }
    const salePrice = bread.price
    bread.qty += saleQuantity
    user.credits +=  salePrice * saleQuantity
    breadInUsersStock.qty -= saleQuantity
    user.items = user.items.filter(i => i.qty > 0)
    return user.items
}

loadBreads().then(breadsToProducts).then(b => breads = b)
nextDayUpdate = Date.now() + 60 * 1000

setInterval(() => {
    console.log('Restocking breads..')
    loadBreads().then(breadsToProducts).then(b => breads = b)
    nextDayUpdate = Date.now() + 60 * 1000
}, 1000 * 60)

app.get('/breads', (req, res) => {
    console.log(nextDayUpdate - Date.now())
    res.json({breads, nextUpdate: nextDayUpdate - Date.now()})
})

app.post('/user', (req, res) => {
    const { username } = req.body
    if (!username) {
        return res.status(500).json({error: 'Must provide username!'})
    }
    const lcUsername = username.toLowerCase()
    const isDuplicateUsername = users.filter(u => u.name.toLowerCase() === lcUsername).length > 0
    if (isDuplicateUsername) {
        return res.status(500).json({error: 'This username is already registered!'})
    }
    const newUser = {
        id: users.length + 1,
        items: [],
        name: username,
        credits: 10
    }
    users.push(newUser)
    res.json(newUser)
})
app.get('/user/:userId', (req, res) => {
    if (!req.params.userId) {
        return res.status(500).json({error: 'Please do not forget to supply an user ID!'})
    }
    const [user = null] = users.filter(u => u.id === Number(req.params.userId))
    if (!user) {
        return res.status(404).json({error: 'User not found!'})
    }
    return res.json(user)
})

app.post('/buy', (req, res) => {
    const { purchases, userId } = req.body
    if (!userId || !users.filter(u => u.id === userId).length) {
        return res.status(403).json({error: 'Invalid user id!'})
    }
    if (!purchases.length) {
        return res.status(403).json({error: 'Come on, add at least something into your cart!'})
    }
    const committedBuys = purchases.map(p => purchaseBread(userId, p.id, p.qty))
    return res.status(200).json({purchases: committedBuys, items: users.filter(u => u.id === userId)[0].items})
})

app.post('/sell', (req, res) => {
    const { id, qty, userId } = req.body
    if (!userId || !users.filter(u => u.id === userId).length) {
        return res.status(403).json({error: 'Invalid user id!'})
    }
    const [user] = users.filter(u => u.id === userId)
    const sold = sellBread(userId, id, qty)
    if (sold.error) {
        res.status(403).json(sold)
    }
    return res.json({msg: 'Sale successful!', credits: user.credits, items: user.items})
})

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})

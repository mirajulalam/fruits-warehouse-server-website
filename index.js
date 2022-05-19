const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 7000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

// middle ware
app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Forbidden Access" })
        }
        req.decoded = decoded;
        next()
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eu99l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {

    try {
        await client.connect();
        const fruitsCollection = client.db('fruits').collection('warehouse');

        // auth 
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "1d"
            });
            res.send({ accessToken })
        })


        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = fruitsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const products = await fruitsCollection.findOne(query)
            res.send(products)
        });


        // handle  quantity update
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
            console.log(updatedQuantity);
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    quantity: updatedQuantity.updatedQuantity
                }
            };
            const result = await fruitsCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        // handle delete product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await fruitsCollection.deleteOne(query)
            res.send(result)
        });

        // post add new product
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await fruitsCollection.insertOne(newProduct);
            res.send(result)
        });

        app.get('/myproducts', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = fruitsCollection.find(query)
                const myItem = await cursor.toArray()
                res.send(myItem)
            }
            else {
                res.status(403).send({ message: "Forbidden Access" })
            }
        })

    }
    finally { }
}
run().catch(console.dir)

app.get('/hero', (req, res) => {
    res.send('hero meets hero ku')
})
app.get('/', (req, res) => {
    res.send('running fruits server')
})


app.listen(port, () => {
    console.log('listening to port', port);
})

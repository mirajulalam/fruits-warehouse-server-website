const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 7000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

// middle ware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eu99l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {

    try {
        await client.connect();
        const fruitsCollection = client.db('fruits').collection('warehouse');
        const productCollection = client.db('fruits').collection('product');

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

        // // handle descrese quantity
        // app.put('/products/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const updateQuantity = req.body;
        //     console.log(updateQuantity);
        //     const filter = { _id: ObjectId(id) }
        //     const options = { upsert: true }
        //     const updateDoc = {
        //         $set: {
        //             quantity: updateQuantity.quantity
        //         }
        //     };
        //     const result = await fruitsCollection.updateOne(filter, updateDoc, options)
        //     res.send(result)
        // })

        // handle increase quantity
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
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

        app.get('/product', async (req, res) => {
            const email = req.query.email;
            console.log(email);
            const query = {};
            const cursor = fruitsCollection.find(query)
            const myItem = await cursor.toArray()
            res.send(myItem)
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

const express = require("express")
const collection = require("./mongo")
const config = require('./config.js');
const cors = require("cors")
const jwt = require('jsonwebtoken');
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use(cors({
    origin: ['*'],
    methods:['GET','POST'],
    credentials: true,
));

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "X-Requested-With,     Content-Type");
    next();
});

app.get("/", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
    res.set('Access-Control-Allow-Origin', '*');

    res.json("hello");

});


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
    res.set('Access-Control-Allow-Origin', '*');

    if (token == null) res.status(401)

    jwt.verify(token, config.jwtSecret, (err, decoded) => {
        req.decoded = decoded;
        if (err) res.status(401).send("Unauthorized");
        else next()
    })
}


app.post('/verify-token', authenticateToken, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).json({ valid: true, decoded: req.decoded });
});


app.post("/login", async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await collection.findOne({ email: email })

        if (user) {
            const passwordMatch = password === user.password
            res.set('Access-Control-Allow-Origin', '*');

            if (passwordMatch) {
                const token = jwt.sign({ userId: email }, config.jwtSecret, { expiresIn: '1h' });
                res.status(200).send({ token });
            } else {
                res.status(401).send({ message: 'Invalid credentials' });
            }
        } else {
            res.status(404).send({ message: 'User not found' });
        }

    }
    catch (e) {
        res.json("fail")
    }

})



app.post("/signup", async (req, res) => {
    const { email, password } = req.body

    const data = {
        email: email,
        password: password
    }

    try {
        const check = await collection.findOne({ email: email })
        res.set('Access-Control-Allow-Origin', '*');

        if (check) {
            res.status(400).send({ error: "failed" });
        }
        else {
            const token = jwt.sign({ userId: email }, config.jwtSecret, { expiresIn: '1h' });

            await collection.insertMany([data])
            res.status(200).send({ token });
        }

    }
    catch (e) {
        res.json("fail")
    }

})

app.listen(8000, () => {
    console.log("port connected");
})


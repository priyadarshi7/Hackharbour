import express  from "express"
import cors from 'cors'
import {dbConnect} from "./connection/dbConnect.js"
import userRouter from "./route/user.route.js"
import foodRouter from "./route/product.route.js"
import 'dotenv/config'
import cartRouter from "./route/cart.route.js"
import orderRouter from "./route/order.route.js"

// app config
const app = express()
const port = process.env.PORT || 4000;


// middlewares
app.use(express.json())
app.use(cors())

// db connection
dbConnect("mongodb://127.0.0.1:27017/jungle")

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/food", foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/cart", cartRouter)
app.use("/api/order",orderRouter)

app.get("/", (req, res) => {
    res.send("API Working")
  });

app.listen(port, () => console.log(`Server started on http://localhost:${port}`))
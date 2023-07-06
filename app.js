const config = require("./utils/config")
const express = require("express")
require("express-async-errors")
const app = express()
const cors = require("cors")
const cookieParser = require("cookie-parser")

const usersRouter = require("./controllers/users")
const loginRouter = require("./controllers/login")
const productsRouter = require("./controllers/products")
const trackersRouter = require("./controllers/trackers")
const tokensRouter = require("./controllers/tokens")
const middleware = require("./utils/middleware")
const logger = require("./utils/logger")
const mongoose = require("mongoose")
const scheduler = require("./third_party/sched_products_update")

logger.info("connecting to", config.MONGODB_URI)

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("connected to database")
  })
  .catch((error) => {
    logger.error("error connecting to database:", error.message)
  })

const corsOption = {
  origin: ["https://pricelee-mern-backend.onrender.com/"],
  credentials: true,
}
app.use(cors(corsOption))

app.use(express.json())
app.use(cookieParser())
app.use(middleware.requestLogger)
app.use("/api/login", loginRouter)
app.use("/api/users", usersRouter)
app.use("/api/products", productsRouter)
app.use("/api/trackers", trackersRouter)
app.use("/api/tokens", tokensRouter)

app.use(express.static("build"))
app.get('*', function(req, res) {
  res.sendFile('index.html', {root: './build/'})
})

if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/testing")
  logger.info("App in test mode")
  app.use("/api/testing", testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

scheduler.update_task.start()

module.exports = app

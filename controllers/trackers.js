const trackersRouter = require('express').Router()
const helper = require('../utils/helpers')
const User = require('../models/user')
const Alert = require('../models/alert')

trackersRouter.get('/', async (request, response) => {
  const token = helper.getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'token missing or invalid'
    })
  }
  const user = await User.findById(decodedToken.id)

  const tracker = await Alert
    .find({user: user._id})
    .populate('product', {
      last_updated: 1
    })
    
    // code missing
  
  response.json(tracker)
})

trackersRouter.post('/', async (request, response) => {
  const body = request.body
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'token missing or invalid'
    })
  }
  const user = await User.findById(decodedToken.id)

  const product = await Product.find({
    identifier: body.productId
  })

  if (product === null) {
    const newProduct = new Product({
      identifier: body.productId,
      name: body.name,
      link: body.link,
      image: body.image,
      initial_price: body.initialPrice,
      current_price: body.initialPrice,
      currency: body.currency,
      store: body.store,
      last_updated: new Date()
    })

    product = await newProduct.save()
  }

  const alert = await Alert.find({
    user: user._id,
    product: product._id
  })

  if (alert !== null) {
    return response.status(409).json({
      error: 'this product has already been added to your tracker'
    })
  }

  const newAlert = new Alert({
    desiredPrice: body.desiredPrice,
    createdAt: body.createdAt,
    user: user._id,
    product: product._id
  })

  await newAlert.save()
  response.status(201)

})

module.exports = trackersRouter
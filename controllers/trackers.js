const trackersRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const helper = require('../utils/helpers')
const Alert = require('../models/alert')
const User = require('../models/user')
const Product = require('../models/product')

trackersRouter.get('/', async (request, response) => {
  const token = helper.getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'token missing or invalid'
    })
  }
  const user = await User.findById(decodedToken.id)

  const alerts = await Alert
    .find({ user: user._id })
    .sort({ created: -1 })
    .populate('product', {
      name         : 1,
      link         : 1,
      image        : 1,
      initial_price: 1,
      current_price: 1,
      currency     : 1,
      store        : 1
    })

  response.json(alerts.map(alert => ({
    alertId         : alert.id,
    productName     : alert.product.name,
    productLink     : alert.product.link,
    productImage    : alert.product.image,
    productPrice    : alert.product.current_price,
    productPriceDiff: ( alert.product.initial_price -
                      alert.product.current_price ),
    desiredPrice    : alert.desired_price,
    productCurrency : alert.product.currency,
    productStore    : alert.product.store
  })))
})


trackersRouter.post('/', async (request, response) => {
  const body = request.body
  const token = helper.getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'token missing or invalid'
    })
  }
  const user = await User.findById(decodedToken.id)

  // Check if tracked product already exists in db
  let product = await Product.findOne({
    identifier: body.productId
  })

  if (product === null) {
    const newProduct = new Product({
      identifier   : body.productId,
      name         : body.productName,
      link         : body.productLink,
      image        : body.productImage || '#',
      initial_price: body.productPrice,
      current_price: body.productPrice,
      currency     : body.productCurrency,
      store        : body.productStore,
      last_updated : new Date()
    })
    product = await newProduct.save()
  }

  const alert = await Alert.findOne({
    user   : user._id,
    product: product._id
  })

  if (alert !== null) {
    return response.status(409).json({
      error: 'this product has already been added to your tracker'
    })
  }

  const newAlert = new Alert({
    desired_price: body.desiredPrice,
    created      : new Date(),
    user         : user._id,
    product      : product._id
  })

  const savedAlert = await newAlert.save()
  user.alerts    = user.alerts.concat(savedAlert._id)
  product.alerts = product.alerts.concat(savedAlert._id)
  await user.save()
  await product.save()

  response.status(201).json({
    alertId         : savedAlert._id,
    productName     : product.name,
    productLink     : product. link,
    productImage    : product.image,
    productPrice    : product.current_price,
    productPriceDiff: ( product.initial_price -
                      product.current_price) ,
    desiredPrice    : savedAlert.desired_price,
    productCurrency : product.currency,
    productStore    : product.store
  })
})


trackersRouter.put('/:id', async (request, response) => {
  const alert = await Alert
    .findById(request.params.id)
    .populate('user', { _id: 1 })

  const token = helper.getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'token missing or invalid'
    })
  }
  if (!( decodedToken.id.toString() === alert.user.id.toString() )) {
    return response.status(401)
  }

  if (alert === null) {
    return response.status(404).end()
  }

  const body = request.body
  const alertToUpdate = {
    desired_price: body.desiredPrice
  }
  const updatedAlert = await Alert.findByIdAndUpdate(
    request.params.id,
    alertToUpdate,
    { new: true }
  )
    .populate('product', {
      name         : 1,
      link         : 1,
      image        : 1,
      initial_price: 1,
      current_price: 1,
      currency     : 1,
      store        : 1
    })

  response.status(200).json({
    alertId         : updatedAlert.id,
    productName     : updatedAlert.product.name,
    productLink     : updatedAlert.product.link,
    productImage    : updatedAlert.product.image,
    productPrice    : updatedAlert.product.current_price,
    productPriceDiff: ( updatedAlert.product.initial_price -
                      updatedAlert.product.current_price ),
    desiredPrice    : updatedAlert.desired_price,
    productCurrency : updatedAlert.product.currency,
    productStore    : updatedAlert.product.store
  })
})


trackersRouter.delete('/:id', async (request, response) => {
  const alert = await Alert
    .findById(request.params.id)
    .populate('user',    { _id: 1 })
    .populate('product', { _id: 1 })

  if (alert === null) {
    return response.status(404).end()
  }

  const token = helper.getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'token missing or invalid'
    })
  }

  if (!( decodedToken.id.toString() === alert.user.id )) {
    return response.status(401)
  }

  const removedAlert = await Alert
    .findByIdAndRemove(request.params.id)
  response.status(200).json(removedAlert)
})

module.exports = trackersRouter
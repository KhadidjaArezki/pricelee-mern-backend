const mongoose = require('mongoose')
const User = require('../models/user')
const Product = require('../models/product')

const alertSchema = new mongoose.Schema({
  desired_price: {
    type: Number,
    required: true
  },
  created: {
    type: Date,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

alertSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

alertSchema.post('findOneAndRemove', async (document, next) => {
  const alertId =  document._id

  const product = await Product.findOne({ alerts: { $in: [alertId] } })
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: product._id },
    { $pull: { alerts: alertId } },
    { new: true }
  )
  const user = await User.findOne({ alerts: { $in: [alertId] } })
  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id },
    { $pull: { alerts: alertId } },
    { new: true }
  )
  next()
})

module.exports = mongoose.model('Alert', alertSchema)
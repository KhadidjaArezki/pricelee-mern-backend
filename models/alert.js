const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');
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

alertSchema.plugin(uniqueValidator)

alertSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
}
)
alertSchema.post('findOneAndRemove', async (document, next) => {
  console.log('Inside post hook')
  const alertId =  document._id
  const user = await User.findOne({ alerts: { $in: [alertId] } })
  await User.findOneAndUpdate(
    user._id,
    { $pull: { alerts: alertId } },
    { new: true }
  )

  const product = await Product.findOne({ alerts: { $in: [alertId] } })
  await Product.findOneAndUpdate(
    product._id,
    { $pull: { alerts: alertId } },
    { new: true }
  )
  next()
})

module.exports = mongoose.model('Alert', alertSchema)
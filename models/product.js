const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

const productSchema = new mongoose.Schema({
  product_identifier: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: true
  },
  initial_price: {
    type: Number,
    required: true
  },
  current_price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  store: {
    type: String,
    required: true
  },
  last_updated: {
    type: Date,
    required: true
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  alerts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert'
    }
  ]
})

productSchema.plugin(uniqueValidator)

productSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Product', productSchema)

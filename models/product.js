const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: [ true, 'Product identifier is required' ],
    unique: true,
  },
  name: {
    type: String,
    required: [ true, 'Product name is required' ],
  },
  link: {
    type: String,
    required: [ true, 'Product link is required' ],
    unique: true,
  },
  image: {
    type: String,
    required: [ true, 'Product image is required' ]
  },
  initial_price: {
    type: Number,
    required: [ true, 'Product price is required' ]
  },
  current_price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: [ true, 'Product currency is required' ]
  },
  store: {
    type: String,
    required: [ true, 'Product store is required' ]
  },
  last_updated: {
    type: Date,
    required: true,
  },
  alerts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert'
    }
  ]
})

productSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Product', productSchema)

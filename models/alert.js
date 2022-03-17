const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

const alertSchema = new mongoose.Schema({
  desiredPrice: {
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

productSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Alert', alertSchema)
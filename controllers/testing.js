const router = require('express').Router()
const Product = require('../models/product')
const User = require('../models/user')

router.post('/reset', async (_, response) => {
  await Product.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

module.exports = router
const Product = require('../models/product')
const productService = require('../services/products')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

const updateProducts = (alerts) => {
  alerts.map(alert => {
    const timeDiff = ((new Date() - alert.product.last_updated) / 1000) / 3600
    if ( timeDiff >= 12) {
      const productId = alert.product.identifier
      const currentPrice = productService.update(productId)
      if (currentPrice === null) {
        currentPrice = alert.product.current_price
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        alert.product._id,
        {
          current_price: currentPrice,
          last_updated: new Date()
        },
        { new: true }
      )

      //code missing
    }
  })
}

module.exports = {
  getTokenFrom,
  updateProducts
}
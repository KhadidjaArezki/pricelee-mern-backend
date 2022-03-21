const cron = require('node-cron')
const logger = require('../utils/logger')
const Product = require('../models/product')
const productService = require('../services/products')

const update_task = cron.schedule('0 37 22 * * *', async () => {
  logger.info('****************************************')
  logger.info('******* Running scheduled task**********')
  logger.info('***** Updating products prices in db ****')
  logger.info(`
              |\\__/,|   ((
              |_ _  |.--.) )
              ( T   )     /
            (((^_(((/(((_/
  `)
  logger.info('****************************************')

  const isNotTracked = (product) => {
    return product.alerts.length === 0
  }
  const products = await Product.find({})

  products.forEach(async (product) => {
    if (isNotTracked(product)) {
      await Product.findByIdAndRemove(product.id)
    }

    const productId = product.identifier
    let currentPrice = await productService.update(productId)
    if (currentPrice === null) {
      currentPrice = product.current_price
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      {
        current_price: currentPrice,
        last_updated: new Date()
      },
      { new: true }
    )
    logger.info('****** Product has been updated *******')
  })
})

module.exports = {
  update_task
}
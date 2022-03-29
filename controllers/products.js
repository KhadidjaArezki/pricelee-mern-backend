const productsRouter = require('express').Router()
const ebayApi = require('../third_party/ebay_api')

productsRouter.post('/', async (request, response) => {
  const data = await ebayApi.searchByKeywords(request.body)
  return response
    .status(200)
    .send(data)
})

productsRouter.get('/:product_id', async (request, response) => {
  const productId = request.params.product_id
  const data = await ebayApi.getProduct(productId)

  return response
    .status(200)
    .send(data)
})

module.exports = productsRouter
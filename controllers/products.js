const productsRouter = require('express').Router()
const ebayApi = require('../utils/ebay_api')

productsRouter.post('/', async (request, response) => {
  // console.log('search terms: ', request.body);
  const body = request.body
  const searchObject = {
    keywords: body.keywords,
    filters: body.filters
  }

  const data = await ebayApi.searchByKeywords(searchObject)
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
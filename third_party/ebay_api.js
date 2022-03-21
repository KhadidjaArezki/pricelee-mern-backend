const logger = require('../utils/logger')
const eBay = require("ebay-node-api")

const ebay = new eBay({
  clientID: "Khadidja-pricetra-SBX-f3633a1dd-428cb13a",
  clientSecret: "SBX-3633a1dd0231-6ac0-42bb-aa93-72a3",
  env: "SANDBOX", // optional default = 'PRODUCTION'
  limit: 4,
  headers: {
    // optional
    "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
  },
  body: {
    grant_type: 'client_credentials',
    scope: 'https://api.ebay.com/oauth/api_scope'
  }
});


const searchByKeywords = async (searchObject, page=1) => {

  const createDataObject = (dataItem) => {
    return {
      productId: dataItem.itemId[0],
      productName: dataItem.title[0],
      productLink: dataItem.viewItemURL[0],
      productImage: dataItem.galleryURL[0],
      productPrice: dataItem.sellingStatus[0].currentPrice[0]['__value__'],
      productCurrency: dataItem.sellingStatus[0].currentPrice[0]['@currencyId'],
      productStore: 'ebay'
    }
  }

  const parseResponse = (data) => {
    if (data[0].ack[0] === 'Failure') {
      logger.error(data[0].errorMessage[0].error[0].message)
      return []
    }
    if (data[0].searchResult[0]['@count'] === 0) {
      logger.info('No matching results');
      return []
    }
    const dataItems =  data[0].searchResult[0].item
    return dataItems.map(dataItem => createDataObject(dataItem))
  }

  const response = await ebay
    .findItemsAdvanced(searchObject)

  return parseResponse(response)
}

const getProduct = async (productId) => {

  const parseResponse = (data) => {
    if (data.errors !== undefined) {
      logger.error(data.errors[0].message)
      return null
    }   
    return data.price.value
  }

  const response = await ebay
    .getAccessToken()
    .then(() => ebay.getItem(`v1|${productId}|0`))
  
  return parseResponse(response)
}

module.exports = {
  searchByKeywords,
  getProduct
}
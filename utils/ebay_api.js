const logger = require('./logger')
const eBay = require("ebay-node-api")

const ebay = new eBay({
  clientID: "Khadidja-pricetra-SBX-f3633a1dd-428cb13a",
  clientSecret: "AgAAAA**AQAAAA**aAAAAA**ScgrYQ**nY+sHZ2PrBmdj6wVnY+sEZ2PrA2dj6wFk4aiDZaCqAWdj6x9nY+seQ**YakFAA**AAMAAA**2JrP0CUR9tOiRzuB7NUgF6SHxaHYQrhBd9zV+UpQJ05/Ed9lZZBcOqFg/4H1qLZD49m0WFqkv7gQP7nNuQSgV/bxGBEwu7Q1MF72nCPO3wLuGiWtky2LMF/Y5JtT/TlykDd3ZYVnh+bfqhSzH6NyTva77L9VyD2DxydPVSXxhbicwgjs66hv7U1Ccdy58IXYUTtfqtqUXpAuLfWrwQXt4EB/cUzvmQua7fqCuWgTy+xsDE6cJammOpJ+qDKXBvjfBcd8B+ylPHgj/+ZgLDdLX3tai3sBhUn9z7ZfCEvfNAasdU0tTXBBoH/Cd1fKBxOFN91mf2KJyX5Vi9RnDSgr2Th1v2GcddQiGfk7hpf05pBwxAIqQVaGZyNXRMURFsKVnraO4bQPDiqBhll5CxAangJGdt86jN8pmBice7uFXElosdm5u7R8wTh3lSV7jjL0rMXpl45NUl6tXlfWP2aVBzeHqus6vuhPSRa9vw1GCTSiIA1N+iffZp8xWIHhrMVRiuY18ZJqSxYW9UNvCrnJqbrHHkrWYv5FZrnqIPcDC5P4MOlvbGEA741XegKSG3t6dy43XNMu5HhMACguK1IHl7xz0IIwTFXrFYxd/dBXypTAEwijxpp6Lw6TSgtcfUxFi9VamRFQ/pVG+XzQh5WHP3AzHojBns64ddsrh3z/MaacTdGgovFU5a8+oCXx+8YTd+n3+O4Tev9ExGIQVVELg4u8Srpo1xL/tzOj1ZXa3ifAXLIApHeDrtYBwNZhlJVy",
  env: "SANDBOX", // optional default = 'PRODUCTION'
  limit: 4,
  headers: {
    // optional
    "X-EBAY-C-MARKETPLACE-ID": "EBAY_US" // For Great Britain https://www.ebay.co.uk
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
      console.log(data[0].errorMessage[0].error[0].message)
      return []
    }
    if (data[0].searchResult[0]['@count'] === 0) {
      console.log('nothing found');
      return []
    }
    console.log('data: ', data[0].searchResult[0].item );
    const dataItems =  data[0].searchResult[0].item
    return dataItems.map(dataItem => createDataObject(dataItem))
  }

  const response = await ebay
    .findItemsAdvanced({
      keywords: searchObject.keywords,
      categoryId: searchObject.filters.categoryId,
      sortOrder: 'PricePlusShippingLowest', //https://developer.ebay.com/devzone/finding/callref/extra/fndcmpltditms.rqst.srtordr.html
      // entriesPerPage: 5,
      pageNumber: page,
      MinPrice: searchObject.filters.minPrice,
      MaxPrice: searchObject.filters.maxPrice
    })

  return parseResponse(response)
}

const getProduct = async (productId) => {
  return await ebay
    .getAccessToken()
    .then(ebay.getSingleItem(productId))

}

module.exports = {
  searchByKeywords,
  getProduct
}
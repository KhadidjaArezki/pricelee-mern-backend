const axios = require('axios')
require('dotenv').config()

const baseUrl = process.env.BASE_PRODUCTS_URL

const update = async (productId) => {
  const response = await axios.get(`${baseUrl}/${productId}`)
  return response.data
}

module.exports = {
  update
}
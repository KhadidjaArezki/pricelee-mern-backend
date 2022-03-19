const axios = require('axios')
const baseUrl = '/api/products'

const update = async (productId) => {
  const response = await axios.get(`${baseUrl}/${productId}`)
  return response.data
}

module.exports = {
  update
}
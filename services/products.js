const axios = require('axios')
const baseUrl = 'http://localhost:3003/api/products'

const update = async (productId) => {
  const response = await axios.get(`${baseUrl}/${productId}`)
  return response.data
}

module.exports = {
  update
}
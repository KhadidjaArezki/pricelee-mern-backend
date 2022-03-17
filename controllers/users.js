const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (_, response) => {
  const users = await User
    .find({}).populate('alerts', {
      alert_id: 1,
      product_name: 1,
      product_link: 1,
      product_price: 1,
    })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body
  // if (body.password.length < 3) {
  //   return response.status(400).json({
  //     error: 'password must be at least three characters long'
  //   })
  // }
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    passwordHash,
  })

  const savedUser = await user.save()
  response.json(savedUser)
})

module.exports = usersRouter
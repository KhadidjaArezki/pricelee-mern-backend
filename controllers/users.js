const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (_, response) => {
  const users = await User
    .find({}).populate('products', {
      name: 1,
      link: 1,
      price: 1,
    })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body 
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
const logger = require('./logger')

const requestLogger = (request, _, next) => {
  logger.info('---')
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (_, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, _, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  else if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message
    })
  } 
  else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }
  else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }

  next(error)
}

const tokenExtractor = (request, _, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  next()
}

// const userExtractor = (request, response, next) => {
  
// }

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor
}
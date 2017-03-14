module.exports = function (level) {

  const winston = require('winston')

  let logger = new(winston.Logger)({
    transports: [
      // colorize the output to the console
      new(winston.transports.Console)({
        colorize: true,
        level: level || 'debug'
      })
    ]
  })

  let sep = `*****************************************`

  return {
    logger,
    sep
  }
}
// const logger = require('../services/logger.service')
const authService = require('../services/auth.service')

async function requireAuth(req, res, next) {
  if (!req?.cookies?.loginToken) return res.status(401).send('Not Authenticated')
  const isCodeValid = authService.decryptXor(req.cookies.code)
  console.log(isCodeValid)
  if (!isCodeValid) return res.status(401).send('Not Authenticated')
  next()
}


module.exports = {
  requireAuth,
}

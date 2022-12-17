const Cryptr = require('cryptr')

const logger = require('./logger.service')

const key = process.env.COUPON_KEY || 'Shalulim4Ever'

function encryptXor() {
  var result = '';
  var text = new Date()
  text.setDate(text.getDate() + 31)
  text = text.getTime() + ''
  for (var i = 0; i < text.length && key.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
}

function decryptXor(code) {
  var result = '';
  const text = atob(code)
  for (var i = 0; i < text.length && key.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  console.log(result)
  if (+result > Date.now()) return true
  else return false
}


module.exports = {
  encryptXor,
  decryptXor,
}

'use strict'

module.exports = function (cuk) {
  return {
    model: 'role:permission',
    middleware: 'auth:jwt, auth:basic, auth:bearer, auth:check, role:check',
    method: 'find, findOne'
  }
}

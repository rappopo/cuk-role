'use strict'

module.exports = function (cuk) {
  const { ac } = cuk.pkg.role.lib
  return {
    middleware: 'auth:jwt, auth:basic, auth:bearer, auth:check, role:check',
    method: {
      find: ctx => {
        const grants = ac.getGrants()
        return grants
      }
    }
  }
}

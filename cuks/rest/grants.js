'use strict'

module.exports = function (cuk) {
  const { helper } = cuk.pkg.core.lib

  return {
    middleware: 'auth:jwt, auth:basic, auth:bearer, auth:check',
    method: {
      findOneSelf: ctx => {
        const grants = helper('role:get').getGrants()
        return { success: true, data: grants }
      }
    }
  }
}

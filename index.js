'use strict'

const AccessControl = require('accesscontrol')

module.exports = function (cuk) {
  return {
    id: 'role',
    level: 7,
    lib: {
      AccessControl: AccessControl,
      ac: new AccessControl()
    }
  }
}

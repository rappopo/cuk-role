'use strict'

module.exports = function (cuk) {
  const { helper } = cuk.pkg.core.lib

  return (ac) => {
    const access = ac.grant('admin')
    helper('role:addRestAccess')(access, 'role', 'group')
      .readAny('rest:role:findOneSelf:grants')
      .readAny('rest:role:find:role')
      .readAny('rest:role:findOne:role')
  }
}

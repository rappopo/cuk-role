'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (route, role = [], ctx, next) => {
    const [method, resource] = _.drop(route.name.split(':'))
    let action
    switch (method) {
      case 'find':
      case 'findOne':
      case 'findOneSelf': action = 'read'; break
      case 'create': action = 'create'; break
      case 'replace':
      case 'replaceSelf':
      case 'modify':
      case 'modifySelf': action = 'update'; break
      case 'remove': action = 'delete'; break
    }
    if (!action) throw helper('core:makeError')('Unknown role action')
    action += _.upperFirst(_.get(route, '_role.resourcePossession'))
    let permission
    _.each(role, r => {
      const p = helper('role:get').can(r)[action]('rest:' + resource)
      if (p) {
        permission = p
        return undefined
      }
    })
    if (permission && permission.granted) {
      ctx.auth.permission = permission
      return permission
    }
  }
}

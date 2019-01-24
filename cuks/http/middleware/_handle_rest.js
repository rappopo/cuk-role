'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (route, role = [], ctx, next) => {
    const names = _.drop(route.name.split(':'))
    let action
    switch (names[1]) {
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
    if (!action) throw helper('core:makeError')('unknown_role_action')
    action += _.upperFirst(_.get(route, '_options.role.resourcePossession'))
    let permission
    _.each(role, r => {
      const p = helper('role:get').can(r)[action](route.name)
      if (p && p.granted) {
        permission = p
        return undefined
      }
    })
    if (permission) {
      ctx.auth.permission = permission
      return permission
    }
  }
}

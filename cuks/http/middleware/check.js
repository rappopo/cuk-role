'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const handleRest = require('./_handle_rest')(cuk)

  return () => {
    return async (ctx, next) => {
      if (!ctx.auth) {
        throw helper('core:makeError')({
          status: 401,
          msg: 'User authentication required'
        })
      }
      const cfg = _.get(cuk.pkg.role, 'cfg.common', {})
      const group = await helper('model:findOne')('role:group', ctx.auth.user.group_id)
      if (!group.data.active) {
        throw helper('core:makeError')({
          msg: 'Group disabled/inactive',
          status: 403
        })
      }
      ctx.auth.isAdmin = ctx.auth.isAdmin || (group.data.name === cfg.adminName)
      ctx.auth.group = _.pick(group.data, _.concat([helper('model:getIdColumn')('role:group')],
        cfg.exportedColumns.group || []))

      if (!ctx._matchedRouteName) throw helper('core:makeError')('Unknown route')
      // if (ctx.auth.isAdmin) return next()

      const route = ctx.router.route(ctx._matchedRouteName)
      if (_.get(route, '_role.customHandling')) return next()
      const roles = _.uniq(_.concat(group.data.role || [], ctx.auth.user.role || []))
      if (ctx.router.pkgId === 'rest' && handleRest(route, roles, ctx, next)) return next()
      throw helper('core:makeError')({
        msg: 'Access denied',
        status: 403
      })
    }
  }
}

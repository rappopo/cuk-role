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
      const cfg = helper('core:config')('role')
      if (!ctx.auth.user.group_id) {
        throw helper('core:makeError')({
          msg: 'group_disabled_or_inactive',
          status: 403
        })
      }
      const group = await helper('model:findOne')('role:group', ctx.auth.user.group_id)
      if (!group.data.active) {
        throw helper('core:makeError')({
          msg: 'group_disabled_or_inactive',
          status: 403
        })
      }
      ctx.auth.isAdmin = ctx.auth.isAdmin || (group.data.name === cfg.adminName)
      ctx.auth.group = _.pick(group.data, _.concat([helper('model:getIdColumn')('role:group')],
        cfg.exportedColumns.group || []))

      if (!ctx._matchedRouteName) throw helper('core:makeError')('unknown_route')
      // if (ctx.auth.isAdmin) return next()

      const route = ctx.router.route(ctx._matchedRouteName)
      const handler = _.get(route, '_options.role.handler')
      if (handler) {
        const passed = await Promise.resolve(handler(ctx))
        if (passed) return next()
        throw helper('core:makeError')({
          msg: 'access_denied',
          status: 403
        })
      } else {
        const roles = _.uniq(_.concat(group.data.role || [], ctx.auth.user.role || []))
        if (ctx.router.pkgId === 'rest' && handleRest(route, roles, ctx, next)) return next()
        throw helper('core:makeError')({
          msg: 'access_denied',
          status: 403
        })
      }
    }
  }
}

'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  const getRoles = () => {
    let roles = helper('role:get').getRoles()
    return _.map(roles, p => {
      return { _id: p, name: _.startCase(p) }
    })
  }

  return {
    middleware: 'auth:jwt, auth:basic, auth:bearer, auth:check, role:check',
    options: { role: { resourcePossession: 'own' } },
    method: {
      find: {
        handler: async ctx => {
          const result = await helper('model:tempDataset')({ name: ctx.state.reqId }, getRoles(), ctx)
          return result
        }
      },
      findOne: {
        handler: async ctx => {
          const role = _.find(getRoles(), { _id: ctx.params.id })
          if (!role) throw helper('core:makeError')({ msg: 'record_not_found', status: 404 })
          return {
            success: true,
            data: role
          }
        }
      }
    }
  }
}

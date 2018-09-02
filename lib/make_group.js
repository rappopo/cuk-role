'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const adminName = _.get(cuk.pkg.role, 'cfg.common.adminName')

  const createAdmin = domain => {
    return new Promise((resolve, reject) => {
      let group, user
      helper('model:create')('role:group', {
        name: adminName,
        domain: domain,
        active: true,
        role: ['auth:admin']
      })
        .then(result => {
          group = result.data
          return helper('model:find')('auth:user', {
            query: {
              username: 'admin',
              domain: domain
            },
            limit: 1
          })
        })
        .then(result => {
          if (result.data.length === 0) return true
          user = result.data[0]
          return helper('model:update')('auth:user', user[helper('model:getIdColumn')('auth:user')], {
            group_id: group[helper('model:getIdColumn')('role:group')]
          })
        })
        .then(result => {
          resolve(true)
        })
        .catch(reject)
    })
  }

  const injectSingle = () => {
    return new Promise((resolve, reject) => {
      const model = helper('model:get')('role:group')
      model.find({
        query: {
          name: adminName
        }
      })
        .then(result => {
          if (result.data.length > 0) return true
          return createAdmin('n.a')
        })
        .then(() => {
          resolve(true)
        })
        .catch(reject)
    })
  }

  const injectMulti = () => {
    return new Promise((resolve, reject) => {
      const model = helper('model:get')('role:group')
      let domains = []
      helper('model:find')('site:profile', { limit: 1000 })
        .then(result => {
          domains = _.map(result.data, 'domain')
          return model.find({
            query: {
              domain: { $in: domains },
              name: adminName
            },
            limit: 1000
          })
        })
        .then(result => {
          const doms = _.map(result.data, 'domain')
          const targetDomains = _.difference(domains, doms)
          return Promise.map(targetDomains, d => {
            return createAdmin(d)
          })
        })
        .then(result => {
          resolve(true)
        })
    })
  }

  return new Promise((resolve, reject) => {
    let prom = cuk.pkg.site ? injectMulti : injectSingle
    prom().then(resolve).catch(reject)
  })
}

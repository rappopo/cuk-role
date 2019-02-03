'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const { ac } = cuk.pkg.role.lib

  return new Promise((resolve, reject) => {
    helper('core:trace')('|  |- Writing default groups...')
    const access = {}
    _.forOwn(ac.getGrants(), (v, k) => {
      const names = helper('core:splitName')(k, true)
      if (_.has(access, names[1])) access[names[1]].push(k)
      else access[names[1]] = [k]
    })
    let groups = []
    Promise.resolve().then(() => {
      if (!cuk.pkg.site) return false
      return helper('model:find')('site:profile', { limit: 1000 })
    }).then(result => {
      const data = []
      if (result) {
        _.each(result.data, d => {
          _.forOwn(access, (v, g) => {
            data.push({
              name: g,
              role: v,
              site: d[helper('model:getIdColumn')('site:profile')],
              active: true
            })
          })
        })
      } else {
        _.forOwn(access, (v, g) => {
          data.push({
            name: g,
            role: v,
            site: 'default',
            active: true
          })
        })
      }
      return Promise.map(data, d => {
        return helper('model:create')('role:group', d)
      })
    }).then(result => {
      return helper('model:find')('role:group', { query: { name: 'admin' }, limit: 1000 })
    }).then(result => {
      groups = result.data
      return helper('model:find')('auth:user', { query: { username: 'admin' }, limit: 1000 })
    }).then(result => {
      return Promise.map(result.data, d => {
        const idColUser = helper('model:getIdColumn')('auth:user')
        const idColGroup = helper('model:getIdColumn')('role:group')
        const group = _.find(groups, { site_id: d.site_id })
        return helper('model:update')('auth:user', d[idColUser], {
          group_id: group[idColGroup]
        })
      })
    }).then(result => {
      return helper('model:find')('role:group', { query: { name: 'guest' }, limit: 1000 })
    }).then(result => {
      groups = result.data
      return helper('model:find')('auth:user', { query: { username: 'guest' }, limit: 1000 })
    }).then(result => {
      return Promise.map(result.data, d => {
        const idColUser = helper('model:getIdColumn')('auth:user')
        const idColGroup = helper('model:getIdColumn')('role:group')
        const group = _.find(groups, { site_id: d.site_id })
        return helper('model:update')('auth:user', d[idColUser], {
          group_id: group[idColGroup]
        })
      })
    }).then(result => {
      resolve(true)
    }).catch(reject)
  })
}

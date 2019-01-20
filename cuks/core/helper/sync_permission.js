'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const { ac } = cuk.pkg.role.lib
  return () => {
    return new Promise((resolve, reject) => {
      const model = helper('model:get')('role:permission')
      model.find({ limit: 10000 }).then(result => {
        const ids = _.map(result.data, '_id')
        if (_.isEmpty(ids)) return true
        return model.bulkRemove(ids)
      }).then(result => {
        let perms = ac.getRoles()
        perms = _.map(perms, p => {
          return { _id: p, name: _.startCase(p) }
        })
        return helper('model:bulkCreate')('role:permission', perms)
      }).then(resolve).catch(reject)
    })
  }
}

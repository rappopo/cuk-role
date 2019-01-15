'use strict'

const AccessControl = require('accesscontrol')
const ac = new AccessControl()

module.exports = function (cuk) {
  const { _, helper, path } = cuk.pkg.core.lib
  const pkg = cuk.pkg.role

  let roles = {}

  const mergePermissions = opt => {
    let grants = ac.getGrants()
    _.forOwn(grants, (v, k) => {
      _.forOwn(v, (v1, k1) => {
        if (k1 === '$extend') {
          _.each(v1, (v2, i) => {
            v1[i] = opt.pkg.id + ':' + v2
          })
        }
      })
      grants[opt.pkg.id + ':' + k] = v
      delete grants[k]
    })
    roles = helper('core:merge')(roles, grants)
    helper('core:trace')('|  |  |- %s => %d permission(s)', opt.pkg.id, _.keys(grants).length)
  }

  const getPermissions = opt => {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(opt.file)
      const ext = path.extname(opt.file)
      const base = path.basename(opt.file, ext)

      helper('core:configLoad')(dir, base)
        .then(result => {
          if (_.isEmpty(result)) return resolve(true)
          ac.setGrants(result)
          mergePermissions(opt)
          ac.reset()
          resolve(true)
        })
        .catch(reject)
    })
  }

  const getBuilder = opt => {
    return new Promise((resolve, reject) => {
      if (path.basename(opt.file) !== 'builder.js') return resolve(true)
      Promise.resolve(require(opt.file)(cuk)(ac))
        .then(() => {
          mergePermissions(opt)
          ac.reset()
          resolve(true)
        })
    })
  }

  return new Promise((resolve, reject) => {
    helper('core:trace')('|  |- Loading permission...')
    helper('core:bootFlatAsync')({
      pkgId: 'role',
      ext: helper('core:configFileExt')(),
      name: 'permission',
      action: getPermissions
    })
      .then(() => {
        return helper('core:bootFlatAsync')({
          pkgId: 'role',
          ext: '.js',
          name: '',
          action: getBuilder
        })
      })
      .then(() => {
        if (!_.isEmpty(roles)) {
          pkg.lib.ac.setGrants(roles)
          pkg.lib.ac.lock()
        }
        resolve(true)
      })
      .catch(reject)
  })
}

'use strict'

module.exports = function (cuk) {
  const { _, helper, path } = cuk.pkg.core.lib
  const { AccessControl } = cuk.pkg.role.lib
  const pkg = cuk.pkg.role

  let roles = {}

  const mergePermissions = (ac, opt) => {
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
    ac.reset()
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
          const ac = new AccessControl()
          ac.setGrants(result)
          mergePermissions(ac, opt)
          resolve(true)
        })
        .catch(reject)
    })
  }

  const getBuilder = opt => {
    return new Promise((resolve, reject) => {
      if (path.basename(opt.file) !== 'builder.js') return resolve(true)
      const ac = new AccessControl()
      Promise.resolve().then(() => {
        return Promise.resolve(require(opt.file)(cuk)(ac))
      }).then(() => {
        mergePermissions(ac, opt)
        resolve(true)
      }).catch(err => {
        reject(err)
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
        if (_.isEmpty(roles)) return true
        pkg.lib.ac.setGrants(roles)
        pkg.lib.ac.lock()
        resolve(true)
      })
      .catch(reject)
  })
}

'use strict'

module.exports = function (cuk) {
  const { _ } = cuk.pkg.core.lib

  return (access, pkgName, resource, attribs, possession) => {
    possession = _.upperFirst(possession) || 'Any'
    access['create' + possession](`rest:${pkgName}:create:${resource}`, attribs || ['*'])
    access['read' + possession](`rest:${pkgName}:find:${resource}`, attribs || ['*'])
    access['read' + possession](`rest:${pkgName}:findOne:${resource}`, attribs || ['*'])
    access['update' + possession](`rest:${pkgName}:replace:${resource}`, attribs || ['*'])
    access['update' + possession](`rest:${pkgName}:modify:${resource}`, attribs || ['*'])
    access['delete' + possession](`rest:${pkgName}:remove:${resource}`, attribs || ['*'])
    return access
  }
}

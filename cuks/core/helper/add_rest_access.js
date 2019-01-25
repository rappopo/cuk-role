'use strict'

module.exports = function (cuk) {
  return (access, pkgName, resource, attribs) => {
    access
      .createAny(`rest:${pkgName}:create:${resource}`, attribs || ['*'])
      .readAny(`rest:${pkgName}:find:${resource}`, attribs || ['*'])
      .readAny(`rest:${pkgName}:findOne:${resource}`, attribs || ['*'])
      .updateAny(`rest:${pkgName}:replace:${resource}`, attribs || ['*'])
      .updateAny(`rest:${pkgName}:modify:${resource}`, attribs || ['*'])
      .deleteAny(`rest:${pkgName}:remove:${resource}`, attribs || ['*'])
    return access
  }
}

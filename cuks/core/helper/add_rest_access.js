'use strict'

module.exports = function (cuk) {
  return (access, pkgName, resource) => {
    access
      .createAny(`rest:${pkgName}:create:${resource}`)
      .readAny(`rest:${pkgName}:find:${resource}`)
      .readAny(`rest:${pkgName}:findOne:${resource}`)
      .updateAny(`rest:${pkgName}:replace:${resource}`)
      .updateAny(`rest:${pkgName}:modify:${resource}`)
      .deleteAny(`rest:${pkgName}:remove:${resource}`)
    return access
  }
}

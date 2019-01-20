'use strict'

module.exports = function (cuk) {
  return (ac) => {
    ac
      .grant('admin')

      .createAny('rest:group')
      .readAny('rest:group')
      .updateAny('rest:group')
      .deleteAny('rest:group')

      .createAny('route:group')
      .readAny('route:group')
      .updateAny('route:group')
      .deleteAny('route:group')

      .readAny('rest:grant')
      .readAny('rest:permission')
      .readAny('route:permission')
  }
}

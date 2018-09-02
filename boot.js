'use strict'

module.exports = function (cuk) {
  return new Promise((resolve, reject) => {
    require('./lib/make_permission')(cuk)
      .then(() => {
        return require('./lib/make_group')(cuk)
      })
      .then(() => {
        resolve(true)
      })
      .catch(reject)
  })
}

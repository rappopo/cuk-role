'use strict'

module.exports = function (cuk) {
  return new Promise((resolve, reject) => {
    require('./lib/make_permission')(cuk)
      .then(() => {
        if (!process.env.REBUILD) return Promise.resolve(true)
        return require('./lib/make_group')(cuk)
      })
      .then(() => {
        resolve(true)
      })
      .catch(reject)
  })
}

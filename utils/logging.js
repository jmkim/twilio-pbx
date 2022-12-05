module.exports = {
  log: (group, status, text) => {
    console.log(`${group}\t${status}\t${text}`)
  },

  error: (group, status, text) => {
    console.error(`${group}\t${status}\t${text}`)
  }
}

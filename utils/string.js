module.exports = {
  strToArray: function (string) {
    return string.split(',')
  },

  strToBool: function (string) {
    switch (string.toLowerCase()?.trim()) {
      case 'false':
      case 'no':
      case '0':
      case '':
        return false
      default:
        return true
    }
  }
}

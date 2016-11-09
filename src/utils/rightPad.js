module.exports = function rightPad (string, total) {
  var i = -1
  var remaining = total - string.length
  while (++i < remaining) {
    string += ' '
  }
  return string
}

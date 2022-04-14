module.exports = function () {
  this.getWorld = function (guild, worldName) {
    return guild.worlds.find(world => world.name === worldName)
  }
}

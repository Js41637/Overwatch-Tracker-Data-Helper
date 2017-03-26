var OWI = angular.module('OWI', ['ui.bootstrap'])

OWI.config(['$compileProvider', function($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}])

OWI.controller('MainCtrl', function() {
  this.rawData = ''
  this.parsedData = []
  this.types = ["Icon", "Skin", "Emote", "Spray", "Voice Line", "Heroic Intro", "Victory Pose"]
  this.qualities = ["Common", "Rare", "Epic", "Legendary"]
  this.newItem = {
    name: '',
    hero: false,
    event: false,
    type: false,
    quality: false
  }

  // Check all da shiz to see if we can add an item
  this.canAddItem = () => this.newItem.name.length > 2 && this.newItem.hero !== false && this.newItem.event && this.newItem.type && this.newItem.quality && this.rawData

  this.addItem = () => {
    let { name, hero, event, type, quality } = this.newItem
    let itemName = `${name} (${quality} ${type})`
    this.parsedData[hero].items[event].push(itemName)
    this.newItem.name = '' // reset item name on page
    this.updateRawData()
  }

  const names = {
    type: 'types',
    quality: 'qualities'
  }

  this.selectNextOption = ({ keyCode }, option) => {
    var num = keyCode == 40 ? 1 : keyCode == 38 ? -1 : undefined
    if (!num) return
    var currentOption = this[names[option]]
    var currentIndex = currentOption.indexOf(this.newItem[option])
    var nextItem = currentIndex + num > currentOption.length - 1 ? 0 : currentIndex + num < 0 ? currentOption.length - 1 : currentIndex + num
    this.newItem[option] = currentOption[nextItem]
  }

  this.selectNextHero = () => {
    let next = this.newItem.hero + 1
    this.newItem.hero = next = (next > this.parsedData.length - 1) ? 0 : next
  }

  const itemGroupRegex = /\t(.+)(\n\t{2}.+)*/g
  this.onChange = () => {
    console.log("On Change")
    this.parsedData = []
    let heroGroups = this.rawData.split('\n\n')
    heroGroups.forEach(data => {
      let name = data.split('\n')[0].split(' ').slice(2).join(' ') // name of hero
      let rawItems = data.split('\n').slice(1).join('\n') // remove the first line containing name of hero
      var items = {}, itemMatch;
      while ((itemMatch = itemGroupRegex.exec(rawItems)) !== null) { // Regex each group and it's items
        items[itemMatch[1].split(' ')[0]] = itemMatch[0].split('\n').slice(1).map(a => a.trim())
      }
      this.parsedData.push({ name, items })
    })
    this.parsedData = this.parsedData.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name ) return 1;
      return 0;
    })
  }

  this.addEvent = event => {
    if (!this.parsedData.length || !event || !event.length) return
    this.parsedData.forEach((hero, i) => {
      this.parsedData[i].items[event] = []
    })
  }

  this.updateRawData = () => {
    var out = ""
    this.parsedData.forEach(hero => {
      out += `Cosmetics for ${hero.name}\n`
      Object.keys(hero.items).forEach(group => {
        out += `\t${group} (${hero.items[group].length} items)\n`
        out += hero.items[group].map(item => `\t\t${item}\n`).join('')
      })
      out += '\n'
    })
    this.rawData = out.replace(/\n$/, '')
  }
})

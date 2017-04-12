var OWI = angular.module('OWI', ['ui.bootstrap'])

OWI.config(['$compileProvider', function($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}])

OWI.controller('MainCtrl', function() {
  this.rawData = ''
  this.parsedData = {}
  this.newEvents = []
  this.events = []
  this.heroes = []
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
    if (!this.parsedData[hero].items[event]) this.parsedData[hero].items[event] = []
    this.parsedData[hero].items[event].push(itemName)
    this.newItem.name = '' // reset item name on page
    this.updateRawData()
    jumpToHero(hero)
  }

  const jumpToHero = hero => {
    var position = this.rawData.split('\n').findIndex(a => a.trim() == `Cosmetics for ${hero}`)
    var ta = document.querySelector("textarea");
    var lineHeight = 15;
    var jump = (position - 1) * lineHeight;
    ta.scrollTop = jump;
  }

  const names = {
    type: 'types',
    quality: 'qualities',
    hero: 'heroes',
    event: 'events'
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
    this.selectNextOption({ keyCode: 40 }, 'hero')
  }

  this.onInputEnter = ({ keyCode }) => {
    if (keyCode == 13) {
      this.addItem() 
      return
    }
    var num = keyCode == 39 ? 40 : keyCode == 37 ? 38 : undefined
    if (!num) return
    this.selectNextOption({ keyCode: num }, 'hero')
  }

  const itemGroupRegex = /\t(.+)(\n\t{2}.+)*/g
  this.onChange = () => {
    this.parsedData = []
    this.heroes = []
    this.events = []
    let heroGroups = this.rawData.split('\n\n')
    heroGroups.forEach(data => {
      let name = data.split('\n')[0].split(' ').slice(2).join(' ') // name of hero
      let rawItems = data.split('\n').slice(1).join('\n') // remove the first line containing name of hero
      if (!this.heroes.includes(name)) this.heroes.push(name)
      var items = {}, itemMatch;
      while ((itemMatch = itemGroupRegex.exec(rawItems)) !== null) { // Regex each group and it's items
        const event = itemMatch[1].split(' ')[0]
        if (!this.events.includes(event)) this.events.push(event)
        items[event] = itemMatch[0].split('\n').slice(1).map(a => a.trim())
      }
      this.parsedData[name] = { name, items }
    })
    console.log(this)
  }

  this.addEvent = event => {
    if (!event || !event.length || this.events.includes(event)) return
    this.newEvents.push(event)
    this.events = [...this.events, ...this.newEvents]
  }

  this.updateRawData = () => {
    var out = ""
    for (var name in this.parsedData) {
      var hero = this.parsedData[name]
      out += `Cosmetics for ${hero.name}\n`
      for (var group in hero.items) {
        if (!hero.items[group].length) return
        out += `\t${group} (${hero.items[group].length} items)\n`
        out += hero.items[group].map(item => `\t\t${item}\n`).join('')
      }
      out += '\n'
    }
    this.rawData = out.replace(/\n$/, '')
  }
})

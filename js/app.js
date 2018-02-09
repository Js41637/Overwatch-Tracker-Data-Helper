var OWI = angular.module('OWI', ['ui.bootstrap'])

OWI.config(['$compileProvider', function($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}])

OWI.controller('MainCtrl', function() {
  this.types = ["PlayerIcon", "Skin", "Emote", "Spray", "VoiceLine", "HighlightIntro", "Pose"]
  this.qualities = ["Common", "Rare", "Epic", "Legendary"]
  this.heroes = [ 'Ana', 'Bastion', 'D.Va', 'Doomfist', 'Genji', 'Hanzo', 'Junkrat', 'Lúcio', 'McCree', 'Mei', 'Mercy', 'Moira', 'Orisa', 'Pharah', 'Reaper', 'Reinhardt', 'Roadhog', 'Soldier: 76', 'Sombra', 'Symmetra', 'Torbjörn', 'Tracer', 'Widowmaker', 'Winston', 'Zarya', 'Zenyatta' ]
  this.rawData = ''
  this.newEvents = []
  this.events = ['SUMMER_GAMES', 'HALLOWEEN', 'WINTER_WONDERLAND', 'LUNAR_NEW_YEAR', 'UPRISING', 'ANNIVERSARY']
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
    const { name, hero, event, type, quality } = this.newItem
    let itemName = `${name} (${quality} ${type})`
    if (!this.parsedData[hero].items[event]) this.parsedData[hero].items[event] = []
    this.parsedData[hero].items[event].push(itemName)
    this.newItem.name = '' // reset item name on page
    this.updateRawData()
    jumpToHero(hero)
  }

  const jumpToHero = hero => {
    const position = this.rawData.split('\n').findIndex(a => a.trim() == `Cosmetics for ${hero}`)
    const ta = document.querySelector("textarea");
    const lineHeight = 15;
    const jump = (position - 1) * lineHeight;
    ta.scrollTop = jump;
  }

  const names = {
    type: 'types',
    quality: 'qualities',
    hero: 'heroes',
    event: 'events'
  }

  this.selectNextOption = ({ keyCode }, option) => {
    const num = keyCode == 40 ? 1 : keyCode == 38 ? -1 : undefined
    if (!num) return
    const currentOption = this[names[option]]
    const currentIndex = currentOption.indexOf(this.newItem[option])
    const nextItem = currentIndex + num > currentOption.length - 1 ? 0 : currentIndex + num < 0 ? currentOption.length - 1 : currentIndex + num
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

    const num = keyCode == 39 ? 40 : keyCode == 37 ? 38 : undefined
    if (!num) return
    this.selectNextOption({ keyCode: num }, 'hero')
  }

  const itemGroupRegex = /\t(.+)(\n\t{2}.+)*/g
  this.onChange = () => {
    this.parsedData = []
    this.heroes = []
    this.events = []
    const heroGroups = this.rawData.split('\n\n')
    heroGroups.forEach(data => {
      const name = data.split('\n')[0].split(' ').slice(2).join(' ') // name of hero
      const rawItems = data.split('\n').slice(1).join('\n') // remove the first line containing name of hero
      if (!this.heroes.includes(name)) this.heroes.push(name)
      var items = {}, itemMatch;
      while ((itemMatch = itemGroupRegex.exec(rawItems)) !== null) { // Regex each group and it's items
        const event = itemMatch[1].split(' ')[0]
        if (!this.events.includes(event)) this.events.push(event)
        items[event] = itemMatch[0].split('\n').slice(1).map(a => a.trim())
      }
      this.parsedData[name] = { name, items }
    })
  }

  this.addEvent = event => {
    if (!event || !event.length || this.events.includes(event)) return
    this.newEvents.push(event)
    this.events = [...this.events, ...this.newEvents]
  }

  this.updateRawData = () => {
    let out = ""
    const names = Object.keys(this.parsedData).sort()
    for (let name of names) {
      const hero = this.parsedData[name]
      out += `Cosmetics for ${hero.name}\n`
      for (let group in hero.items) {
        if (!hero.items[group].length) return
        out += `\t${group} (${hero.items[group].length} items)\n`
        out += hero.items[group].map(item => `\t\t${item}\n`).join('')
      }
      out += '\n'
    }
    this.rawData = out.replace(/\n$/, '')
  }

  this.parsedData = this.heroes.reduce((res, hero) => {
    res[hero] = {
      name: hero,
      items: {}
    }
    return res
  }, {})

  this.updateRawData()
})

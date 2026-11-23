const ADJECTIVES = [
  'Swift', 'Bright', 'Calm', 'Bold', 'Clever', 'Lucky', 'Mighty', 'Nimble',
  'Quick', 'Brave', 'Cosmic', 'Happy', 'Jolly', 'Kind', 'Lively', 'Rapid',
]

const NOUNS = [
  'Falcon', 'Otter', 'Panda', 'Tiger', 'Comet', 'Pixel', 'Rocket', 'Coyote',
  'Lynx', 'Phoenix', 'River', 'Sparrow', 'Wolf', 'Nebula', 'Quokka', 'Badger',
]

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)]
}

export function suggestDisplayName() {
  const number = Math.floor(Math.random() * 90) + 10
  const name = `${randomItem(ADJECTIVES)}${randomItem(NOUNS)}${number}`
  return name.slice(0, 24)
}

import { OnePlugin, PluginRequest } from "@onecomme.com/onesdk/types/Plugin"

const plugin: OnePlugin = {
  name: '参加管理 読み上げ拡張プラグイン', // @required plugin name
  uid: 'com.onecomme.order-speech-extender', // @required unique plugin id
  version: '0.0.1', // @required semver version
  author: 'OneComme', // @required author name
  url: 'http://localhost:11180/plugins/com.onecomme.order-speech-extender/index.html', // @optional link (ex. documentation link)
  permissions: ['waitingList'], // @required　https://onecomme.com/docs/developer/websocket-api/#%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E3%81%AE%E7%A8%AE%E9%A1%9E%E3%81%A8%E3%83%87%E3%83%BC%E3%82%BF
  defaultState: { // @optional key-value custom state
    callPlayers: true,
    callPlayersTemplate: ['{name}さん', '参加お願いします'],
    joinedPlayers: true,
    joinedPlayersTemplate: ['{name}さん', 'が参加待ちしました'],
  },

  // custom property
  players: new Map(),
  waitings: new Map(),

  /**
   * 
   * @param { dir: string, filepath: string, store: ElectronStore} param
   * dir: plugin directory path
   * filepath: this script's path
   * store: ElectronStore Instance  https://github.com/sindresorhus/electron-store?tab=readme-ov-file#instance
   */
  init({ dir, store }, initialData) {
    this.store = store
    const {
      newWaitingMap,
      newPlayerMap
    } = this.parseOrders(initialData.waitingList)
    this.waitings = newWaitingMap
    this.players = newPlayerMap
  },
  /**
   * called on exit or when activated
   * @optional
   */
  destroy() {

  },
  parseOrders(newWaitingList: any[]) {
    const newOrders: any[] = []
    const newPlayers: any[] = []
    const newWaitingMap = new Map()
    const newPlayerMap = new Map()
    newWaitingList.forEach((item) => {
      newWaitingMap.set(item.id, item)
      if (!this.waitings.has(item.id)) {
        newOrders.push(item)
      }
      if (item.playing) {
        newPlayerMap.set(item.id, item)
        if (!this.players.has(item.id)) {
          newPlayers.push(item)
        }
      }
    })
    return {
      newOrders,
      newPlayers,
      newWaitingMap,
      newPlayerMap
    }
  },
  speech(text: string) {
    fetch('http://127.0.0.1:11180/api/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text
      })
    }).catch((e) => {
      console.error(e)
    })
  },
  /**
   * called when the event specified in permissions occurs ( exclude connected event )
   * @optional
   * https://onecomme.com/docs/developer/websocket-api
   */
  subscribe(type, ...args) {
    switch (type) {
      case 'waitingList': {
        // 
        const newWaitingList = args[0]
        const {
          newOrders,
          newPlayers,
          newWaitingMap,
          newPlayerMap
        } = this.parseOrders(newWaitingList)
        this.waitings = newWaitingMap
        this.players = newPlayerMap

        if (newOrders.length && this.store.get('joinedPlayers')) {
          const tmpl = this.store.get('joinedPlayersTemplate')
          const text = newOrders.map((order: any) => {
            return tmpl[0].replaceAll('{name}', order.username)
          }).join(', ') + `, ${tmpl[1]}`
          this.speech(text)
        }
        if (newPlayers.length && this.store.get('callPlayers')) {
          const tmpl = this.store.get('callPlayersTemplate')
          const text = newPlayers.map((order: any) => {
            return tmpl[0].replaceAll('{name}', order.username)
          }).join(', ') + `, ${tmpl[1]}`
          this.speech(text)
        }
      }
    }
  },

  /**
   * called when a request is made to the plugin-specific RestAPI
   * @param {
   *   url: string // request url
   *   method: 'GET' | 'POST' | 'PUT' | 'DELETE'
   *   params: {[key: string]: string} // querystrings
   *   body?: any // request body
   * } req
   * @returns {
   *   code: number // status code
   *   response: Object or Array // response data
   * }
   */
  async request(req: PluginRequest) {
    // [GET, POST, PUT, DELETE]
    // endpoint: localhost:11180/api/plugins/com.onecomme.plugin-sample
    switch (req.method) {
      case 'GET':
        return {
          code: 200,
          response: {
            ...this.store.store
          }
        }
      case 'PUT': {
        const data = JSON.parse(req.body)
        this.store.store = data
        return {
          code: 200,
          response: data
        }
      }
    }
    return {
      code: 404,
      response: {}
    }
  }
}
module.exports = plugin
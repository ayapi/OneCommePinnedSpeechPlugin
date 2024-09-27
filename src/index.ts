import { OnePlugin, PluginRequest } from "@onecomme.com/onesdk/types/Plugin"
import * as fs from 'fs/promises';
import * as path from 'path';

interface CommentData {
  id: string;
  name: string;
  displayName: string;
  profileImage?: string;
  comment: string;
  hasGift: boolean;
  isOwner: boolean;
  isModerator: boolean;
  isMember: boolean;
  isFirstTime: boolean;
  badges: Array<{
    label: string;
    url?: string;
  }>;
  paidText?: string;
}

interface Comment {
  service: string;
  name: string;
  id: string;
  data: CommentData;
}

const plugin: OnePlugin = {
  name: 'ピン留め 読み上げ拡張プラグイン', // @required plugin name
  uid: 'com.onecomme.pinned-speech-extender', // @required unique plugin id
  version: '1.0.3', // @required semver version
  author: 'ayapi', // @required author name
  url: 'http://localhost:11180/plugins/com.onecomme.pinned-speech-extender/index.html', // @optional link (ex. documentation link)
  permissions: ['pinned'], // @required　https://onecomme.com/docs/developer/websocket-api/#%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E3%81%AE%E7%A8%AE%E9%A1%9E%E3%81%A8%E3%83%87%E3%83%BC%E3%82%BF
  defaultState: { // @optional key-value custom state
    enablePinnedSpeech: true, // ピン留めの読み上げを有効にするオプション
    pinnedSpeechTemplate: '{comment.data.displayName}さんのコメント: {comment.data.comment}', // ピン留めの読み上げテンプレート
  },

  init({ dir, store }, initialData) {
    this.store = store
  },
  /**
   * called on exit or when activated
   * @optional
   */
  destroy() {

  },
  speech(text: string) {
    this.logToFile(`音声リクエスト: ${text}`);
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
      case 'pinned': {
        const pinnedData = args[0] as Comment | null;
        if (pinnedData && this.store.get('enablePinnedSpeech')) {
          const tmpl = this.store.get('pinnedSpeechTemplate');
          let text = this.formatTemplate(tmpl, pinnedData.data);
          text = this.removeHtmlTags(text);  // HTMLタグを除去
          this.speech(text);
        }
      }
    }
  },

  formatTemplate(template: string, data: CommentData): string {
    return template.replace(/\{comment\.data\.(\w+)\}/g, (match, key: string) => {
      const value = data[key as keyof CommentData];
      if (typeof value === 'string') {
        return value;
      } else if (typeof value === 'boolean') {
        return value.toString();
      } else if (Array.isArray(value)) {
        return JSON.stringify(value);
      }
      return match; // 対応する値がない場合は元のマッチをそのまま返す
    });
  },

  // 新しい関数を追加
  removeHtmlTags(text: string): string {
    return text.replace(/<[^>]*>/g, '').replace(/。/g, '、');
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
  },
  async logToFile(message: string) {
    // const logDir = path.join('C:', 'Users', 'ayapi', 'AppData', 'Roaming', 'onecomme', 'logs');
    // const logFilePath = path.join(logDir, 'pinned_plugin_debug_log.txt');

    // try {
    //   await fs.mkdir(logDir, { recursive: true });
    //   const logContent = `${new Date().toISOString()} - ${message}\n`;
    //   await fs.appendFile(logFilePath, logContent);
    // } catch (error) {
    //   console.error('ログの書き込みに失敗しました:', error);
    // }
  }
}
module.exports = plugin
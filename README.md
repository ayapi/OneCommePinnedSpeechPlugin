# わんコメ ピン留め読み上げ拡張プラグイン

わんコメのプラグイン開発用のサンプルを改造したプラグインです。  
ピン留めされたコメントを自動的に読み上げる機能を追加します。  
読み上げボイスや読み上げエンジンはわんコメの読み上げ設定のものをそのまま使用します。

## プラグインの導入

[Release](https://github.com/ayapi/OneCommePinnedSpeechPlugin/releases) ページから「onecomme-pinned-speech-plugin.zip」をダウンロードします。

zipを展開し、わんコメのプラグインフォルダに「onecomme-pinned-speech-plugin」フォルダを設置します。

わんコメを起動しプラグインを有効化します。

プラグイン有効化後に[設定ページ](http://localhost:11180/plugins/com.onecomme.pinned-speech-extender/index.html)　`http://localhost:11180/plugins/com.onecomme.pinned-speech-extender/index.html`にアクセスして設定をします。

## 機能

- ピン留めされたコメントの自動読み上げ
- 読み上げテンプレートのカスタマイズ

## 必要環境

- Node v20
- わんコメ v5.2 以上

## 開発環境

TypeScriptで開発ができます。  

※ わんコメプラグインはcommonjsで出力する必要があります。

## ビルド方法

1. 依存関係をインストールします：
   ```
   npm install
   ```

2. プラグインをビルドします：
   ```
   npm run build
   ```

3. ビルドされたプラグインは `dist` フォルダに生成されます。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルをご覧ください。

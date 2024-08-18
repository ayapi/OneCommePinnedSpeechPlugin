const { createApp, ref } = Vue
const uid = 'com.onecomme.pinned-speech-extender'
const app = createApp({
  data() {
    return {
      loaded: false,
      state: {
        enablePinnedSpeech: true,
        pinnedSpeechTemplate: '{comment.data.displayName}さんのコメント: {comment.data.comment}',
      }
    }
  },
  setup() {
    try {
      document.body.removeAttribute('hidden')
    } catch (e) {
      alert(e.message)
    }
    return {}
  },
  methods: {
    save(e) {
      e.preventDefault()
      fetch(`http://localhost:11180/api/plugins/${uid}`, {
        method: 'PUT',
        body: JSON.stringify(this.state)
      }).then((res) => res.json()).then(({ response }) => {
        this.updateState(response)
        this.$toast.open({
          message: '保存しました',
          position: 'bottom'
        })
      })
    },
    updateState(response) {
      const defaultState = {
        enablePinnedSpeech: true,
        pinnedSpeechTemplate: '{comment.data.displayName}さんのコメント: {comment.data.comment}',
      }
      this.state = { ...defaultState, ...response }
      if (typeof this.state.pinnedSpeechTemplate !== 'string') {
        this.state.pinnedSpeechTemplate = defaultState.pinnedSpeechTemplate
      }
    }
  },
  mounted() {
    fetch(`http://localhost:11180/api/plugins/${uid}`, {
      method: 'GET',
    }).then((res) => res.json()).then(({ response }) => {
      this.updateState(response)
      this.loaded = true
    }).catch((e) => {
      this.$toast.open({
        message: e.message,
        type: 'error',
        position: 'bottom'
      })
    })
  }
})
app.use(VueToast.ToastPlugin)
app.mount('#app')
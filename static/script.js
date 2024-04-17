const { createApp, ref } = Vue
const uid = 'com.onecomme.order-speech-extender'
const app = createApp({
  data() {
    return {
      loaded: false,
      state: {
        callPlayers: true,
        callPlayersTemplate: ['{name}さん', '参加お願いします'],
        joinedPlayers: true,
        joinedPlayersTemplate: ['{name}さん', 'が参加待ちしました'],
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
        this.state = response
        this.$toast.open({
          message: '保存しました',
          position: 'bottom'
        })
      })
    }
  },
  mounted() {
    fetch(`http://localhost:11180/api/plugins/${uid}`, {
      method: 'GET',
    }).then((res) => res.json()).then(({ response }) => {
      this.state = response
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
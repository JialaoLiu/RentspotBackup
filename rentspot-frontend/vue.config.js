const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 5173,
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws'
    },
    allowedHosts: 'all',
    host: '0.0.0.0',
    webSocketServer: false
  },
  lintOnSave: false
})
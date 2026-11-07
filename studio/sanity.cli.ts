import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '4onggkj5',
    dataset: 'production',
  },
  studioHost: 'earlyjune',
  deployment: {autoUpdates: true},
})

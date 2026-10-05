/// <reference types="vite/client" />

import type { MysqlApi } from '../../preload/index'

declare global {
  interface Window {
    mysqlApi: MysqlApi
  }
}

export {}

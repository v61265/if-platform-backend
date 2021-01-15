# imaginary-friends platform 想像朋友暗網

## 簡介
這是 imaginary-friends platform 想像朋友暗網的後端原始碼，採用 Express 和 Sequelize 開發。

## 建置

1. 執行 `npm install` 安裝此專案所需的第三方套件

2. 新增 config/config.json，格式為：

  ```json
  {
    "development": {
      "username": "root",
      "password": null,
      "database": "if-platform",
      "host": "127.0.0.1",
      "dialect": "mysql"
    },
    "test": {
      "username": "root",
      "password": null,
      "database": "database_test",
      "host": "127.0.0.1",
      "dialect": "mysql"
    },
    "production": {
      "username": "root",
      "password": null,
      "database": "database_production",
      "host": "127.0.0.1",
      "dialect": "mysql",
      "use_env_variable": "CLEARDB_TEAL_URL"
    }
  }
  ```

3. 建立環境變數 .env，格式為：
    ```js
    SECRET = ''
    JWT_SECRET = ''
    ```

4. 輸入指令 `npx sequelize-cli db:migrate` 執行 Sequelize migration，在 MySQL 資料庫中建立 table。
  
5. 輸入指令 `npx sequelize-cli db:seed:all` 以執行 Sequelize seeders 以在資料庫中建立初始 demo 資料。

## 開發
1. `npm run start`

## 專案架構   

```js
|   index.js                 // App 伺服器入口點
|   package.json
|   package-lock.json
|   README.md
|
+---config
|     config.json            // Sequelize 設定檔
|       
+---controllers              // 處理 API 邏輯
|     userController.js
|     eventController.js
|     workController.js
|     commentController.js
|       
+---middlewares              // 自訂 middlewares
|     auth.js
|       
+---models                   // 透過 Sequelize 和資料庫溝通
|     index.js
|     user.js
|     emailTime.js
|     event.js
|     tag.js
|     user_event.js
|     user_work.js
|     work_tag.js
|     work.js
|               
+---routes                    // 區分不同功能的 API 路由
|     userRoutes.js
|     eventRoutes.js
|     workRoutes.js
|     commentRoutes.js
|       
+---node_modules
|       
+---migrations                // Sequelize migrations
|       
\---seeders                   // Sequelize seeders
```

## 使用的第三方 library

### bcrypt
避免明碼密碼，使用此套件將密碼 hash 過後再存入，認證時再比對兩者是否相同即可。

### cors
使用此套件解決跨來源資源共用。

### dotenv
使用此套件設置環境變數。

### jsonwebtoken
使用 JWT 來實作登入機制驗證。

### mysql2
使用 mysql2 連線資料庫。

### sequelize
使用 ORM 工具 Sequelize 來操作資料庫。

## API 文件

[詳細 API 文件參考連結](https://hackmd.io/@GXGttDHLSu6-nPfTaqugEw/rJaiwo7hP)

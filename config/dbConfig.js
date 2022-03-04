module.exports = {
    HOST: "127.0.0.1",
    USER: "root",
    PASSWORD: "c$yE6225Cloud",
    DB: "webapp",
    dialect: "mysql",
    port: 3306,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
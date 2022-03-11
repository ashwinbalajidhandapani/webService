module.exports = {
    HOST: "csye6225.ceqcujguktqu.us-east-2.rds.amazonaws.com",
    USER: "csye6225",
    PASSWORD: "admin123",
    DB: "csye6225",
    dialect: "mysql",
    port: "3306",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
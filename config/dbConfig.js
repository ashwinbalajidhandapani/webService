module.exports = {
    // HOST: process.env.DB_HOSTNAME || 'csye6225.ceqcujguktqu.us-east-2.rds.amazonaws.com',
    HOST: process.env.DB_HOSTNAME || 'csye6225.c1vp73cccif1.us-east-2.rds.amazonaws.com',
    USER: process.env.DB_USERNAME || 'csye6225',
    PASSWORD: process.env.DB_PASSWORD || 'admin123',
    DB: process.env.DB_NAME || 'csye6225',
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
module.exports = (sequelize, DataTypes)=>{
    const User = sequelize.define("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER
      },
      emailid: {
        type: DataTypes.STRING,
        allowNull:false,
        primaryKey:true,
        unique: true
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull:false,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull:false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull:false,
      }
    });
    return User;
  }
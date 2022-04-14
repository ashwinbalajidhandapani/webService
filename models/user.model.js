module.exports = (sequelize, DataTypes)=>{
    const User = sequelize.define("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey:true,
      },
      emailid: {
        type: DataTypes.STRING,
        allowNull:false,
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
      },
      isverified: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Not Verified"
      }
    });
    return User;
  }
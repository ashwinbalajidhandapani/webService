module.exports = (sequelize, DataTypes)=>{
    const Images = sequelize.define("images", {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey:true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull:false,
      },
      filename: {
        type: DataTypes.STRING,
        allowNull:false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull:false,
      },
      upload_date: {
          type: 'TIMESTAMP',
          allowNull: false,
          default: DataTypes.literal('CURRENT_TIMESTAMP')
      }
    });
    return Images;
  }
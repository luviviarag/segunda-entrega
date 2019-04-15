const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
 
const usuarioSchema = new Schema({
  nombre: {
  	type : String,
  	require : true
  },
  documento: {
  	type : Number,
  	require : true,
    unique: true,
    trim : true
  },
  correo :{
  	type : String,
  	require : true
  },
  telefono :{
  	type : String,
  	require : true	
  },
  contrasena :{
  	type : String,
  	require : true
  },
  rol :{
    type : String,
    default : 'aspirante'
  }

});

usuarioSchema.plugin(uniqueValidator,{ message: 'Ya existe otro usuario con el mismo documento'});
const Usuario = mongoose.model('Usuario',usuarioSchema);

module.exports = Usuario
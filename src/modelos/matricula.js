const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

 
const matriculaSchema = new Schema({
	documento: {
		type : Number,
		require : true,
		unique: true
	},
	curso :{
		type : Number,
		require : true,
		unique: true
	},
	correo :{
	  	type : String,
	  	require : true
	},
	telefono :{
	  	type : String,
	  	require : true	
	},
	nombre :{
	  	type : String,
	  	require : true
	}

});

matriculaSchema.plugin(uniqueValidator,{ message: 'Ya está matriculado en el curso'});
const Matricula = mongoose.model('Matricula',matriculaSchema);
module.exports = Matricula
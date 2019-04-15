const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
 
const cursoSchema = new Schema({
	nombre: {
		type : String,
		require : true
	},
	id: {
		type : Number,
		require : true,
	 	unique: true
	},
	descripcion :{
		type : String,
		require : true
	},
	valor:{
		type : Number,
		require : true	
	},
	modalidad :{
		type : String
	},
	duracion :{
		type : Number
	},
	estado :{
		type : String,
		default : 'disponible'
	}

});

cursoSchema.plugin(uniqueValidator,{ message: 'Ya existe otro curso con el mismo identificador'});
const Curso = mongoose.model('Curso',cursoSchema);

module.exports = Curso
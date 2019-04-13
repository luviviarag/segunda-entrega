const express = require('express');
const app = express();
const path = require('path');
const hbs= require('hbs');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
require('./helpers');


const directoriopublico = path.join(__dirname,'../public');
const directoriopartials = path.join(__dirname, '../partials');
hbs.registerPartials(directoriopartials);
app.use(express.static(directoriopublico));
app.use(bodyParser.urlencoded({extended:false}))
 
app.set('view engine','hbs');

app.get('/',(req,res)=>{
	res.render('index')
});

app.get('/actualizar',(req,res)=>{
	res.render('actualizar')
});

app.get('/interesado',(req,res)=>{
	res.render('interesado')
});

app.get('/coordinador',(req,res)=>{
	res.render('coordinador')
});

app.get('/matriculados',(req, res)=>{
	res.render('matriculados')
});

app.get('/aspirante',(req, res)=>{
	res.render('aspirante')
});

app.post('/actualizado',(req,res)=>{
	res.render('actualizado',{
		id: parseInt(req.body.id)
	});
});

app.post('/matricular',(req, res)=>{
	res.render('matricular',{
		documento: req.body.documento,
		nombre:    req.body.nombre,
		correo:    req.body.correo,
		telefono:  parseInt(req.body.telefono),
		idcurso:   parseInt(req.body.idcurso)
	});
});

app.post('/crearcurso',(req, res)=>{
	res.render('crearcurso',{
		id: 		 parseInt(req.body.id),
		nombre: 	 req.body.nombre,
		descripcion: req.body.descripcion,
		valor: 		 parseInt(req.body.valor),
		modalidad: 	 req.body.modalidad,
		intesidad:   parseInt(req.body.intesidad),
		estado:      'disponible'
	});
});

app.listen(port,() =>{
	console.log('Escuchando en el puerto' + port);
} );
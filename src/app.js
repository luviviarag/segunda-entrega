const express = require('express');
const app = express();
const path = require('path');
const hbs= require('hbs');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
process.env.URLDB = 'mongodb://localhost:27017/plataformavirtual'
const mongoose = require('mongoose');
const Curso = require('./modelos/curso');
const Usuario = require('./modelos/usuario');
const Matricula = require('./modelos/matricula');
require('./helpers');
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const directoriopublico = path.join(__dirname,'../public');
const directoriopartials = path.join(__dirname, '../partials');
const bcrypt = require('bcrypt');


hbs.registerPartials(directoriopartials);
app.use(express.static(directoriopublico));
app.use(bodyParser.urlencoded({extended:false}))

mongoose.connect(process.env.URLDB,{useNewUrlParser: true},(err, resultado)=>{
	if(err){
		return console.log(error)
	}
	console.log('conectado');
})   

app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: 'keyboard cat'
}))

app.use((req, res, next) =>{
	if(req.session.usuario){		
		res.locals.sesion = true
		res.locals.nombre = req.session.nombre
	}	
	next()
})      

app.set('view engine','hbs');

app.get('/',(req,res)=>{
	res.render('index')
});

app.get('/actualizar',(req,res)=>{
	Curso.find({estado : 'disponible'},(err,respuesta)=>{
		if (err){
			return console.log(err)
		}
		res.render ('actualizar',{
			listado : respuesta
		})
	})
});

app.get('/interesado', (req,res) => {

	Curso.find({estado : 'disponible'},(err,respuesta)=>{
		if (err){
			return console.log(err)
		}
		res.render ('interesado',{
			listado : respuesta
		})
	})
})

app.get('/coordinador',(req,res)=>{
	res.render('coordinador')
});

app.get('/registrarUsuario',(req,res)=>{
	res.render('registrarUsuario')
});

app.get('/matriculados',(req, res)=>{
	Curso.find({},(err,respuesta)=>{
		if (err){
			return console.log(err)
		}
		Matricula.find({},(err,resulado)=>{
			if (err){
				return console.log(err)
			}
			res.render ('matriculados',{
			listado : resulado,
			listadocursos : respuesta
		})
		})
		
	})
});

app.get('/aspirante',(req, res)=>{
	Curso.find({estado : 'disponible'},(err,respuesta)=>{
		if (err){
			return console.log(err)
		}
		res.render ('aspirante',{
			documento : req.session.usuario,
			nombre :  req.session.nombre,
			telefono: req.session.telefono,
			correo:   req.session.correo,
			listado : respuesta
		})
	})
});

app.post('/login', (req, res) => {	
	Usuario.findOne({documento :  parseInt(req.body.documento)}, (err, resultados) => {
		if (err){
			return console.log(err)
		}
		if(!resultados){
			return res.render ('login', {
			mensaje : "Usuario no encontrado"			
			})
		}
		if(!bcrypt.compareSync(req.body.password, resultados.contrasena)){
			return res.render ('login', {
			mensaje : "Contraseña no es correcta"			
			})
		}	
		//Para crear las variables de sesión
		req.session.usuario = resultados.documento	
		req.session.nombre = resultados.nombre
		req.session.rol = resultados.rol
		req.session.correo = resultados.correo
		req.telefono = resultados.telefono
		if(resultados.rol =='coordinador'){
			coordinador = true;
			aspirante 	= false;
			interesado 	= false;
		}else{
			if(resultados.rol=='aspirante'){
				coordinador	= false;
				aspirante	= true;
				interesado	= false;
			}else{
				coordinador	= false;
				aspirante	= false;
				interesado	= true;
			}
		}
		res.render('login', {
					mensaje : "Bienvenido " + resultados.nombre,
					nombre : resultados.nombre,
					coordinador,
					aspirante,
					interesado,
					sesion : true						
					})
	})	
})

app.get('/salir', (req, res) => {
	req.session.destroy((err) => {
  		if (err) return console.log(err) 	
	})	
	// localStorage.setItem('token', '');
	res.redirect('/')	
})
app.post('/matricular',(req, res)=>{
	let matricula = new Matricula({
		documento:    parseInt(req.body.documento),
		curso:        parseInt(req.body.idcurso),
		correo:       req.body.correo,
		nombre: 	  req.body.nombre,	
		telefono:     req.body.telefono
	})
	matricula.save((err, resultado)=>{
		if(err){
			res.render('matricular',{
				matricular : err
			})
		}
		res.render('matricular',{
			matricular: 'Te has matriculado exitosamente'
		})
	})
});

app.post('/registrado',(req, res)=>{
	let usuario = new Usuario({
		documento:    parseInt(req.body.documento),
		nombre:      req.body.nombre,
		correo:      req.body.correo,
		telefono:    req.body.telefono,
		contrasena : bcrypt.hashSync(req.body.contrasena, 10)
	})
	usuario.save((err, resultado)=>{
		if(err){
			res.render('registrado',{
				mostrar : err
			})
		}
		res.render('registrado',{
			mostrar: usuario.nombre + ' te has registrado en TDEA virtual'
		})
	})
});

app.post('/crearcurso',(req, res)=>{
	let curso = new Curso({
		id: 		 parseInt(req.body.id),
		nombre: 	 req.body.nombre,
		descripcion: req.body.descripcion,
		valor: 		 parseInt(req.body.valor),
		modalidad: 	 req.body.modalidad,
		duracion:    parseInt(req.body.intesidad),
	})
	curso.save((err, resultado)=>{
		if(err){
			res.render('crearcurso',{
				mostrar : err
			})
		}
		res.render('crearcurso',{
			mostrar:'Se creó el curso de '+ curso.nombre
		})
	})
});
app.post('/actualizado',(req, res)=>{
	console.log('entro a actualizar');
	Curso.findOneAndUpdate({id : parseInt(req.body.id)}, { $set: { estado: 'cerrado' }}, {new : true, runValidators: true, context: 'query' }, (err, resultados) => {
		if (err){
			console.log('error al actualizar');
			return console.log(err)
		}

		res.render ('actualizado', {
			mensaje : 'Cerró el curso de '+ resultados.nombre
		})
	})	
});
app.listen(port,() =>{
	console.log('Escuchando en el puerto' + port);
} );
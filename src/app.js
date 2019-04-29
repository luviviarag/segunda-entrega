require('./config/config');
const express = require('express');
const app = express();
const path = require('path');
const hbs= require('hbs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Curso = require('./modelos/curso');
const Usuario = require('./modelos/usuario');
const Matricula = require('./modelos/matricula');
require('./helpers');
const multer = require('multer');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const directoriopublico = path.join(__dirname,'../public');
const directoriopartials = path.join(__dirname, '../partials');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

hbs.registerPartials(directoriopartials);
app.use(express.static(directoriopublico));
app.use(bodyParser.urlencoded({extended:false}))

mongoose.connect(process.env.URLDB,{useNewUrlParser: true},(err, resultado)=>{
	if(err){
		console.log('urld'+process.env.URLDB);
		console.log("Error de conexion de base de datos");
		return console.log(err)
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
		avatar = resultados.avatar.toString('base64')
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
					avatar : avatar,
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

		Curso.find({id : parseInt(req.body.idcurso) },(err,respuesta)=>{
			if (err){
				return console.log(err)
			}
			let msg = {
			to: req.body.correo,
			from: 'luvivianaraujo@gmail.com',
			subject: 'Confirmación matricula TDEA',
			text: req.body.nombre + ' se ha matriculado en el curso ' + respuesta.nombre 
				  + ' que tiene una duración de ' + respuesta.duración
			      + ' con modalidad '+ respuesta.modalidad +
			      'por un valor de ' + respuesta.valor                 
			};
			sgMail.send(msg);
		})

		res.render('matricular',{
			matricular: 'Te has matriculado exitosamente'
		})
	})
});

var upload = multer({})

app.post('/registrado',upload.single('foto'),(req, res)=>{
	
	let usuario = new Usuario({
		documento:    parseInt(req.body.documento),
		nombre:      req.body.nombre,
		correo:      req.body.correo,
		telefono:    req.body.telefono,
		contrasena : bcrypt.hashSync(req.body.contrasena, 10),
		rol: req.body.rol,
		avatar : req.file.buffer
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
app.get('/contactanos',(req, res)=>{
	res.render ('contactanos',{
		documento : req.session.usuario,
		nombre :  req.session.nombre,
		telefono: req.session.telefono,
		correo:   req.session.correo
	})
});
app.post('/enviar',(req, res)=>{
	Usuario.find({rol : 'coordinador'},(err, resultados) => {
		if (err){
			console.log('error al enviar su solicitud');
			return console.log(err)
		}
		if(resultados.length > 0){
			resultados.forEach(usuario =>{
				console.log(usuario.correo);
				let msg = {
					to: usuario.correo,
					from: req.body.correo,
					subject: req.body.solicitud,
					text: req.body.nombre + ' envía la siguiente solicitud ' + req.body.comentarios
				};
				sgMail.send(msg);
			})
			res.render ('enviar', {
				mensaje : 'Muchas gracias por escribirnos, sus comentarios son muy impotantes para nosotros'
			})
		}
		else{
			res.render ('enviar', {
				mensaje : 'No existen coordinadores para enviar su solicitud'
			})
		}
		
		
	})	
});

app.listen(process.env.PORT,() =>{
	console.log('Escuchando en el puerto' + process.env.PORT);
} );
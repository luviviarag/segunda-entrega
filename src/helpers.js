const hbs = require('hbs');
const fs = require ('fs');
listaCursos = [];
listaMatriculas = [];

hbs.registerHelper('crearcurso',(id,nombre,descripcion,valor,modalidad,intesidad,estado)=>{
	listarCursos();
	let texto = "";
	let cur = {
		nombre: 	 nombre,
		id: 		 id,
		descripcion: descripcion,
		valor: 		 valor,
		modalidad: 	 modalidad,
		duracion: 	 intesidad,
		estado: 	 estado
	};
	let duplicado = listaCursos.find(nom => nom.id == id)

	if(!duplicado){
		listaCursos.push(cur);
		guardar();
		texto ="Se creó el curso de " +nombre ;
		return texto;
	}
	else{
			texto = "Ya existe otro curso con el mismo id";
		return texto;
	}
})

hbs.registerHelper('matricular',(documento, nombre, correo, telefono, idcurso)=>{
	listarMatricular();
	let texto = "";
	let matr = {
		
		documento: 	documento,
		nombre: 	nombre,
		correo: 	correo,
		telefono: 	telefono,
		idcurso: 	idcurso
	};
	let duplicado = listaMatriculas.find(mat => mat.documento == documento && mat.idcurso == idcurso)	
	if(!duplicado){
		listaMatriculas.push(matr);
		matricularM();
		texto ="Su matricula se realizó con exito";
		return texto;
	}
	else{
		texto= "Ya se encuentra matriculado en otro curso";
		return texto; 
	}
})

hbs.registerHelper('listarMatriculados',()=>{
	listarCursos();
	listarMatricular();
	let mtriculados = " ";
	let texto = '<table> \
				<thead>\
				<th>Nombre de curso</th>\
				<th>Estado</th>\
				<th>Inscritos</th>\
				</thead>';
	listaCursos.forEach(curso =>{
		texto = texto +
				'<tr>' +
				'<td>' + curso.nombre + '</td>' +
				'<td>' + curso.estado + '</td>';
		let mat = listaMatriculas.filter(buscar => buscar.idcurso == curso.id)
		if(mat.length == 0){
			mtriculados = 'No hay personas inscritas';
		}
		else{
				mat.forEach(m => {
				mtriculados = mtriculados + m.nombre +', ';
			} )
		}
		texto = texto +'<td>' + mtriculados + '</td></tr>';

	})
	texto = texto + '</table>';
	return texto;

})
hbs.registerHelper('listarcursos',()=>{
	listarCursos();
	let texto = '<div class="row">';
	listaCursos.forEach(curso =>{
		texto = texto +
				'<div class="column" style="background-color:#aaa;">'+
		     	'<h3> Nombre: ' + curso.nombre + '</h3>'+
		     	'<h4>Descripción: ' + curso.descripcion +'</h4>' +
		     	'<h4> Valor: ' + curso.valor + '</h4>' +
		     	'<a class="collapsible" href="#" style="background-color:#aaa;">Ver Más</a>'+
		     	'<div class="content" style="background-color:#aaa;">'+
		            '<p> Duración: ' + curso.duracion +' horas</p>'+
		            '<p> Modalidad: ' + curso.modalidad + '</p>'+
		            '<p> Estado:' + curso.estado + '</p>'+
		         '</div>'+
		      '</div>';
	})
	texto = texto + '</div>'+
	'<script type="text/javascript">'+
      'var elements = document.getElementsByClassName("column");'+
      'var coll = document.getElementsByClassName("collapsible");'+  
      'var i;'+
      'for (i = 0; i < coll.length; i++) {'+	
        'coll[i].addEventListener("click", function() {'+
          'this.classList.toggle("active");'+
          'var content = this.nextElementSibling;'+
          'if (content.style.display === "block") {'+
            'content.style.display = "none";'+
          '} else {'+
            'content.style.display = "block";'+
          '}'+
       ' });'+
      '}'+
    '</script>';
	return texto;

})

hbs.registerHelper('matricularCursos',()=>{
	listarCursos();

	let texto = '<div class="form-group">'+
				'<label>Cursos</label>'+             
          		'<select class="form-control" name="idcurso">'+
				'<option value="-">-</option>';
				
	listaCursos.forEach(curso=>{	

			texto = texto +'<option value="' + curso.id + '">' + curso.nombre + '</option>';
			});
	texto = texto + '</select><br></div>';

	return texto;
})

hbs.registerHelper('selectCursosDispo',()=>{
	listarCursos();
	let texto='';
	let curs = listaCursos.filter(buscar => buscar.estado == 'disponible')
	if(curs.length !=0){
		 texto = '<div class="form-group">'+
				'<label>Curso</label>'+             
          		'<select class="form-control" name="id">'+
				'<option value="-">-</option>';

		curs.forEach(curso=> {	
			texto = texto +'<option value="' + curso.id + '">' + curso.nombre + '</option>';
		});
		
		texto = texto + '</select><br></div>';
	}
	else{
		texto='No hay cursos disponibles';
	}			
	
	return texto;
})

hbs.registerHelper('actualizado',(id)=>{
	console.log(id);
	texto = 'El curso fué cerrado';
	return texto;
})

hbs.registerHelper('eliminar',(id)=>{
	console.log(id);
	listarCursos();
	let texto = '';
	let curs = listaCursos.filter(buscar => buscar.id != id)
	listaCursos = curs;
	guardar();
	texto = 'El curso fué actualizado';
	return texto;
})
const listarMatricular=() => {
	try{
		listaMatriculas = require('../matricula.json');
	}
	catch(error){

		listaMatriculas = [];
	}
}

const matricularM = ()=> {
	let datos = JSON.stringify(listaMatriculas);
	fs.writeFile('matricula.json', datos, (err)=>{
		if(err) throw(err);
		return('Matricula realizada con exito');
	})
}

const listarCursos=() => {
	try{
		listaCursos = require('../listado.json');
	}
	catch(error){
		listaCursos = [];
	}
}
	
const guardar = ()=> {
	let datos = JSON.stringify(listaCursos);
	fs.writeFile('listado.json', datos, (err)=>{
		if(err) throw(err);
		return('Curso creado con exito');
	})
}

const mostrarcurso = ()=> {
	listar();
	let curs = listaCursos.filter(buscar => buscar.estado == 'disponible')
	
	if(curs.length ==0){
		console.log('No hay cursos disponibles');
	}
	else{
		console.log('Los cursos disponibles son:');
		curs.forEach(curso => {
			console.log('Nombre del curso: '+curso.nombre);
			console.log(' Descripcion del curso: '+curso.descripcion);
			console.log(' Valor del curso: '+curso.valor+'\n');
		} )
	}
}



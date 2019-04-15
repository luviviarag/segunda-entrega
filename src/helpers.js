const hbs = require('hbs');
const fs = require ('fs');
const Curso = require('./modelos/curso');
listaCursos = [];
listaMatriculas = [];

hbs.registerHelper('listarMatriculados',(listado, listadocursos)=>{
	let mtriculados = " ";
	let texto = '<table> \
				<thead>\
				<th>Nombre de curso</th>\
				<th>Estado</th>\
				<th>Inscritos</th>\
				</thead>';
	listadocursos.forEach(curso =>{
		mtriculados = " ";
		texto = texto +
				'<tr>' +
				'<td>' + curso.nombre + '</td>' +
				'<td>' + curso.estado + '</td>';
		let mat = listado.filter(buscar => buscar.curso == curso.id)
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
hbs.registerHelper('listarcursos',(listado)=>{
	let texto = '<div class="row">';
	if(listado.length ==0){
		texto = '<p>No hay cursos disponibles</p>';
		return texto;
	}
	listado.forEach(curso =>{
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

hbs.registerHelper('matricularCursos',(listado)=>{
	let texto = '<div class="form-group">'+
				'<label>Cursos   </label>'+             
          		'<select class="form-control" name="idcurso">';
				
	listado.forEach(curso=>{	

			texto = texto +'<option value="' + curso.id + '">' + curso.nombre + '</option>';
			});
	texto = texto + '</select><br></div>';

	return texto;
})

hbs.registerHelper('selectCursosDispo',(listado)=>{
	let texto='';
	if(listado.length !=0){
		 texto = '<div class="form-group">'+
				'<label>Curso</label>'+             
          		'<select class="form-control" name="id">';

		listado.forEach(curso=> {	
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





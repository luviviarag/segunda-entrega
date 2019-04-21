process.env.PORT = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'local';

let urlDB
if (process.env.NODE_ENV === 'local'){
	urlDB = 'mongodb://localhost:27017/plataformavirtual';
}
else {
	urlDB = 'mongodb+srv://luvivianaraujo:luviarag4413%2f%2a@clusterplataformavirtual-ix6si.mongodb.net/plataformavirtual?retryWrites=true'
}
process.env.URLDB = urlDB
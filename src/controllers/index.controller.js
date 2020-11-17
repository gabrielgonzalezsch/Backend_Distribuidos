const { Pool } = require('pg')
const nodemailer = require('nodemailer')
const PDFDocument = require('pdfkit')
const fs = require('fs');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password:'canito',
    database: 'comisaria',
    port:'5432' 
})

const getPermisos = async(req,res) => {
    const response = await pool.query('SELECT * FROM permisos').catch(function (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
    res.status(200).json(response)
}

const createPermiso = async (req,res)=> {
    const {run,nombre,direccion,motivo,email,fecha} = req.body;
    const resp = await pool.query('INSERT INTO permisos VALUES (DEFAULT,$1,$2,$3,$4,$5,$6)',[run,nombre,direccion,motivo,email,fecha]).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        }
        });
    const resid = await pool.query('SELECT id FROM permisos WHERE run =$1 AND nombre=$2 AND direccion=$3 LIMIT 1',[run,nombre,direccion]).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        }
        });    
    id = resid.rows[0].id
    const permiso = generarPdf(req,id)
    if(sendPermiso(email,permiso)){
        res.json({
            message: 'Permiso generado exitosamente!, su IDPermiso es: '+id,
            body: {
                permiso: {run,nombre,direccion,motivo,email}
            }
        });
        }
    else{
        res.json({
            message: 'Ocurrio un error al generar su permiso'
        });
    }
};


function generarPdf(req,id){
    const {run,nombre,direccion,motivo,email,fecha} = req.body;
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('permiso'+run+'.pdf'));
    doc
    .fontSize(25)
    .text('ID del permiso: '+id, {
        width: 410,
        align: 'center'})
    doc
    .text('Nombre: '+nombre, {
        width: 410,
        align: 'center'})
    doc.text('RUT: '+run, {
        width: 410,
        align: 'center'})
    doc.text('Direccion: '+direccion, {
        width: 410,
        align: 'center'})
    doc.text('Motivo'+motivo, {
        width: 410,
        align: 'center'})
    doc.text('Fecha: '+fecha.toString(), {
        width: 410,
        align: 'center'})
    doc.end();
    return 'permiso'+run+'.pdf'
}


function sendPermiso (email, permiso){
    var verif = true;
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'cuenta.amazon.canito@gmail.com',
            pass: 'Macbookpro123'
        }
    });
    var mailOptions = {
        from: 'Comisaria Virtual',
        to: email,
        subject: 'Permiso',
        text: 'Adjunto se encuentra el PDF de su permiso.',
        attachments: [{
            filename:'permiso',
            path:'../src/'+permiso,
            contentType: 'application/pdf'
          }]
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error){
            console.log(error);
            verif = false
        } else {
            console.log("Email sent");
        }
    });
    return verif
}




// Exports
module.exports ={
    getPermisos,
    createPermiso
}
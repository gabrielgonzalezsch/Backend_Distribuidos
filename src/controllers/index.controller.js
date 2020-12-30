const { Pool } = require('pg')
const nodemailer = require('nodemailer')
const PDFDocument = require('pdfkit')
const fs = require('fs');
const { response } = require('express');

const pool = new Pool({
    host: '34.121.156.137',
    user: 'postgres',
    password:'canito123',
    database: 'comisaria',
    port:'5432' 
})

const getPermisos = (request,response) => {
    pool.query('SELECT * FROM permisos',(error,results) =>{
        if(error){
            throw error
        }
        response.status(200).send(results)
    })
}

const createPermiso = (request,response)=> {
    pool.query('SELECT fechaInicio FROM permisos WHERE run = $1 AND fechaInicio > now() - interval \'1 day\' ORDER BY id DESC LIMIT 1  ',[request.body.run],(error, results) => {
        if(error){
            response.status(500).send("error")
            return
        }else{
            if(results.rowCount == 0){
                const {run,nombre,direccion,motivo,email} = request.body; 
                const date = new Date();
                const fecha_inicio = new Date(date.getTime()+15*60000);
                const fecha_termino = new Date(fecha_inicio.getTime()+120*60000);
                pool.query(
                    'INSERT INTO permisos VALUES (DEFAULT,$1,$2,$3,$4,$5,$6,$7) RETURNING id'
                    ,[run,nombre,direccion,motivo,email,fecha_inicio,fecha_termino]
                    ,(error,results) =>{
                        if(error){
                            response.json({
                                message: 'Ocurrio un error al generar su permiso'
                            });
                        }
                        const idPermisoCreado = results.rows[0].id;
                        const nombrePermiso = generarPdf(request,idPermisoCreado,email,fecha_inicio,fecha_termino) 
                        response.json({
                            message: 'Permiso generado exitosamente! \nID del permiso: '+idPermisoCreado+'\nFecha de inicio: '+fecha_inicio.toString()+'\nFecha de termino: '+fecha_termino.toString(),
                            body: {
                                permiso: {run,nombre,direccion,motivo,email}
                            }
                        });
                    }
                )
            }else{
                response.json({
                    message: 'Solo puede crear 1 permiso por dia!'
                });
            }
            
        } 
    })
}


function generarPdf(req,id,email,fecha_inicio,fecha_termino){
    const {run,nombre,direccion,motivo} = req.body;
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('src/Pdfs/permiso'+run+'.pdf'));
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
    doc.text('Motivo: '+motivo, {
        width: 410,
        align: 'center'})
    doc.text('Fecha inicio: '+fecha_inicio.toString(), {
        width: 410,
        align: 'center'})
    doc.text('Fecha termino: '+fecha_termino.toString(), {
        width: 410,
        align: 'center'})    
    doc.end();

    sendPermiso(email,'permiso'+run+'.pdf');
    
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
            path:'src/Pdfs/'+permiso,
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


function deletePermiso(permiso){
    try{
    fs.unlink(permiso, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
    });  }catch(error){
    }
}

// Exports
module.exports ={
    getPermisos,
    createPermiso
}
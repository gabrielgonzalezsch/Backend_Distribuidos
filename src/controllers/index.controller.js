const { Pool } = require('pg')
const nodemailer = require('nodemailer')
const PDFDocument = require('pdfkit')
const fs = require('fs');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password:'canito',
    database: 'postgres',
    port:'5432' 
})

const getPermisos = async(req,res) => {
    const response = await pool.query('SELECT * FROM permisos').catch(function (error) {
        if (error.response) {
            res.json({
                message: 'Ocurrio un error'
            });
        }
      });
    res.status(200).json(response)
}

const createPermiso = async (req,res)=> {
    const {run,nombre,direccion,motivo,email} = req.body;
    const date = new Date();

    if(verificarPermiso(req,date)){
        const fecha_inicio = new Date(date.getTime()+15*60000);
        const fecha_termino = new Date(fecha_inicio.getTime()+120*60000);

        const resp = await pool.query('INSERT INTO permisos VALUES (DEFAULT,$1,$2,$3,$4,$5,$6,$7)',[run,nombre,direccion,motivo,email,fecha_inicio,fecha_termino]).catch(function (error) {
            if (error.response) {
                res.json({
                    message: 'Ocurrio un error al generar su permiso'
                });
            }
        });
        const resid = await pool.query('SELECT id FROM permisos WHERE run =$1 AND nombre=$2 AND direccion=$3 AND fechaInicio=$4 LIMIT 1',[run,nombre,direccion,fecha_inicio]).catch(function (error) {
            if (error.response) {
                res.json({
                    message: 'Ocurrio un error al generar su permiso'
                });
            }
        });    
        id = resid.rows[0].id
        const permiso = generarPdf(req,id,fecha_inicio,fecha_termino)
        if(sendPermiso(email,permiso)){
            res.json({
                message: 'Permiso generado exitosamente! \nID del permiso: '+id+'\nFecha de inicio: '+fecha_inicio.toString()+'\nFecha de termino: '+fecha_termino.toString(),
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
    }else{
        res.json({
            message: 'Solo puede crear 1 permiso por dia!'
        });
    }
};


function verificarPermiso (req,date){
    /*
    const {run,nombre,direccion,motivo,email} = req.body;
    const resp = await pool.query('SELECT fechaInicio FROM permisos WHERE run =$1 ORDER BY id DESC LIMIT 1 ',[run]).catch(function (error) {
        if (error.response) {
            res.json({
                message: 'Ocurrio un error al generar su permiso'
            });
        }
    });
    if(resp.rowCount== 0){
        return true
    }else{
        console.log(resp)
        console.log(resp.rows[0])
        console.log(resp.rows[0].fechaInicio.toString())  
    }
    */
   return true
}



function generarPdf(req,id,fecha_inicio,fecha_termino){
    const {run,nombre,direccion,motivo,email} = req.body;
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
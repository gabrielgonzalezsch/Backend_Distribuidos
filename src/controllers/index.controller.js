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
    const verif = await verificarPermiso(req)
    if(verif){
        const {run,nombre,direccion,motivo,email} = req.body;
        const date = new Date();
        const fecha_inicio = new Date(date.getTime()+15*60000);
        const fecha_termino = new Date(fecha_inicio.getTime()+120*60000);
        const resp = await pool.query('INSERT INTO permisos VALUES (DEFAULT,$1,$2,$3,$4,$5,$6,$7)',[run,nombre,direccion,motivo,email,fecha_inicio,fecha_termino]).catch(function (error) {
            if (error.response) {
                res.json({
                    message: 'Ocurrio un error al generar su permiso'
                });
            }
        });

        id = await getId(req,fecha_inicio)
        const permiso = await generarPdf(req,id,fecha_inicio,fecha_termino)
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

async function getId(req,fechaInicio){
    const {run,nombre,direccion,motivo,email} = req.body;
    const resid = await pool.query('SELECT id FROM permisos WHERE run =$1 AND nombre=$2 AND direccion=$3 AND fechaInicio=$4 LIMIT 1',[run,nombre,direccion,fechaInicio]).catch(function (error) {
        if (error.response) {
            res.json({
                message: 'Ocurrio un error al generar su permiso'
            });
        }
    });  
    return resid.rows[0].id 
}


async function verificarPermiso (req){
    const {run} = req.body;
    const resp = await pool.query('SELECT fechaInicio FROM permisos WHERE run = $1 AND fechaInicio > now() - interval \'1 day\' ORDER BY id DESC LIMIT 1  ',[run]).catch(function (error) {
        if (error.response) {
            res.json({
                message: 'Ocurrio un error al generar su permiso'
            });
        }
    });
    console.log(resp)
    try {
        rowCount = resp.rowCount
    } catch (error) {
        rowCount = 0
    }
    if(rowCount == 0){
        return true
    }else{
        return false
    }
}



async function generarPdf(req,id,fecha_inicio,fecha_termino){
    const {run,nombre,direccion,motivo} = req.body;
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
    console.log('se creo')
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
const { Pool } = require('pg')

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password:'canito',
    database: 'comisaria',
    port:'5432' 
})


const getPermisos = async(req,res) => {
    const response = await pool.query('SELECT * FROM permisos');
    //console.log(response);
    res.status(200).json(response.rows)
}

const createPermiso = async (req,res)=> {
    const {run,nombre,direccion,motivo,fecha} = req.body;
    const response = await pool.query('INSERT INTO permisos VALUES (DEFAULT,$1,$2,$3,$4,$5)',[run,nombre,direccion,motivo,fecha]);
    //console.log(response);
    res.json({
        message: 'Permiso Added Succesfully',
        body: {
            permiso: {run,nombre,direccion,motivo,fecha}
        }
    })
};


// Exports
module.exports ={
    getPermisos,
    createPermiso
}
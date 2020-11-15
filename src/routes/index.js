const { Router } = require('express');
const router = Router();


const { getPermisos,createPermiso} = require('../controllers/index.controller')


router.get('/permisos',getPermisos);
router.post('/createPermiso',createPermiso)


module.exports = router;
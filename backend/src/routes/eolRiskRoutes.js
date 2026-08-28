const express = require('express');
const router = express.Router();
const eolRiskController = require('../controllers/eolRiskController');

router.get('/', eolRiskController.getEolRisks);
router.post('/recalculate', eolRiskController.recalculateEolRisks);
router.post('/action/:id', eolRiskController.executeAction);
router.get('/transfers', eolRiskController.getTransfers);
router.get('/markdowns', eolRiskController.getMarkdowns);

module.exports = router;

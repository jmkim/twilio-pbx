const express = require('express')
const router = express.Router()

/* GET root page. */
router.get('/', function (req, res, next) {
  res.render('welcome', { title: 'Twilio PBX' })
})

module.exports = router

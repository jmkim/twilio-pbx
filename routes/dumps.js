const express = require('express')
const router = express.Router()

router.post('/calls', (req, res) => {
  console.log(req)
})

router.post('/texts', (req, res) => {
  console.log(req)
})

module.exports = router

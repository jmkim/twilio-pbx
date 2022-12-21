require('dotenv').config({ path: './.env' })
const express = require('express')
const router = express.Router()
const got = require('got')
const twilio = require('twilio')
const strUtils = require('../utils/string')
const twilioUtils = require('../utils/twilio')
const logging = require('../utils/logging')
const uriBase = process.env.TWILIO_PBX_URI_BASE
const sendgridApiKey = process.env.SENDGRID_API_KEY
const sendgridApiPath = process.env.SENDGRID_API_PATH
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = twilio(accountSid, authToken)

async function mailInboundText (fromNumber, toNumber, body) {
  const toEmailAddress = process.env.TEXT_ALERT_TO_EMAIL_ADDRESS
  const fromEmail = twilioUtils.makePhoneNumberEmailAddress(
    await twilioUtils.lookupBasic(toNumber),
    process.env.TEXT_ALERT_FROM_EMAIL_ADDRESS,
    process.env.TEXT_ALERT_FROM_EMAIL_DOMAIN_ONLY
  )
  const fromEmailName = fromEmail.name
  const fromEmailAddress = fromEmail.address
  logging.log('text:mail', 'READY', `from: ${fromEmailAddress}, to: ${toEmailAddress}`)

  const title = `New message: ${fromNumber}`

  const requestBody = {
    personalizations: [{
      to: [{
        email: toEmailAddress
      }]
    }],
    from: {
      name: fromEmailName,
      email: fromEmailAddress
    },
    subject: title,
    content: [
      {
        type: 'text/plain',
        value: body
      }
    ]
  }

  await got.post(sendgridApiPath, {
    headers: {
      Authorization: `Bearer ${sendgridApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
    .then((res) => {
      logging.log('text:mail', 'OK', `title: ${title}, body: ${body}`)
    }, (err) => {
      logging.error('text:mail', 'ERROR', err)
    })
}

router.post('/', (req, res) => {
  if (!twilioUtils.checkAccountSid(req)) {
    return res.sendStatus(403)
  }

  const fromNumber = req.body.From
  const toNumber = req.body.To
  logging.log('text:exchange', 'OK', `from: ${fromNumber}, to: ${toNumber}`)

  const exchanger = new twilio.twiml.MessagingResponse()

  if (strUtils.strToArray(process.env.TEXT_COMMAND_PHONE_NUMBER).includes(fromNumber)) {
    exchanger.redirect({ method: 'POST' }, uriBase + 'texts/command')
  } else {
    exchanger.redirect({ method: 'POST' }, uriBase + 'texts/forward')
  }

  res.set('Content-Type', 'text/xml')
  res.send(exchanger.toString())
})

router.post('/command', async (req, res) => {
  if (!twilioUtils.checkAccountSid(req)) {
    return res.sendStatus(403)
  }

  const fromNumber = req.body.From
  const bridgeNumber = req.body.To
  const body = req.body.Body

  const commander = new twilio.twiml.MessagingResponse()
  const separatorPos = body.indexOf(':')

  if (separatorPos < 1) {
    commander.message(
      'You need to specify a recipient number and a ":" before the message. For example, "+12223334444: message".'
    )
    logging.log('text:command', 'FAIL', `msg: recipient number not provided, body: ${body}`)
  } else {
    const toNumber = body.substring(0, separatorPos).trim()
    const messageBody = body.substring(separatorPos + 1).trim()
    logging.log('text:command', 'READY', `from: ${fromNumber}, bridge: ${bridgeNumber}, to: ${toNumber}`)

    try {
      await client.messages.create({
        from: bridgeNumber,
        to: toNumber,
        body: messageBody
      })

      logging.log('text:command', 'OK', `from: ${bridgeNumber}, to: ${toNumber}, body: ${messageBody}`)
    } catch (err) {
      commander.message(
        'There was an issue with the phone number you entered; please verify it is correct and try again.'
      )
      logging.error('text:command', 'FAIL', `msg: error in to number, to: ${toNumber}`)
    }
  }

  res.set('Content-Type', 'text/xml')
  res.send(commander.toString())
})

router.post('/forward', async (req, res) => {
  if (!twilioUtils.checkAccountSid(req)) {
    return res.sendStatus(403)
  }

  const fromNumber = req.body.From
  const bridgeNumber = req.body.To
  const toCountry = req.body.ToCountry
  const body = req.body.Body
  const responseBody = `${fromNumber}: ${body}`

  let toNumber
  if (toCountry === 'US') {
    toNumber = process.env.CALL_RECEIVE_US_PHONE_NUMBER
  } else {
    toNumber = process.env.CALL_RECEIVE_INTL_PHONE_NUMBER
  }
  logging.log('text:forward', 'READY', `from: ${fromNumber}, bridge: ${bridgeNumber}, to: ${toNumber}`)

  await mailInboundText(fromNumber, bridgeNumber, body)

  const forwarder = new twilio.twiml.MessagingResponse()

  forwarder.message({
    from: bridgeNumber,
    to: toNumber
  }, responseBody)
  logging.log('text:forward', 'OK', `from: ${bridgeNumber}, to: ${toNumber}, body: ${responseBody}`)

  res.set('Content-Type', 'text/xml')
  res.send(forwarder.toString())
})

module.exports = router

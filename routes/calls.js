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

async function mailMissedCall (fromNumber, toNumber) {
  const toEmailAddress = process.env.CALL_ALERT_TO_EMAIL_ADDRESS
  const fromEmail = twilioUtils.makePhoneNumberEmailAddress(
    await twilioUtils.lookupBasic(toNumber),
    process.env.CALL_ALERT_FROM_EMAIL_ADDRESS,
    process.env.CALL_ALERT_FROM_EMAIL_DOMAIN_ONLY
  )
  const fromEmailName = fromEmail.name
  const fromEmailAddress = fromEmail.address
  logging.log('call:mail', 'READY', `from: ${fromEmailAddress}, to: ${toEmailAddress}`)

  const title = `Missed call: ${fromNumber}`
  const body = `Missed call: ${fromNumber}`

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
      logging.log('call:mail', 'OK', `title: ${title}, body: ${body}`)
    }, (err) => {
      logging.error('call:mail', 'ERROR', err)
    })
}

async function messageInboundCall (fromNumber, fromCountry, toNumber, messageToNumber) {
  logging.log('call:message', 'READY', `from: ${toNumber}, to: ${messageToNumber}`)

  let body = `Incoming call: ${fromNumber} (${fromCountry})`

  try {
    let lookedFrom
    switch (true) {
      case (strUtils.strToBool(process.env.CALL_SHOW_CARRIER) === true && strUtils.strToBool(process.env.CALL_SHOW_CALLER_ID) === true && fromCountry === 'US'): {
        lookedFrom = await twilioUtils.lookupFull(fromNumber)
        const callerId = lookedFrom.callerName.caller_name
        if (callerId !== null) {
          body += `
Name: ${callerId}`
        }

        const carrierName = lookedFrom.carrier.name
        const carrierType = lookedFrom.carrier.type
        body += `
Carrier: ${carrierName} (${carrierType})`
      }
        break
      case (strUtils.strToBool(process.env.CALL_SHOW_CALLER_ID) === true && fromCountry === 'US'): {
        lookedFrom = await twilioUtils.lookupCallerName(fromNumber)
        const callerId = lookedFrom.callerName.caller_name
        if (callerId !== null) {
          body += `
Name: ${callerId}`
        }
      }
        break
      case (strUtils.strToBool(process.env.CALL_SHOW_CARRIER) === true): {
        lookedFrom = await twilioUtils.lookupCarrier(fromNumber)
        const carrierName = lookedFrom.carrier.name
        const carrierType = lookedFrom.carrier.type
        body += `
Carrier: ${carrierName} (${carrierType})`
      }
        break
    }
  } catch (err) {
    logging.error('call:message', 'ERROR', err)
  } finally {
    await client.messages.create({
      from: toNumber,
      to: messageToNumber,
      body
    })
    logging.log('call:message', 'OK', `body: ${body}`)
  }
}

router.post('/', (req, res) => {
  if (!twilioUtils.checkAccountSid(req)) {
    return res.sendStatus(403)
  }

  const fromNumber = req.body.From
  const toNumber = req.body.To
  logging.log('call:exchange', 'OK', `from: ${fromNumber}, to: ${toNumber}`)

  const exchanger = new twilio.twiml.VoiceResponse()

  if (strUtils.strToArray(process.env.CALL_COMMAND_PHONE_NUMBER).includes(fromNumber)) {
    exchanger.redirect({ method: 'POST' }, uriBase + 'calls/command')
  } else {
    exchanger.redirect({ method: 'POST' }, uriBase + 'calls/forward')
  }

  res.set('Content-Type', 'text/xml')
  res.send(exchanger.toString())
})

router.post('/command', (req, res) => {
  if (!twilioUtils.checkAccountSid(req)) {
    return res.sendStatus(403)
  }

  const fromNumber = req.body.From
  const bridgeNumber = req.body.To
  logging.log('call:command', 'READY', `from: ${fromNumber}, bridge: ${bridgeNumber}`)

  const commander = new twilio.twiml.VoiceResponse()

  logging.log('call:command', 'WAIT', 'msg: wait for dialer')
  const gather = commander.gather({
    action: uriBase + 'calls/dial',
    method: 'POST',
    input: 'dtmf',
    finishOnKey: '#',
    timeout: process.env.CALL_COMMAND_TIMEOUT
  })
  gather.say('Enter the number you want to call, followed by pound key.')

  commander.say('Dialer timeout exceeded.')
  commander.say('Goodbye.')

  res.set('Content-Type', 'text/xml')
  res.send(commander.toString())
})

router.post('/dial', (req, res) => {
  if (!twilioUtils.checkAccountSid(req)) {
    return res.sendStatus(403)
  }

  const fromNumber = req.body.To
  const toNumber = `+${req.body.Digits}`
  logging.log('call:dial', 'READY', `from: ${fromNumber}, to: ${toNumber}`)

  const dialer = new twilio.twiml.VoiceResponse()

  dialer.dial({
    action: uriBase + 'calls/dial/result',
    method: 'POST',
    callerId: fromNumber,
    timeout: process.env.CALL_RECEIVE_TIMEOUT
  }, toNumber)

  res.set('Content-Type', 'text/xml')
  res.send(dialer.toString())
})

router.post('/dial/result', (req, res) => {
  if (!twilioUtils.checkAccountSid(req)) {
    return res.sendStatus(403)
  }

  const fromNumber = req.body.From
  const toNumber = req.body.To
  const dialStatus = req.body.DialCallStatus
  logging.log('call:dial', 'OK', `from: ${fromNumber}, to: ${toNumber}, dial_status: ${dialStatus}`)

  const resulter = new twilio.twiml.VoiceResponse()
  switch (dialStatus) {
    case 'completed':
      resulter.say('Call was completed.')
      break
    case 'answered':
      resulter.say('Call was answered.')
      break
    case 'busy':
      resulter.say('Call is busy.')
      break
    case 'no-answer':
      resulter.say('Call was not answered.')
      break
    case 'failed':
      resulter.say('Call failed.')
      break
    case 'canceled':
      resulter.say('Call canceled.')
      break
  }

  resulter.say('Goodbye.')
  resulter.hangup()

  res.set('Content-Type', 'text/xml')
  res.send(resulter.toString())
})

router.post('/forward', async (req, res) => {
  if (!twilioUtils.checkAccountSid(req)) {
    return res.sendStatus(403)
  }

  const fromNumber = req.body.From
  const fromCountry = req.body.FromCountry
  const bridgeNumber = req.body.To
  const bridgeCountry = req.body.ToCountry

  let toNumber
  if (bridgeCountry === 'US') {
    toNumber = process.env.CALL_RECEIVE_US_PHONE_NUMBER
  } else {
    toNumber = process.env.CALL_RECEIVE_INTL_PHONE_NUMBER
  }
  logging.log('call:forward', 'READY', `from: ${fromNumber}, bridge: ${bridgeNumber}, to: ${toNumber}`)

  await messageInboundCall(fromNumber, fromCountry, bridgeNumber, toNumber)

  const forwarder = new twilio.twiml.VoiceResponse()

  forwarder.dial({
    action: uriBase + 'calls/forward/result',
    method: 'POST',
    callerId: fromNumber,
    answerOnBridge: true,
    timeout: process.env.CALL_RECEIVE_TIMEOUT
  }, toNumber)

  forwarder.hangup()

  res.set('Content-Type', 'text/xml')
  res.send(forwarder.toString())
})

router.post('/forward/result', async (req, res) => {
  if (!twilioUtils.checkAccountSid(req)) {
    return res.sendStatus(403)
  }

  const fromNumber = req.body.From
  const toNumber = req.body.To
  const dialStatus = req.body.DialCallStatus
  logging.log('call:forward', 'OK', `from: ${fromNumber}, to: ${toNumber}, dial_status: ${dialStatus}`)

  const resulter = new twilio.twiml.VoiceResponse()
  switch (dialStatus) {
    case 'completed':
    case 'answered':
      break
    case 'busy':
    case 'no-answer':
    case 'failed':
    case 'canceled':
      await mailMissedCall(fromNumber, toNumber)
      break
  }

  resulter.say('Goodbye.')
  resulter.hangup()

  res.set('Content-Type', 'text/xml')
  res.send(resulter.toString())
})

module.exports = router

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilio = require('twilio')
const client = twilio(accountSid, authToken)
const lookup = client.lookups.v1

module.exports = {
  checkAccountSid: function (req) {
    try {
      if (req.body.AccountSid === process.env.TWILIO_ACCOUNT_SID) {
        return true
      }
    } catch (e) {
    }

    return false
  },

  lookupBasic: async (phoneNumber) => {
    return await lookup.phoneNumbers(phoneNumber).fetch()
  },

  lookupCarrier: async (phoneNumber) => {
    return await lookup.phoneNumbers(phoneNumber).fetch({ type: ['carrier'] })
  },

  lookupCallerName: async (phoneNumber) => {
    return await lookup.phoneNumbers(phoneNumber).fetch({ type: ['caller-name'] })
  },

  lookupFull: async (phoneNumber) => {
    return await lookup.phoneNumbers(phoneNumber).fetch({ type: ['carrier', 'caller-name'] })
  },

  isUSPhoneNumber: (lookedNumber) => {
    return lookedNumber.countryCode === 'US'
  },

  makePhoneNumberEmailAddress: (lookedNumber, emailAddress, isEmailDomainOnly) => {
    const name = lookedNumber.nationalFormat
    if (!isEmailDomainOnly) {
      return {
        name,
        address: emailAddress
      }
    }

    const emailAddressNumbered = lookedNumber.phoneNumber.replace(/[^0-9]/g, '') + '@' + emailAddress
    return {
      name,
      address: emailAddressNumbered
    }
  }
}

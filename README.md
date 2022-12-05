# twilio-pbx: A Virtual PBX Server for Twilio

## Environmental variables

Environmental variables could be stored in `.env` file in the root directory.
The example template is located at `.env.template`.

* `TWILIO_PBX_PORT`
  * Port number to bind and run the Twilio PBX server
  * format: `int`
  * example: `3000`
* `SENDGRID_API_KEY`
  * SendGrid API key
  * format: `string`
* `SENDGRID_API_PATH`
  * SendGrid API endpoint
  * format: `uri`
  * default: `https://api.sendgrid.com/v3/mail/send`
* `TWILIO_ACCOUNT_SID`
  * Twilio account SID
  * format: `string`
* `TWILIO_AUTH_TOKEN`
  * Twilio auth token
  * format: `string`
* `CALL_ALERT_FROM_EMAIL_ADDRESS`
  * Source email address to send the Call Alert
  * The address should be a Sender address in SendGrid
  * format: `string` - `domain` or `email`
    * If the value is `domain`, `CALL_ALERT_FROM_EMAIL_DOMAIN_ONLY` should be `1`.
* `CALL_ALERT_FROM_EMAIL_DOMAIN_ONLY`
  * Flag if the value of `CALL_ALERT_FROM_EMAIL_ADDRESS` is domain only or not
  * format: `int` - `0` or `1`
    * `1` if `CALL_ALERT_FROM_EMAIL_ADDRESS` is `domain`, otherwise `0`.
  * notes:
    * If the value is `1`, Twilio PBX will generate the email sender as following format:
      * `USERNAME` `@` `CALL_ALERT_FROM_EMAIL_ADDRESS`
      * `USERNAME` will be E.164 formatted phone number without `+` sign.
      * All the possible addresses should be Sender addresses in SendGrid.
* `CALL_ALERT_TO_EMAIL_ADDRESS`
  * Destination email address to receive the Call Alert
  * format: `string` - `email`
* `CALL_COMMAND_PHONE_NUMBER`
  * Source phone number for the Call Command mode
    * All the numbers here will be routed to the Call Command mode.
    * Others will be routed to the Call Forwarding mode.
  * format: `,` seperated `string` - E.164 formatted phone number
  * example: `+12120007890,+821000337890`
* `CALL_COMMAND_TIMEOUT`
  * Timeout for waiting the number press in the Call Command mode
  * format: `int` - positive integer, in seconds
* `CALL_RECEIVE_US_PHONE_NUMBER`
  * Destination phone number for US Twilio number Call Forwarding mode
  * format: `string` - E.164 formatted phone number
  * example: `+12120007890`
* `CALL_RECEIVE_INTL_PHONE_NUMBER`
  * Destination phone number for non-US Twilio number Call Forwarding mode
  * format: `string` - E.164 formatted phone number
  * example: `+821000337890`
  * notes:
    * Twilio blocks the message outbound to US for non-US Twilio numbers.
    * If you set US number here for non-US Twilio number, you cannot receive the Call Alert message.
* `CALL_RECEIVE_TIMEOUT`
  * Timeout for waiting the destination phone response in the Call Forwarding mode
  * format: `int` - positive integer, in seconds
* `CALL_SHOW_CARRIER`
  * Flag for include the carrier informations in the Call Alert
  * format: `int` - `0` or `1`
  * notes:
    * It uses Twilio Lookup API - Carrier
    * It costs additional 0.005 USD per a call
* `CALL_SHOW_CALLER_ID`
  * Flag for include the Caller ID in the Call Alert
  * format: `int` - `0` or `1`
  * notes:
    * It uses Twilio Lookup API - Carrier
    * It costs additional 0.01 USD per a call
* `TEXT_ALERT_FROM_EMAIL_ADDRESS`
  * Source email address to send the Text Alert
  * The address should be a Sender address in SendGrid
  * format: `string` - `domain` or `email`
    * If the value is `domain`, `CALL_ALERT_FROM_EMAIL_DOMAIN_ONLY` should be `1`.
* `TEXT_ALERT_FROM_EMAIL_DOMAIN_ONLY`
  * Flag if the value of `TEXT_ALERT_FROM_EMAIL_ADDRESS` is domain only or not
  * format: `int` - `0` or `1`
    * `1` if `TEXT_ALERT_FROM_EMAIL_ADDRESS` is `domain`, otherwise `0`.
  * notes:
    * If the value is `1`, Twilio PBX will generate the email sender as following format:
      * `USERNAME` `@` `TEXT_ALERT_FROM_EMAIL_ADDRESS`
      * `USERNAME` will be E.164 formatted phone number without `+` sign.
      * All the possible addresses should be Sender addresses in SendGrid.
* `TEXT_ALERT_TO_EMAIL_ADDRESS`
  * Destination email address to receive the Text Alert
  * format: `string` - `email`
* `TEXT_COMMAND_PHONE_NUMBER`
  * Source phone number for the Text Command mode
    * All the numbers here will be routed to the Text Command mode.
    * Others will be routed to the Text Forwarding mode.
  * format: `,` seperated `string` - E.164 formatted phone number
  * example: `+12120007890,+821000337890`
  * notes:
    * Twilio blocks the message outbound to US for non-US Twilio numbers.
    * If you set US number here for non-US Twilio number, you cannot receive the command response.
    * If you send to US number from non-US Twilio number, it will be undelivered sliently.
* `TEXT_RECEIVE_US_PHONE_NUMBER`
  * Destination phone number for US Twilio number Text Forwarding mode
  * format: `string` - E.164 formatted phone number
  * example: `+12120007890`
* `TEXT_RECEIVE_INTL_PHONE_NUMBER`
  * Destination phone number for non-US Twilio number Text Forwarding mode
  * format: `string` - E.164 formatted phone number
  * example: `+821000337890`
  * notes:
    * Twilio blocks the message outbound to US for non-US Twilio numbers.
    * If you set US number here for non-US Twilio number, you cannot receive the Text Alert message.

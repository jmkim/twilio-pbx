# twilio-pbx: A Virtual PBX Server for Twilio

## Deployment

twilio-pbx supports two ways for deployment: one is **Node.js Standalone server** and another is **Firebase Cloud Functions**.

### Option 1: Node.js Standalone server

1. Install npm dependencies

    ```bash
    npm install
    ```

2. Copy the `.env` file from `.env.template`

    ```bash
    cp .env.template .env
    ```

3. Edit the `.env` file
4. Run the server

    ```bash
    npm run start
    ```

### Option 2: Firebase Cloud Functions

1. Make ready the Firebase Cloud Functions
    * Create the project at [firebase.google.com](http://firebase.google.com).
    * Make sure the billing is activated, which is required by the Firebase Cloud Functions.
      * Note: Firebase Cloud Functions is only available with paid account. It does not offer the free trial.
    * Install and login to Firebase

        ```bash
        npm install -g firebase-tools # Globally install the Firebase CLI Tools
        firebase login                # Login
        ```

2. Copy the `.firebaserc` file from `.firebaserc.template`

    ```bash
    cp .firebaserc.template .firebaserc
    ```

3. Set the actual project name in `.firebaserc`
    * Replace `FIREBASE_PROJECT_NAME_HERE` with the actual project name

4. Copy the `.env` file from `.env.template`

    ```bash
    cp .env.template .env
    ```

5. Edit the `.env` file
6. Emulate the server in local machine

    ```bash
    npm run serve
    ```

7. Deploy the server to the Firebase Cloud Functions

    ```bash
    npm run deploy
    ```

## Environmental variables

Environmental variables could be stored in `.env` file in the root directory.
The example template is located at `.env.template`.

* `TWILIO_PBX_URI_BASE`
  * Base URI to bind and run the Twilio PBX server
  * It must include the trailing `/`.
  * format: `string`
  * example:
    * `/` if deployed on local
    * `/pbx/` if deployed on Firebase Cloud Functions
    * Again, do not forget the trailing `/`.
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
    * If you set the US number here for non-US Twilio number, you cannot receive the Call Alert message.
* `CALL_RECEIVE_TIMEOUT`
  * Timeout for waiting the destination phone response in the Call Forwarding mode
  * format: `int` - positive integer, in seconds
* `CALL_SHOW_CARRIER`
  * Flag for include the carrier information in the Call Alert
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
    * If you set the US number here for non-US Twilio number, you cannot receive the command response.
    * If you send to the US number from non-US Twilio number, it will be undelivered silently.
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
    * If you set the US number here for non-US Twilio number, you cannot receive the Text Alert message.

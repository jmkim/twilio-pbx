# twilio-pbx: A Virtual PBX Server for Twilio

A Virtual PBX Server for [Twilio](https://www.twilio.com). Supports [standalone Node.js server](#option-1-nodejs-standalone-server) and [Firebase Cloud Functions](#option-2-firebase-cloud-functions).

1. [How to use](#how-to-use)
   1. [Call modes](#call-modes)
   2. [Text modes](#text-modes)
2. [How to install](#how-to-install)
   1. [Node.js Standalone server](#option-1-nodejs-standalone-server)
   2. [Firebase Cloud Functions](#option-2-firebase-cloud-functions)
3. [APIs](#apis)
4. [Environmental variables](#environmental-variables)

## How to use

### Call modes

#### Call Command mode

*(Make a call)*

* To make a call:
  1. Call to your Twilio number, from one of [`CALL_COMMAND_PHONE_NUMBER`](#call_command_phone_number).
  2. In the call, you can dial the number.
  3. In the call, a new call will be made with your Twilio number, to the dialed number.

#### Call Forwarding mode

*(Receive a call)*

* Calls to your Twilio number will be forwarded to the desired number:
  * If the call is from the US number, it will be forwarded to [`CALL_RECEIVE_US_PHONE_NUMBER`](#call_receive_us_phone_number).
  * Otherwise, it will be forwarded to [`CALL_RECEIVE_INTL_PHONE_NUMBER`](#call_receive_intl_phone_number).
  * Exceptions: the calls from the numbers in [`CALL_COMMAND_PHONE_NUMBER`](#call_command_phone_number) will be routed to the [Call Command mode](#call-command-mode).
* [Call Alert](#call-alert) will be sent to your Twilio number, simultaneously.

#### Call Alert

*(Alert the call: incoming call and missed call)*

* **With the call forwarding,** Call Alert will be sent to your Twilio number.
  * If you have multiple Twilio numbers, this will help you identify the number which has the call.
  * The message for incoming call looks like below:

    ```plain
    Incoming call: +12120007890 (US)
    Name: KIM,JONGMIN
    Carrier: T-Mobile USA, Inc. (mobile)
    ```

    * You can control the information included in the message:
      * [`CALL_SHOW_CARRIER`](#call_show_carrier) controls the carrier lookup (0.005 USD per a call, billed by Twilio)

        ```plain
        Incoming call: +12120007890 (US)
        Carrier: T-Mobile USA, Inc. (mobile)
        ```

      * [`CALL_SHOW_CALLER_ID`](#call_show_caller_id) controls the Caller ID lookup (0.01 USD per a call, billed by Twilio)

        ```plain
        Incoming call: +12120007890 (US)
        Name: KIM,JONGMIN
        ```

      * If both flags disabled, the message would be like below:

        ```plain
        Incoming call: +12120007890 (US)
        ```

* **When you missed the call,** Call Alert will be sent to your email [`CALL_ALERT_TO_EMAIL_ADDRESS`](#call_alert_to_email_address).
  * The email for missed call looks like below:

    ```plain
    Subject:    Missed call: +12120007890
    From:       12120007890@example.com
    To:         jmkim@jongmin.dev

    Missed call: +12120007890
    ```

### Text modes

#### Text Command mode

*(Send a message)*

* Text to your Twilio number, from one of [`TEXT_COMMAND_PHONE_NUMBER`](#text_command_phone_number).
* The message format should follow below:

  ```plain
  TO_NUMBER:MESSAGE_BODY
  ```

  * `TO_NUMBER` must be [E.164 formatted](https://www.twilio.com/docs/glossary/what-e164).

* Examples:
  * Single-line text example:

    ```plain
    +12120007890:Hi
    ```

    * will send below message to `+1 (212) 000-7890`:

      ```plain
      Hi
      ```

  * Multi-line text example:

    ```plain
    +821000337890:Hey, this is Jongmin.
    Happy holiday o/
    ```

    * will send below message to `+82 10-0033-7890`:

      ```plain
      Hey, this is Jongmin.
      Happy holiday o/
      ```

#### Text Forwarding mode

*(Receive a message)*

* Texts to your Twilio number will be forwarded to the desired number:
  * If the text is from the US number, it will be forwarded to [`TEXT_RECEIVE_US_PHONE_NUMBER`](#text_receive_us_phone_number).
  * Otherwise, it will be forwarded to [`TEXT_RECEIVE_INTL_PHONE_NUMBER`](#text_receive_intl_phone_number).
  * Exceptions: the calls from the numbers in [`TEXT_COMMAND_PHONE_NUMBER`](#text_command_phone_number) will be routed to the [Text Command mode](#text-command-mode).
* [Text Alert](#text-alert) will be sent to the email, simultaneously.

#### Text Alert

*(Alert the text: incoming text)*

* **With the text forwarding,** Text Alert email will be sent to [`TEXT_ALERT_TO_EMAIL_ADDRESS`](#text_alert_to_email_address).
  * The email for incoming text looks like below:

    ```plain
    Subject:    New message: +12120007890
    From:       12120007890@example.com
    To:         jmkim@jongmin.dev

    Hey, this is Jongmin.
    Happy holiday o/
    ```

## How to install

twilio-pbx supports two ways for deployment: one is **[Node.js Standalone server](#option-1-nodejs-standalone-server)** and another is **[Firebase Cloud Functions](#option-2-firebase-cloud-functions)**.

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

## APIs

### `POST /calls`

* Exchange the inbound call
  * If the call is from one of [`CALL_COMMAND_PHONE_NUMBER`](#call_command_phone_number), route to [`/calls/command`](#post-callscommand).
  * Otherwise, route to [`/calls/forward`](#post-callsforward).

### `POST /calls/command`

* **Call Command mode**
* Let the user press the dial, to make the outbound call
  * Uses [DTMF (tone dialing)](https://en.wikipedia.org/wiki/Dual-tone_multi-frequency_signaling).
  * Dialing finishes on `#` key, or after the timeout with [`CALL_COMMAND_TIMEOUT`](#call_command_timeout).
* After the dialing, route to [`/calls/dial`](#post-callsdial)

### `POST /calls/dial`

* Make the call to the number gathered by [`/calls/command`](#post-callscommand)
* After the call end, route to [`/calls/dial/result`](#post-callsdialresult)

### `POST /calls/dial/result`

* Speak back the result of the call, and then hang up

### `POST /calls/forward`

* **Call Forward mode**
* Forward the inbound call to desired receive phone number
  * If the call is from the US number, forward to [`CALL_RECEIVE_US_PHONE_NUMBER`](#call_receive_us_phone_number).
  * Otherwise, forward to [`CALL_RECEIVE_INTL_PHONE_NUMBER`](#call_receive_intl_phone_number).
  * Send the carrier and/or Caller ID information to desired receive phone number.
    * [`CALL_SHOW_CARRIER`](#call_show_carrier) controls the carrier lookup (0.005 USD per a call, billed by Twilio)
    * [`CALL_SHOW_CALLER_ID`](#call_show_caller_id) controls the Caller ID lookup (0.01 USD per a call, billed by Twilio)
  * Send the email when the call missed, to [`CALL_ALERT_TO_EMAIL_ADDRESS`](#call_alert_to_email_address)
* After the call end, route to [`/calls/forward/result`](#post-callsforwardresult)

### `POST /calls/forward/result`

* Speak back the result of the call, and then hang up

### `POST /texts`

* Exchange the inbound text
  * If the text is from one of [`TEXT_COMMAND_PHONE_NUMBER`](#text_command_phone_number), route to [`/texts/command`](#post-textscommand).
  * Otherwise, route to [`/texts/forward`](#post-textsforward).

### `POST /texts/command`

* **Text Command mode**
* Send the outbound text, when the inbound text is following format:

  ```plain
  TO_NUMBER:MESSAGE_BODY
  ```

  * `TO_NUMBER` must be [E.164 formatted](https://www.twilio.com/docs/glossary/what-e164).

### `POST /texts/forward`

* **Text Forward mode**
* Forward the inbound text to desired receive phone number
  * If the text is from the US number, forward to [`TEXT_RECEIVE_US_PHONE_NUMBER`](#text_receive_us_phone_number).
  * Otherwise, forward to [`TEXT_RECEIVE_INTL_PHONE_NUMBER`](#text_receive_intl_phone_number).
* Forward the inbound text to [`TEXT_ALERT_TO_EMAIL_ADDRESS`](#text_alert_to_email_address)

## Environmental variables

Environmental variables could be stored in `.env` file in the root directory.
The example template is located at `.env.template`.

### `TWILIO_PBX_URI_BASE`

* Base URI to bind and run the Twilio PBX server
* It must include the trailing `/`.
* format: `string`
* example:
  * `/` if deployed on local
  * `/pbx/` if deployed on Firebase Cloud Functions
  * Again, do not forget the trailing `/`.

### `TWILIO_PBX_PORT`

* Port number to bind and run the Twilio PBX server
* format: `int`
* example: `3000`

### `SENDGRID_API_KEY`

* SendGrid API key
* format: `string`

### `SENDGRID_API_PATH`

* SendGrid API endpoint
* format: `uri`
* default: `https://api.sendgrid.com/v3/mail/send`

### `TWILIO_ACCOUNT_SID`

* Twilio account SID
* format: `string`

### `TWILIO_AUTH_TOKEN`

* Twilio auth token
* format: `string`

### `CALL_ALERT_FROM_EMAIL_ADDRESS`

* Source email address to send the [Call Alert](#call-alert)
* The address should be a Sender address in SendGrid
* format: `string` - `domain` or `email`
  * If the value is `domain`, [`CALL_ALERT_FROM_EMAIL_DOMAIN_ONLY`](#call_alert_from_email_domain_only) should be `1`.

### `CALL_ALERT_FROM_EMAIL_DOMAIN_ONLY`

* Flag if the value of [`CALL_ALERT_FROM_EMAIL_ADDRESS`](#call_alert_from_email_address) is domain only or not
* format: `int` - `0` or `1`
  * `1` if [`CALL_ALERT_FROM_EMAIL_ADDRESS`](#call_alert_from_email_address) is `domain`, otherwise `0`.
* notes:
  * If the value is `1`, Twilio PBX will generate the email sender as following format:
    * `USERNAME` `@` [`CALL_ALERT_FROM_EMAIL_ADDRESS`](#call_alert_from_email_address)
    * `USERNAME` will be [E.164 formatted](https://www.twilio.com/docs/glossary/what-e164) phone number without `+` sign.
    * All the possible addresses should be Sender addresses in SendGrid.

### `CALL_ALERT_TO_EMAIL_ADDRESS`

* Destination email address to receive the [Call Alert](#call-alert)
* format: `string` - `email`

### `CALL_COMMAND_PHONE_NUMBER`

* Source phone number for the [Call Command mode](#call-command-mode)
  * All the numbers here will be routed to the [Call Command mode](#call-command-mode).
  * Others will be routed to the [Call Forwarding mode](#call-forwarding-mode).
* format: `,` seperated `string` - [E.164 formatted](https://www.twilio.com/docs/glossary/what-e164) phone number
* example: `+12120007890,+821000337890`

### `CALL_COMMAND_TIMEOUT`

* Timeout for waiting the number press in the [Call Command mode](#call-command-mode)
* format: `int` - positive integer, in seconds

### `CALL_RECEIVE_US_PHONE_NUMBER`

* Destination phone number for US Twilio number [Call Forwarding mode](#call-forwarding-mode)
* format: `string` - [E.164 formatted](https://www.twilio.com/docs/glossary/what-e164) phone number
* example: `+12120007890`

### `CALL_RECEIVE_INTL_PHONE_NUMBER`

* Destination phone number for non-US Twilio number [Call Forwarding mode](#call-forwarding-mode)
* format: `string` - [E.164 formatted](https://www.twilio.com/docs/glossary/what-e164) phone number
* example: `+821000337890`
* notes:
  * Twilio blocks the message outbound to US for non-US Twilio numbers.
  * If you set the US number here for non-US Twilio number, you cannot receive the [Call Alert](#call-alert) message.

### `CALL_RECEIVE_TIMEOUT`

* Timeout for waiting the destination phone response in the [Call Forwarding mode](#call-forwarding-mode)
* format: `int` - positive integer, in seconds

### `CALL_SHOW_CARRIER`

* Flag for include the carrier information in the [Call Alert](#call-alert)
* format: `int` - `0` or `1`
* notes:
  * It uses Twilio Lookup API - Carrier
  * It costs additional 0.005 USD per a call

### `CALL_SHOW_CALLER_ID`

* Flag for include the Caller ID in the [Call Alert](#call-alert)
* format: `int` - `0` or `1`
* notes:
  * It uses Twilio Lookup API - Carrier
  * It costs additional 0.01 USD per a call

### `TEXT_ALERT_FROM_EMAIL_ADDRESS`

* Source email address to send the [Text Alert](#text-alert)
* The address should be a Sender address in SendGrid
* format: `string` - `domain` or `email`
  * If the value is `domain`, [`TEXT_ALERT_FROM_EMAIL_DOMAIN_ONLY`](#text_alert_from_email_domain_only) should be `1`.

### `TEXT_ALERT_FROM_EMAIL_DOMAIN_ONLY`

* Flag if the value of `TEXT_ALERT_FROM_EMAIL_ADDRESS` is domain only or not
* format: `int` - `0` or `1`
  * `1` if [`TEXT_ALERT_FROM_EMAIL_ADDRESS`](#text_alert_from_email_address) is `domain`, otherwise `0`.
* notes:
  * If the value is `1`, Twilio PBX will generate the email sender as following format:
    * `USERNAME` `@` [`TEXT_ALERT_FROM_EMAIL_ADDRESS`](#text_alert_from_email_address)
    * `USERNAME` will be [E.164 formatted](https://www.twilio.com/docs/glossary/what-e164) phone number without `+` sign.
    * All the possible addresses should be Sender addresses in SendGrid.

### `TEXT_ALERT_TO_EMAIL_ADDRESS`

* Destination email address to receive the [Text Alert](#text-alert)
* format: `string` - `email`

### `TEXT_COMMAND_PHONE_NUMBER`

* Source phone number for the [Text Command mode](#text-command-mode)
  * All the numbers here will be routed to the [Text Command mode](#text-command-mode).
  * Others will be routed to the [Text Forwarding mode](#text-forwarding-mode).
* format: `,` seperated `string` - [E.164 formatted](https://www.twilio.com/docs/glossary/what-e164) phone number
* example: `+12120007890,+821000337890`
* notes:
  * Twilio blocks the message outbound to US for non-US Twilio numbers.
  * If you set the US number here for non-US Twilio number, you cannot receive the command response.
  * If you send to the US number from non-US Twilio number, it will be undelivered silently.

### `TEXT_RECEIVE_US_PHONE_NUMBER`

* Destination phone number for US Twilio number [Text Forwarding mode](#text-forwarding-mode)
* format: `string` - [E.164 formatted](https://www.twilio.com/docs/glossary/what-e164) phone number
* example: `+12120007890`

### `TEXT_RECEIVE_INTL_PHONE_NUMBER`

* Destination phone number for non-US Twilio number [Text Forwarding mode](#text-forwarding-mode)
* format: `string` - [E.164 formatted](https://www.twilio.com/docs/glossary/what-e164) phone number
* example: `+821000337890`
* notes:
  * Twilio blocks the message outbound to US for non-US Twilio numbers.
  * If you set the US number here for non-US Twilio number, you cannot receive the [Text Alert](#text-alert) message.

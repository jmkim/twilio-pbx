#!/usr/bin/env node

const app = require('./app')
const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()
exports.pbx = functions.https.onRequest(app)

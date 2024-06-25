const express = require("express");
const exportTemplate = require('./exportTemplate');
const resetPassword = require('./resetPassword')
const auth = require('./auth');
const app = express();

app.post('/exportTemplateApotik/:delimiter', exportTemplate.exportTemplateApotik);
app.post('/exportTemplateUser/:delimiter', exportTemplate.exportTemplateUser);
app.post('/reset-password', resetPassword.ResetPasswordProgress)

module.exports = app
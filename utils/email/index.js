// const logError = require('debug')('error');
// const logMails = require('debug')('mails');
// const fs = require('fs');
// const _ = require('lodash');
// const { isEmpty } = require('lodash');

// const mongoose = require('mongoose');
// const DateOnly = require('mongoose-dateonly')(mongoose);
// const async = require('async');
// const moment = require('moment');

// const common = require('../common');
// const emailTemplate = require('./templates');
// const awsService = require('../../services/file_upload/aws');

// // load model in different way, because UserModel in users/index.js return undefined
// const RncpModel = require('../../graphql/rncpTitles/rncp_title.model');
// const UserModel = require('../../graphql/users/user.model');
// const NotificationHistoryModel = require('../../graphql/notificationHistories/notification_history.model');
// const MailModel = require('../../graphql/mails/mail.model');
// const ClassModel = require('../../graphql/classes/class.model');
// const FormProcessModel = require('../../graphql/formProcess/models/form_process.model');

// const { resolve } = require('path');

// const platformEmail = 'notification@admtc.pro'; // Email address for platform
// const aideEmail = 'aide@admtc.info';
// const admtcCCEmail = 'copie.notif@admtc.pro';

// const emailToSendAllEmails = 'test.notif.admtc@gmail.com'; //set this to email ID to which all emails are to be sent in all environments except production.

// function sendMail(mailOptions, callback = () => {}) {
//   let currentYear = moment().year() -1;
//   if (mailOptions.is_from_cron_job) {
//     currentYear = moment().year()
//   }

//   if (mailOptions.notificationReference === 'WrgMail_N2B') {
//     currentYear = moment().year() - 5
//   }

//   const emailHas = new RegExp('_hash');
//   if (_.isArray(mailOptions.to)) {
//     for (const email of mailOptions.to)
//       if (emailHas.test(email)) {
//         return;
//       }
//   } else if (emailHas.test(mailOptions.to)) {
//     return;
//   }

//   let count = 0;
//   /* mailOptions:
//    *  {
//    *      to : '',
//    *      lang : '',
//    *      subject : '',
//    *      from : '',
//    *      requiredParams : {}         JSON from emailTemplates.
//    *  }
//    */

//   // *************** to block / unblock notification
//   const unblockedNotifications = [
//     'ForgetPass_N1',
//     'RegUser_N1',
//     'RegReminder_N1',
//     'STUD_N1',
//     'ChgMail_N1',
//     'JOBDESC_N1',
//     'JOBDESC_N2',
//     // 'JOBDESC_N3',
//     // 'JOBDESC_N4',
//     'JOBDESC_N5',
//     'JOBDESC_N6',
//     // 'JOBDESC_N7',
//     // 'JOBDESC_N8',
//     'JOBDESC_N9',
//     // 'JOBDESC_N10',
//     // 'JOBDESC_N11',
//     'JOBDESC_N12',
//     'REJECTJOBDESC_N1',
//     'GROUP_N2',
//     'WrgMail_N1',
//     'CHANGE_COMP_CRON',
//     'STUD_N4',
//     'STUD_N6',
//     // 'VERIFY_N1',
//     // 'VERIFY_N2',
//     // 'VERIFY_N3',
//     'VERIFY_N4',
//     // 'VERIFY_N5',
//     'VERIFY_N8',
//     'VERIFY_N9',
//     'PROB_N1',
//     'PROB_N2',
//     'PROB_N3',
//     'PROB_N4',
//     'PROB_N4B',
//     'PROB_N4C',
//     'PROB_N5',
//     'PROB_N6',
//     'PROB_N7',
//     'PROB_N8',
//     'PROB_N9',
//     'PROB_N10',
//     'PROB_N11',
//     'PROB_N12',
//     'IMPORT_N1',
//     'IMPORT_N2',
//     'JURY_N1',
//     'JURY_N3',
//     'JURY_N5',
//     'JURY_N6',
//     'JURY_N7',
//     'JURY_N7B',
//     // 'JURY_N9',
//     'JURY_N10',
//     'JURY_N11',
//     'JURY_N15',
//     'JURY_N16',
//     'JURY_N17',
//     'JURY_N18',
//     // 'JURY_N19',
//     'JURY_N20',
//     'JURY_N21',
//     'RETAKEJURY_N1',
//     'RETAKEJURY_N2',
//     'RETAKEJURY_N3',
//     'TASK_N1',
//     'TASK_N4',
//     'TASK_N5',
//     'TASK_N7',
//     'AssignCorr_N1',
//     'CORRECTOR_N1',
//     'CORRECTOR_N2',
//     'CORRECTOR_N3',
//     'SubmitMark_N1',
//     'ValidateTest_N1',
//     'ChangeCorr_N1',
//     'StudExpectedDoc_N1',
//     'StudExpectedDoc_N2',
//     'GROUP_N1',
//     'GROUP_N2',
//     'GROUP_N3',
//     'DOC_N1',
//     'DOC_N2',
//     'DOC_N3',
//     'TRANSCRIPT_N1',
//     'TRANSCRIPT_N3',
//     'TRANSCRIPT_N3B',
//     'TRANSCRIPT_N4',
//     'CompChange_N1',
//     'MANUAL_EMAIL',
//     'TRANSCRIPT_N2',
//     'TRANSCRIPT_N2B',
//     'TRANSCRIPT_N5',
//     'TRANSCRIPT_N6',
//     'TRANSCRIPT_N7',
//     'TRANSCRIPT_N8',
//     'StatUpdate_N1',
//     'ESurvey_N1',
//     'ESurvey_N2',
//     'ESurvey_N3A',
//     'ESurvey_N3B',
//     // 'ESurvey_N4',
//     'ESurvey_N5',
//     'ESurvey_N6',
//     'ESNFStudRemind_N1',
//     'ESNFStudRemind_N2',
//     'ESNFADMTCRemind_N1',
//     'ESNFADMTCRemind_N2',
//     // 'ESNFADMTCRemind_N3',
//     'AUTOEVAL_N1',
//     'Nominatif_N1',
//     'Nominatif_N2',
//     'TESTCHECK_N1',
//     'PUBLISHED_TEST_N1',
//     'EVAL_PRO_N1',
//     // 'EVAL_PRO_N2',
//     'EVAL_PRO_N3',
//     'EVAL_PRO_N4',
//     'EVAL_PRO_N5',
//     'EVAL_PRO_N2_BIS',
//     'CROSS_N1',
//     'CROSS_N2',
//     'CROSS_N3',
//     'CROSS_N4',
//     'CROSS_N5',
//     'CROSS_N6',
//     'CROSS_N1_PAPERLESS',
//     'CROSS_N2_PAPERLESS',
//     'CROSS_N5_PAPERLESS',
//     'CROSS_N4_PAPERLESS',
//     // 'GrandDoc_N1A',
//     'GrandDoc_N1B',
//     'StudExpectedDoc_N3',
//     'RemindRehersal_N1',
//     'CERT_N1',
//     'CERT_N2',
//     'CERT_N4',
//     'CERT_N3',
//     'STUD_N7',
//     'STUD_N8',
//     'STUD_N9',
//     'STUD_N10',
//     'STUD_N11',
//     'STUD_N12',
//     'STUD_N13',
//     'DUMMY_N1',
//     'ASKREVISION_N1',
//     'REPLYREVISION_N1',
//     'UserForm_N1',
//     'UserForm_N2',
//     'UserForm_N4',
//     'UserForm_N3',
//     'UserForm_N5',
//     'UserForm_N6',
//     'UserForm_N7',
//     'UserForm_N8',
//     'FormReminder_N1',
//     'RetakeGO_N1',
//     'RetakeGO_N2',
//     'RetakeGO_N3',
//     'RetakeGO_N4',
//     'IMPORT_COM_N1',
//     'IMPORT_COM_N2',
//     'AutoUpdate_N1',
//     'AutoUpdate_N2',
//     'AutoUpdate_N3',
//     'CONNECT_N2',
//     'CONNECT_N1',
//     'OFFPLATFORM_N1',
//     'OFFPLATFORM_N2',
//     'FormFollow_N1',
//     'send_reminder_school',
//     // 'TASK_BUILDER_NOTIFICATION',
//     'WrgMail_N2A',
//     'WrgMail_N2B',
//     // 'IMPORTSCHEDULE_N1',
//     'IMPORTSCHEDULE_N2',
//     'ESurvey_N7',
//     'EEExpReady_N1',
//     'GOPDF_N1',
//     'IMPORT_TRANSCRIPT_N1',
//     'Remind_N1',
//     'JURY_N8',
//     'SchExpReady_N1',
//     'UserForm_N1_Quality_Form',
//     'QUA_N2',
//     'QUA_N1bis',
//     'StatusUserChange_N1',
//     'NotifGDefault_N1',
//     'NotifGDefault_N2',
//     'NotifGDefault_N3',
//     'NotifGDefault_N4',
//     'NotifGDefault_N5',
//     'NotifGDefault_N6',
//     'NotifGDefault_N7',
//     'PUBLISHDECISION_N1',
//     'DEROGATION_N1',
//     'TASK_CHECKING_N1',
//     'AUTOEVAL_EXC_N1',
//     'AUTOEVAL_AUTOUPDATE_N1',
//     'AUTOEVAL_CONF_N1',
//     'AUTOEVAL_CONF_N2',
//     'JURY_N23',
//     'JURY_N22',
//   ];

//   const taskBuilderNotificationPattern = ['AT-', '_Notif_N', 'NotifG_N','NotifGDefault_N'];
//   const signatoryEmailNotification = [
//     'IMPORT_N1',
//     'IMPORT_N2',
//     'IMPORT_COM_N1',
//     'IMPORT_COM_N2',
//     'ASSIGNCORR_N1',
//     'CORRECTOR_N2',
//     'CORRECTOR_N3',
//     'SubmitMark_N1',
//     'StudExpectedDoc_N2',
//     'GROUP_N1',
//     'GROUP_N2',
//     'GROUP_N3',
//     'DOC_N1',
//     'DOC_N2',
//     'DOC_N3',
//     // 'JOBDESC_N11',
//     'JOBDESC_N12',
//     'PROB_N2',
//     'PROB_N3',
//     'PROB_N11',
//     'VERIFY_N4',
//     'VERIFY_N9',
//     'TRANSCRIPT_N7',
//     'CROSS_N1',
//     'CROSS_N1_PAPERLESS',
//     'CROSS_N2',
//     'CROSS_N4_PAPERLESS',
//     'CROSS_N2_PAPERLESS',
//     'CROSS_N3',
//     'CROSS_N4',
//     'CROSS_N5',
//     'CROSS_N5_PAPERLESS',
//     'CERT_N2',
//   ];

//   let unblockedOldTitleNotifications = [
//     'ForgetPass_N1',
//     'ChgMail_N1',
//     'WrgMail_N1',
//     'RegReminder_N1',
//     'RegUser_N1',

//     'JURY_N1',
//     'JURY_N3',
//     'JURY_N5',
//     'JURY_N6',
//     'JURY_N7',
//     'JURY_N7B',
//     // 'JURY_N9',
//     'JURY_N10',
//     'JURY_N11',
//     'JURY_N15',
//     'JURY_N16',
//     'JURY_N17',
//     'JURY_N18',
//     'JURY_N19',
//     'JURY_N20',
//     'JURY_N21',
//     'RETAKEJURY_N1',
//     'RETAKEJURY_N2',
//     'RETAKEJURY_N3',

//     'TRANSCRIPT_N1',
//     'TRANSCRIPT_N3',
//     'TRANSCRIPT_N3B',
//     'TRANSCRIPT_N4',
//     'TRANSCRIPT_N2',
//     'TRANSCRIPT_N2B',
//     'TRANSCRIPT_N5',
//     'TRANSCRIPT_N6',
//     'TRANSCRIPT_N7',

//     'ESurvey_N1',
//     'ESurvey_N2',
//     'ESurvey_N3A',
//     'ESurvey_N3B',
//     // 'ESurvey_N4',
//     'ESurvey_N5',
//     'ESurvey_N6',
//     'ESNFStudRemind_N1',
//     'ESNFStudRemind_N2',
//     'ESNFADMTCRemind_N1',
//     'ESNFADMTCRemind_N2',
//     // 'ESNFADMTCRemind_N3',

//     // 'GrandDoc_N1A',
//     'GrandDoc_N1B',

//     'CERT_N1',
//     'CERT_N2',
//     'CERT_N4',
//     'CERT_N3',

//     'RetakeGO_N1',
//     'RetakeGO_N2',
//     'RetakeGO_N3',
//     'RetakeGO_N4',

//     'OFFPLATFORM_N1',
//     'OFFPLATFORM_N2',

//     'ESurvey_N7',
//     'JURY_N8',
//     'SchExpReady_N1',
//     'EEExpReady_N1',

//     'StatusUserChange_N1',
//     'TASK_N1',

//     'TASK_CHECKING_N1',
//     'AUTOEVAL_EXC_N1',
//     'AUTOEVAL_AUTOUPDATE_N1',
//     'AUTOEVAL_CONF_N1',
//     'AUTOEVAL_CONF_N2',

//     'JURY_N23',
//     'JURY_N22',
//   ];

//   if (mailOptions.formBuilderTemplate && mailOptions.formBuilderTemplate === 'employability_survey' && mailOptions.notificationReference) {
//     unblockedOldTitleNotifications.push(mailOptions.notificationReference);
//   }

//   function delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }

//   let pattern = /NotifS/;
//   let GdeaultNotif = [
//     'NotifGDefault_N1',
//     'NotifGDefault_N2',
//     'NotifGDefault_N3',
//     'NotifGDefault_N4',
//     'NotifGDefault_N5',
//     'NotifGDefault_N6',
//     'NotifGDefault_N7',
//   ]
//   if (unblockedNotifications.includes(mailOptions.notificationReference) && !GdeaultNotif.includes(mailOptions.notificationReference)) {
//     // send the notification as usual
//   } else if (mailOptions.notificationReference) {
//     let isCanBeSent;
//     taskBuilderNotificationPattern.forEach((patternTaskBuilderNotication) => {
//       if (mailOptions.notificationReference.indexOf(patternTaskBuilderNotication) >= 0) {
//         isCanBeSent = true;
//       } 

//       if (String(mailOptions.notificationReference).match(pattern)) {
//         isCanBeSent = true;
//       }
//     });

//     if (isCanBeSent) {
//       // send the notification as usual
//       if (mailOptions.formProcessId && mailOptions.requiredParams && mailOptions.requiredParams.body) {
//         let newBodyMessage = () => {
//           return new Promise(async (resolve) => {
//             mailOptions.requiredParams.body = await addNotificationReferenceOfDynamicNotification(
//               mailOptions.formProcessId,
//               mailOptions.requiredParams.body,
//               mailOptions.notificationReference,
//               mailOptions.language
//             );
//             resolve(mailOptions.requiredParams.body);
//           });
//         }

//         newBodyMessage()
//         .then(function (result) {
//           mailOptions.requiredParams.body = result;
//         });
//       }
//     } else {
//       return callback();
//     }
//   } else {
//     return callback();
//   }

//   if (unblockedOldTitleNotifications.includes(mailOptions.notificationReference)) {
//     // send the notification as usual
//     let templatePath = mailOptions.htmlFR;
//     let subject = mailOptions.subjectFR;
//     // change language to en if provided, default fr
//     if (mailOptions.language && mailOptions.language.toLowerCase() == 'en') {
//       templatePath = mailOptions.htmlEN;
//       subject = mailOptions.subjectEN;
//     }
//     // getdatauser
//     let userFound = () => {
//       return new Promise((resolve, reject) => {
//         UserModel.findOne({ status: 'active', email: mailOptions.from })
//           .lean()
//           .then(function (result) {
//             if (!result) {
//               UserModel.findOne({ _id: mailOptions.fromId })
//                 .lean()
//                 .then(function (result) {
//                   if (result && !result.is_user_student) {
//                     if (signatoryEmailNotification.includes(mailOptions.notificationReference) && mailOptions.from) {
//                       if (result && result.signatory_email) {
//                         mailOptions.from = result.signatory_email;
//                       } else if (result && result.email) {
//                         mailOptions.from = result.email;
//                       } else {
//                         mailOptions.from = 'notification@admtc.pro';
//                       }
//                     } else {
//                       if (result && result.email) {
//                         mailOptions.from = result.email;
//                       } else {
//                         mailOptions.from = 'notification@admtc.pro';
//                       }
//                     }
//                   } else {
//                     mailOptions.from = 'notification@admtc.pro';
//                   }
//                   resolve(result);
//                 });
//             } else {
//               if (signatoryEmailNotification.includes(mailOptions.notificationReference) && mailOptions.from) {
//                 if (result && result.signatory_email) {
//                   mailOptions.from = result.signatory_email;
//                   resolve(result);
//                 } else {
//                   resolve(result);
//                 }
//               } else {
//                 resolve(result);
//               }
//             }
//           });
//       });
//     };

//     userFound()
//       .then(function (result) {
//         // read notification template html & put the data to there
//         fs.readFile(templatePath, 'utf8', function (err, templateData) {
//           if (err) {
//             logError('Cannot send Email ', err);
//             callback(err);
//           } else {
//             try {
//               let htmlTemplate = parseTemplate(templateData, mailOptions.requiredParams);

//               // add some default css
//               htmlTemplate += `
//           <style>
//             table {
//               border-collapse: collapse;
//             }
          
//             table,
//             th,
//             td {
//               border: 2px solid black;
//               padding: 5px;
//             }
//           </style>
//           `;

//               let recipientProperty = [],
//                 from = emailTemplate.from;

//               // set up email recipient
//               if (_.isArray(mailOptions.to)) {
//                 if (mailOptions.isADMTCInCC) {
//                   recipientProperty = mailOptions.to.concat({
//                     recipients: admtcCCEmail,
//                     rank: 'cc',
//                     mail_type: 'inbox',
//                   });
//                 } else {
//                   recipientProperty = mailOptions.to;
//                 }
//               } else {
//                 recipientProperty.push({
//                   recipients: [mailOptions.to],
//                   rank: 'a',
//                   mail_type: 'inbox',
//                 });
//               }
//               // change sender to aide if it's notification WrgMail_N1
//               if (mailOptions.notificationReference === 'WrgMail_N1') {
//                 from = aideEmail;
//               } else if (mailOptions.from) {
//                 from = result && result.email ? result.email : mailOptions.from;

//                 // if server is stagging sender by platform
//                 // if (process.env.SERVER_ENV === 'staging') {
//                 //   from = platformEmail;
//                 // } else
//                 // {
//                 // if (result && result.is_email_aws_verified === true) {
//                 //   from = result.email;
//                 // } else {
//                 //   from = platformEmail;
//                 // }
//                 // }
//               }

//               let parameters = {
//                 sender_property: {
//                   sender: from,
//                 },
//                 recipient_properties: recipientProperty,
//                 subject: subject,
//                 message: htmlTemplate,
//                 file_attachments: mailOptions.fileAttachments,
//                 user: result,
//               };
//               sendCustomMail(
//                 { parameters: parameters, mailOptions: mailOptions, saveInNotificationHistory: true },
//                 (err, newNotification) => {
//                   if (err) {
//                     return callback(err);
//                   }
//                   return callback(null, newNotification);
//                 }
//               );
//             } catch (error) {
//               console.log(`error send email: ${error.message}`);
//             }
//           }
//         });
//       })
//       .catch(() => {
//         console.log('user from not found');
//       });
//   } else {
//     if (typeof mailOptions.RNCPTitleId === 'object' && isEmpty(mailOptions.RNCPTitleId)) {
//       mailOptions.RNCPTitleId = [];
//     } else if (typeof mailOptions.RNCPTitleId === 'string') {
//       mailOptions.RNCPTitleId = mongoose.Types.ObjectId(mailOptions.RNCPTitleId);
//     }

//     if (mailOptions.classId && Array.isArray(mailOptions.classId) && mailOptions.classId.length > 0) {
//       let status = false;

//       let classData = () => {
//         return new Promise((resolve, reject) => {
//           ClassModel.find({ _id: { $in: mailOptions.classId.map((eachClass) => eachClass) } })
//             .lean()
//             .then(function (result) {
//               if (result) {
//                 resolve(result);
//               }
//             });
//         });
//       };
//       if (classData) {
//         classData().then(function (result) {
//           if (result && result.length) {
//             for (let eachClass of result) {
//               count++;
//               if (
//                 eachClass &&
//                 eachClass.year_of_certification &&
//                 parseInt(eachClass.year_of_certification) < currentYear &&
//                 status === false
//               ) {
//                 return callback();
//               } else if (
//                 eachClass &&
//                 !eachClass.year_of_certification &&
//                 mailOptions.RNCPTitleId &&
//                 Array.isArray(mailOptions.RNCPTitleId) &&
//                 mailOptions.RNCPTitleId.length > 0
//               ) {
//                 let status = false;
//                 let titleData = () => {
//                   return new Promise((resolve, reject) => {
//                     RncpModel.find({ _id: { $in: mailOptions.RNCPTitleId.map((rncp) => rncp) } })
//                       .lean()
//                       .then(function (result) {
//                         if (result) {
//                           resolve(result);
//                         }
//                       });
//                   });
//                 };

//                 if (titleData) {
//                   titleData().then(function (result) {
//                     if (result && result.length) {
//                       for (let eachTitle of result) {
//                         if (eachTitle && !eachTitle.year_of_certification && mailOptions.notificationReference === 'TASK_N4') {
//                           status = true;
//                           break;
//                         } else if (
//                           eachTitle &&
//                           eachTitle.year_of_certification &&
//                           parseInt(eachTitle.year_of_certification) < currentYear &&
//                           status === false
//                         ) {
//                           status = true;
//                           break;
//                         }
//                       }

//                       if (status === true) {
//                         return callback();
//                       }

//                       let templatePath = mailOptions.htmlFR;
//                       let subject = mailOptions.subjectFR;
//                       // change language to en if provided, default fr
//                       if (mailOptions.language && mailOptions.language.toLowerCase() == 'en') {
//                         templatePath = mailOptions.htmlEN;
//                         subject = mailOptions.subjectEN;
//                       }
//                       // getdatauser
//                       let userFound = () => {
//                         return new Promise((resolve, reject) => {
//                           UserModel.findOne({ status: 'active', email: mailOptions.from })
//                             .lean()
//                             .then(function (result) {
//                               if (!result) {
//                                 UserModel.findOne({ _id: mailOptions.fromId })
//                                   .lean()
//                                   .then(function (result) {
//                                     if (result && !result.is_user_student) {
//                                       if (signatoryEmailNotification.includes(mailOptions.notificationReference) && mailOptions.from) {
//                                         if (result && result.signatory_email) {
//                                           mailOptions.from = result.signatory_email;
//                                         } else if (result && result.email) {
//                                           mailOptions.from = result.email;
//                                         } else {
//                                           mailOptions.from = 'notification@admtc.pro';
//                                         }
//                                       } else {
//                                         if (result && result.email) {
//                                           mailOptions.from = result.email;
//                                         } else {
//                                           mailOptions.from = 'notification@admtc.pro';
//                                         }
//                                       }
//                                     } else {
//                                       mailOptions.from = 'notification@admtc.pro';
//                                     }
//                                     resolve(result);
//                                   });
//                               } else {
//                                 if (signatoryEmailNotification.includes(mailOptions.notificationReference) && mailOptions.from) {
//                                   if (result && result.signatory_email) {
//                                     mailOptions.from = result.signatory_email;
//                                     resolve(result);
//                                   } else {
//                                     resolve(result);
//                                   }
//                                 } else {
//                                   resolve(result);
//                                 }
//                               }
//                             });
//                         });
//                       };

//                       userFound()
//                         .then(function (result) {
//                           // read notification template html & put the data to there
//                           fs.readFile(templatePath, 'utf8', function (err, templateData) {
//                             if (err) {
//                               logError('Cannot send Email ', err);
//                               callback(err);
//                             } else {
//                               try {
//                                 let htmlTemplate = parseTemplate(templateData, mailOptions.requiredParams);

//                                 // add some default css
//                                 htmlTemplate += `
//             <style>
//               table {
//                 border-collapse: collapse;
//               }
            
//               table,
//               th,
//               td {
//                 border: 2px solid black;
//                 padding: 5px;
//               }
//             </style>
//             `;

//                                 let recipientProperty = [],
//                                   from = emailTemplate.from;

//                                 // set up email recipient
//                                 if (_.isArray(mailOptions.to)) {
//                                   if (mailOptions.isADMTCInCC) {
//                                     recipientProperty = mailOptions.to.concat({
//                                       recipients: admtcCCEmail,
//                                       rank: 'cc',
//                                       mail_type: 'inbox',
//                                     });
//                                   } else {
//                                     recipientProperty = mailOptions.to;
//                                   }
//                                 } else {
//                                   recipientProperty.push({
//                                     recipients: [mailOptions.to],
//                                     rank: 'a',
//                                     mail_type: 'inbox',
//                                   });
//                                 }
//                                 // change sender to aide if it's notification WrgMail_N1
//                                 if (mailOptions.notificationReference === 'WrgMail_N1') {
//                                   from = aideEmail;
//                                 } else if (mailOptions.from) {
//                                   from = result && result.email ? result.email : mailOptions.from;

//                                   // if server is stagging sender by platform
//                                   // if (process.env.SERVER_ENV === 'staging') {
//                                   //   from = platformEmail;
//                                   // } else
//                                   // {
//                                   // if (result && result.is_email_aws_verified === true) {
//                                   //   from = result.email;
//                                   // } else {
//                                   //   from = platformEmail;
//                                   // }
//                                   // }
//                                 }

//                                 let parameters = {
//                                   sender_property: {
//                                     sender: from,
//                                   },
//                                   recipient_properties: recipientProperty,
//                                   subject: subject,
//                                   message: htmlTemplate,
//                                   file_attachments: mailOptions.fileAttachments,
//                                   user: result,
//                                 };
//                                 sendCustomMail(
//                                   { parameters: parameters, mailOptions: mailOptions, saveInNotificationHistory: true },
//                                   (err, newNotification) => {
//                                     if (err) {
//                                       return callback(err);
//                                     }
//                                     return callback(null, newNotification);
//                                   }
//                                 );
//                               } catch (error) {
//                                 console.log(`error send email: ${error.message}`);
//                               }
//                             }
//                           });
//                         })
//                         .catch(() => {
//                           console.log('user from not found');
//                         });
//                     } else {
//                       return callback();
//                     }
//                   });
//                 }
//               } else if (
//                 eachClass &&
//                 !eachClass.year_of_certification &&
//                 mailOptions.RNCPTitleId &&
//                 !Array.isArray(mailOptions.RNCPTitleId)
//               ) {
//                 let titleData = () => {
//                   return new Promise((resolve, reject) => {
//                     RncpModel.findOne({ _id: mailOptions.RNCPTitleId })
//                       .lean()
//                       .then(function (result) {
//                         if (result) {
//                           resolve(result);
//                         }
//                       });
//                   });
//                 };

//                 if (titleData) {
//                   titleData().then(function (result) {
//                     if (result && !result.year_of_certification && mailOptions.notificationReference === 'TASK_N4') {
//                       return callback();
//                     } else if (result && result.year_of_certification && parseInt(result.year_of_certification) < currentYear) {
//                       return callback();
//                     }

//                     let templatePath = mailOptions.htmlFR;
//                     let subject = mailOptions.subjectFR;
//                     // change language to en if provided, default fr
//                     if (mailOptions.language && mailOptions.language.toLowerCase() == 'en') {
//                       templatePath = mailOptions.htmlEN;
//                       subject = mailOptions.subjectEN;
//                     }
//                     // getdatauser
//                     let userFound = () => {
//                       return new Promise((resolve, reject) => {
//                         UserModel.findOne({ status: 'active', email: mailOptions.from })
//                           .lean()
//                           .then(function (result) {
//                             if (!result) {
//                               UserModel.findOne({ _id: mailOptions.fromId })
//                                 .lean()
//                                 .then(function (result) {
//                                   if (result && !result.is_user_student) {
//                                     if (signatoryEmailNotification.includes(mailOptions.notificationReference) && mailOptions.from) {
//                                       if (result && result.signatory_email) {
//                                         mailOptions.from = result.signatory_email;
//                                       } else if (result && result.email) {
//                                         mailOptions.from = result.email;
//                                       } else {
//                                         mailOptions.from = 'notification@admtc.pro';
//                                       }
//                                     } else {
//                                       if (result && result.email) {
//                                         mailOptions.from = result.email;
//                                       } else {
//                                         mailOptions.from = 'notification@admtc.pro';
//                                       }
//                                     }
//                                   } else {
//                                     mailOptions.from = 'notification@admtc.pro';
//                                   }
//                                   resolve(result);
//                                 });
//                             } else {
//                               if (signatoryEmailNotification.includes(mailOptions.notificationReference) && mailOptions.from) {
//                                 if (result && result.signatory_email) {
//                                   mailOptions.from = result.signatory_email;
//                                   resolve(result);
//                                 } else {
//                                   resolve(result);
//                                 }
//                               } else {
//                                 resolve(result);
//                               }
//                             }
//                           });
//                       });
//                     };

//                     userFound()
//                       .then(function (result) {
//                         // read notification template html & put the data to there
//                         fs.readFile(templatePath, 'utf8', function (err, templateData) {
//                           if (err) {
//                             logError('Cannot send Email ', err);
//                             callback(err);
//                           } else {
//                             try {
//                               let htmlTemplate = parseTemplate(templateData, mailOptions.requiredParams);

//                               // add some default css
//                               htmlTemplate += `
//           <style>
//             table {
//               border-collapse: collapse;
//             }
          
//             table,
//             th,
//             td {
//               border: 2px solid black;
//               padding: 5px;
//             }
//           </style>
//           `;

//                               let recipientProperty = [],
//                                 from = emailTemplate.from;

//                               // set up email recipient
//                               if (_.isArray(mailOptions.to)) {
//                                 if (mailOptions.isADMTCInCC) {
//                                   recipientProperty = mailOptions.to.concat({
//                                     recipients: admtcCCEmail,
//                                     rank: 'cc',
//                                     mail_type: 'inbox',
//                                   });
//                                 } else {
//                                   recipientProperty = mailOptions.to;
//                                 }
//                               } else {
//                                 recipientProperty.push({
//                                   recipients: [mailOptions.to],
//                                   rank: 'a',
//                                   mail_type: 'inbox',
//                                 });
//                               }
//                               // change sender to aide if it's notification WrgMail_N1
//                               if (mailOptions.notificationReference === 'WrgMail_N1') {
//                                 from = aideEmail;
//                               } else if (mailOptions.from) {
//                                 from = result && result.email ? result.email : mailOptions.from;

//                                 // if server is stagging sender by platform
//                                 // if (process.env.SERVER_ENV === 'staging') {
//                                 //   from = platformEmail;
//                                 // } else
//                                 // {
//                                 // if (result && result.is_email_aws_verified === true) {
//                                 //   from = result.email;
//                                 // } else {
//                                 //   from = platformEmail;
//                                 // }
//                                 // }
//                               }

//                               let parameters = {
//                                 sender_property: {
//                                   sender: from,
//                                 },
//                                 recipient_properties: recipientProperty,
//                                 subject: subject,
//                                 message: htmlTemplate,
//                                 file_attachments: mailOptions.fileAttachments,
//                                 user: result,
//                               };
//                               sendCustomMail(
//                                 { parameters: parameters, mailOptions: mailOptions, saveInNotificationHistory: true },
//                                 (err, newNotification) => {
//                                   if (err) {
//                                     return callback(err);
//                                   }
//                                   return callback(null, newNotification);
//                                 }
//                               );
//                             } catch (error) {
//                               console.log(`error send email: ${error.message}`);
//                             }
//                           }
//                         });
//                       })
//                       .catch(() => {
//                         console.log('user from not found');
//                       });
//                   });
//                 }
//               } else {
//                 let templatePath = mailOptions.htmlFR;
//                 let subject = mailOptions.subjectFR;
//                 // change language to en if provided, default fr
//                 if (mailOptions.language && mailOptions.language.toLowerCase() == 'en') {
//                   templatePath = mailOptions.htmlEN;
//                   subject = mailOptions.subjectEN;
//                 }
//                 // getdatauser
//                 let userFound = () => {
//                   return new Promise((resolve, reject) => {
//                     UserModel.findOne({ status: 'active', email: mailOptions.from })
//                       .lean()
//                       .then(function (result) {
//                         if (!result) {
//                           UserModel.findOne({ _id: mailOptions.fromId })
//                             .lean()
//                             .then(function (result) {
//                               if (result && !result.is_user_student) {
//                                 if (signatoryEmailNotification.includes(mailOptions.notificationReference) && mailOptions.from) {
//                                   if (result && result.signatory_email) {
//                                     mailOptions.from = result.signatory_email;
//                                   } else if (result && result.email) {
//                                     mailOptions.from = result.email;
//                                   } else {
//                                     mailOptions.from = 'notification@admtc.pro';
//                                   }
//                                 } else {
//                                   if (result && result.email) {
//                                     mailOptions.from = result.email;
//                                   } else {
//                                     mailOptions.from = 'notification@admtc.pro';
//                                   }
//                                 }
//                               } else {
//                                 mailOptions.from = 'notification@admtc.pro';
//                               }
//                               resolve(result);
//                             });
//                         } else {
//                           if (signatoryEmailNotification.includes(mailOptions.notificationReference) && mailOptions.from) {
//                             if (result && result.signatory_email) {
//                               mailOptions.from = result.signatory_email;
//                               resolve(result);
//                             } else {
//                               resolve(result);
//                             }
//                           } else {
//                             resolve(result);
//                           }
//                         }
//                       });
//                   });
//                 };

//                 userFound()
//                   .then(function (result) {
//                     // read notification template html & put the data to there
//                     fs.readFile(templatePath, 'utf8', function (err, templateData) {
//                       if (err) {
//                         logError('Cannot send Email ', err);
//                         callback(err);
//                       } else {
//                         try {
//                           let htmlTemplate = parseTemplate(templateData, mailOptions.requiredParams);

//                           // add some default css
//                           htmlTemplate += `
//           <style>
//             table {
//               border-collapse: collapse;
//             }
          
//             table,
//             th,
//             td {
//               border: 2px solid black;
//               padding: 5px;
//             }
//           </style>
//           `;

//                           let recipientProperty = [],
//                             from = emailTemplate.from;

//                           // set up email recipient
//                           if (_.isArray(mailOptions.to)) {
//                             if (mailOptions.isADMTCInCC) {
//                               recipientProperty = mailOptions.to.concat({
//                                 recipients: admtcCCEmail,
//                                 rank: 'cc',
//                                 mail_type: 'inbox',
//                               });
//                             } else {
//                               recipientProperty = mailOptions.to;
//                             }
//                           } else {
//                             recipientProperty.push({
//                               recipients: [mailOptions.to],
//                               rank: 'a',
//                               mail_type: 'inbox',
//                             });
//                           }
//                           // change sender to aide if it's notification WrgMail_N1
//                           if (mailOptions.notificationReference === 'WrgMail_N1') {
//                             from = aideEmail;
//                           } else if (mailOptions.from) {
//                             from = result && result.email ? result.email : mailOptions.from;

//                             // if server is stagging sender by platform
//                             // if (process.env.SERVER_ENV === 'staging') {
//                             //   from = platformEmail;
//                             // } else
//                             // {
//                             // if (result && result.is_email_aws_verified === true) {
//                             //   from = result.email;
//                             // } else {
//                             //   from = platformEmail;
//                             // }
//                             // }
//                           }

//                           let parameters = {
//                             sender_property: {
//                               sender: from,
//                             },
//                             recipient_properties: recipientProperty,
//                             subject: subject,
//                             message: htmlTemplate,
//                             file_attachments: mailOptions.fileAttachments,
//                             user: result,
//                           };
//                           sendCustomMail(
//                             { parameters: parameters, mailOptions: mailOptions, saveInNotificationHistory: true },
//                             (err, newNotification) => {
//                               if (err) {
//                                 return callback(err);
//                               }
//                               return callback(null, newNotification);
//                             }
//                           );
//                         } catch (error) {
//                           console.log(`error send email: ${error.message}`);
//                         }
//                       }
//                     });
//                   })
//                   .catch(() => {
//                     console.log('user from not found');
//                   });
//               }
//               if ((count > 0 && mailOptions.notificationReference === 'TASK_N4') || mailOptions.notificationReference === 'StatUpdate_N1') {
//                 break;
//               }
//             }
//           } else {
//             return callback();
//           }
//         });
//       }
//     } else if (mailOptions.RNCPTitleId && Array.isArray(mailOptions.RNCPTitleId) && mailOptions.RNCPTitleId.length > 0) {
//       let status = false;
//       let titleData = () => {
//         return new Promise((resolve, reject) => {
//           RncpModel.find({ _id: { $in: mailOptions.RNCPTitleId.map((rncp) => rncp) } })
//             .lean()
//             .then(function (result) {
//               if (result) {
//                 resolve(result);
//               }
//             });
//         });
//       };

//       if (titleData) {
//         titleData().then(function (result) {
//           if (result && result.length) {
//             for (let eachTitle of result) {
//               if (eachTitle && !eachTitle.year_of_certification && mailOptions.notificationReference === 'TASK_N4') {
//                 status = true;
//                 break;
//               } else if (
//                 eachTitle &&
//                 eachTitle.year_of_certification &&
//                 parseInt(eachTitle.year_of_certification) < currentYear &&
//                 status === false
//               ) {
//                 status = true;
//                 break;
//               }
//             }

//             if (status === true) {
//               return callback();
//             }

//             let templatePath = mailOptions.htmlFR;
//             let subject = mailOptions.subjectFR;
//             // change language to en if provided, default fr
//             if (mailOptions.language && mailOptions.language.toLowerCase() == 'en') {
//               templatePath = mailOptions.htmlEN;
//               subject = mailOptions.subjectEN;
//             }
//             // getdatauser
//             let userFound = () => {
//               return new Promise((resolve, reject) => {
//                 UserModel.findOne({ status: 'active', email: mailOptions.from })
//                   .lean()
//                   .then(function (result) {
//                     if (!result) {
//                       UserModel.findOne({ _id: mailOptions.fromId })
//                         .lean()
//                         .then(function (result) {
//                           if (result && !result.is_user_student) {
//                             if (signatoryEmailNotification.includes(mailOptions.notificationReference) && mailOptions.from) {
//                               if (result && result.signatory_email) {
//                                 mailOptions.from = result.signatory_email;
//                               } else if (result && result.email) {
//                                 mailOptions.from = result.email;
//                               } else {
//                                 mailOptions.from = 'notification@admtc.pro';
//                               }
//                             } else {
//                               if (result && result.email) {
//                                 mailOptions.from = result.email;
//                               } else {
//                                 mailOptions.from = 'notification@admtc.pro';
//                               }
//                             }
//                           } else {
//                             mailOptions.from = 'notification@admtc.pro';
//                           }
//                           resolve(result);
//                         });
//                     } else {
//                       if (signatoryEmailNotification.includes(mailOptions.notificationReference) && mailOptions.from) {
//                         if (result && result.signatory_email) {
//                           mailOptions.from = result.signatory_email;
//                           resolve(result);
//                         } else {
//                           resolve(result);
//                         }
//                       } else {
//                         resolve(result);
//                       }
//                     }
//                   });
//               });
//             };

//             userFound()
//               .then(function (result) {
//                 // read notification template html & put the data to there
//                 fs.readFile(templatePath, 'utf8', function (err, templateData) {
//                   if (err) {
//                     logError('Cannot send Email ', err);
//                     callback(err);
//                   } else {
//                     try {
//                       let htmlTemplate = parseTemplate(templateData, mailOptions.requiredParams);

//                       // add some default css
//                       htmlTemplate += `
//             <style>
//               table {
//                 border-collapse: collapse;
//               }
            
//               table,
//               th,
//               td {
//                 border: 2px solid black;
//                 padding: 5px;
//               }
//             </style>
//             `;

//                       let recipientProperty = [],
//                         from = emailTemplate.from;

//                       // set up email recipient
//                       if (_.isArray(mailOptions.to)) {
//                         if (mailOptions.isADMTCInCC) {
//                           recipientProperty = mailOptions.to.concat({
//                             recipients: admtcCCEmail,
//                             rank: 'cc',
//                             mail_type: 'inbox',
//                           });
//                         } else {
//                           recipientProperty = mailOptions.to;
//                         }
//                       } else {
//                         recipientProperty.push({
//                           recipients: [mailOptions.to],
//                           rank: 'a',
//                           mail_type: 'inbox',
//                         });
//                       }
//                       // change sender to aide if it's notification WrgMail_N1
//                       if (mailOptions.notificationReference === 'WrgMail_N1') {
//                         from = aideEmail;
//                       } else if (mailOptions.from) {
//                         from = result && result.email ? result.email : mailOptions.from;

//                         // if server is stagging sender by platform
//                         // if (process.env.SERVER_ENV === 'staging') {
//                         //   from = platformEmail;
//                         // } else
//                         // {
//                         // if (result && result.is_email_aws_verified === true) {
//                         //   from = result.email;
//                         // } else {
//                         //   from = platformEmail;
//                         // }
//                         // }
//                       }

//                       let parameters = {
//                         sender_property: {
//                           sender: from,
//                         },
//                         recipient_properties: recipientProperty,
//                         subject: subject,
//                         message: htmlTemplate,
//                         file_attachments: mailOptions.fileAttachments,
//                         user: result,
//                       };
//                       sendCustomMail(
//                         { parameters: parameters, mailOptions: mailOptions, saveInNotificationHistory: true },
//                         (err, newNotification) => {
//                           if (err) {
//                             return callback(err);
//                           }
//                           return callback(null, newNotification);
//                         }
//                       );
//                     } catch (error) {
//                       console.log(`error send email: ${error.message}`);
//                     }
//                   }
//                 });
//               })
//               .catch(() => {
//                 console.log('user from not found');
//               });
//           } else {
//             return callback();
//           }
//         });
//       }
//     } else if (mailOptions.RNCPTitleId && !Array.isArray(mailOptions.RNCPTitleId)) {
//       let titleData = () => {
//         return new Promise((resolve, reject) => {
//           RncpModel.findOne({ _id: mailOptions.RNCPTitleId })
//             .lean()
//             .then(function (result) {
//               if (result) {
//                 resolve(result);
//               }
//             });
//         });
//       };

//       if (titleData) {
//         titleData().then(function (result) {
//           if (result && !result.year_of_certification && mailOptions.notificationReference === 'TASK_N4') {
//             return callback();
//           } else if (result && result.year_of_certification && parseInt(result.year_of_certification) < currentYear) {
//             return callback();
//           }

//           let templatePath = mailOptions.htmlFR;
//           let subject = mailOptions.subjectFR;
//           // change language to en if provided, default fr
//           if (mailOptions.language && mailOptions.language.toLowerCase() == 'en') {
//             templatePath = mailOptions.htmlEN;
//             subject = mailOptions.subjectEN;
//           }
//           // getdatauser
//           let userFound = () => {
//             return new Promise((resolve, reject) => {
//               UserModel.findOne({ status: 'active', email: mailOptions.from })
//                 .lean()
//                 .then(function (result) {
//                   if (!result) {
//                     UserModel.findOne({ _id: mailOptions.fromId })
//                       .lean()
//                       .then(function (result) {
//                         if (result && !result.is_user_student) {
//                           if (signatoryEmailNotification.includes(mailOptions.notificationReference) && mailOptions.from) {
//                             if (result && result.signatory_email) {
//                               mailOptions.from = result.signatory_email;
//                             } else if (result && result.email) {
//                               mailOptions.from = result.email;
//                             } else {
//                               mailOptions.from = 'notification@admtc.pro';
//                             }
//                           } else {
//                             if (result && result.email) {
//                               mailOptions.from = result.email;
//                             } else {
//                               mailOptions.from = 'notification@admtc.pro';
//                             }
//                           }
//                         } else {
//                           mailOptions.from = 'notification@admtc.pro';
//                         }
//                         resolve(result);
//                       });
//                   } else {
//                     if (signatoryEmailNotification.includes(mailOptions.notificationReference) && mailOptions.from) {
//                       if (result && result.signatory_email) {
//                         mailOptions.from = result.signatory_email;
//                         resolve(result);
//                       } else {
//                         resolve(result);
//                       }
//                     } else {
//                       resolve(result);
//                     }
//                   }
//                 });
//             });
//           };

//           userFound()
//             .then(function (result) {
//               // read notification template html & put the data to there
//               fs.readFile(templatePath, 'utf8', function (err, templateData) {
//                 if (err) {
//                   logError('Cannot send Email ', err);
//                   callback(err);
//                 } else {
//                   try {
//                     let htmlTemplate = parseTemplate(templateData, mailOptions.requiredParams);

//                     // add some default css
//                     htmlTemplate += `
//           <style>
//             table {
//               border-collapse: collapse;
//             }
          
//             table,
//             th,
//             td {
//               border: 2px solid black;
//               padding: 5px;
//             }
//           </style>
//           `;

//                     let recipientProperty = [],
//                       from = emailTemplate.from;

//                     // set up email recipient
//                     if (_.isArray(mailOptions.to)) {
//                       if (mailOptions.isADMTCInCC) {
//                         recipientProperty = mailOptions.to.concat({
//                           recipients: admtcCCEmail,
//                           rank: 'cc',
//                           mail_type: 'inbox',
//                         });
//                       } else {
//                         recipientProperty = mailOptions.to;
//                       }
//                     } else {
//                       recipientProperty.push({
//                         recipients: [mailOptions.to],
//                         rank: 'a',
//                         mail_type: 'inbox',
//                       });
//                     }
//                     // change sender to aide if it's notification WrgMail_N1
//                     if (mailOptions.notificationReference === 'WrgMail_N1') {
//                       from = aideEmail;
//                     } else if (mailOptions.from) {
//                       from = result && result.email ? result.email : mailOptions.from;

//                       // if server is stagging sender by platform
//                       // if (process.env.SERVER_ENV === 'staging') {
//                       //   from = platformEmail;
//                       // } else
//                       // {
//                       // if (result && result.is_email_aws_verified === true) {
//                       //   from = result.email;
//                       // } else {
//                       //   from = platformEmail;
//                       // }
//                       // }
//                     }

//                     let parameters = {
//                       sender_property: {
//                         sender: from,
//                       },
//                       recipient_properties: recipientProperty,
//                       subject: subject,
//                       message: htmlTemplate,
//                       file_attachments: mailOptions.fileAttachments,
//                       user: result,
//                     };
//                     sendCustomMail(
//                       { parameters: parameters, mailOptions: mailOptions, saveInNotificationHistory: true },
//                       (err, newNotification) => {
//                         if (err) {
//                           return callback(err);
//                         }
//                         return callback(null, newNotification);
//                       }
//                     );
//                   } catch (error) {
//                     console.log(`error send email: ${error.message}`);
//                   }
//                 }
//               });
//             })
//             .catch(() => {
//               console.log('user from not found');
//             });
//         });
//       }
//     } else {
//       let templatePath = mailOptions.htmlFR;
//       let subject = mailOptions.subjectFR;
//       // change language to en if provided, default fr
//       if (mailOptions.language && mailOptions.language.toLowerCase() == 'en') {
//         templatePath = mailOptions.htmlEN;
//         subject = mailOptions.subjectEN;
//       }
//       // getdatauser
//       let userFound = () => {
//         return new Promise((resolve, reject) => {
//           UserModel.findOne({ status: 'active', email: mailOptions.from })
//             .lean()
//             .then(function (result) {
//               if (!result) {
//                 UserModel.findOne({ _id: mailOptions.fromId })
//                   .lean()
//                   .then(function (result) {
//                     if (result && !result.is_user_student) {
//                       if (signatoryEmailNotification.includes(mailOptions.notificationReference) && mailOptions.from) {
//                         if (result && result.signatory_email) {
//                           mailOptions.from = result.signatory_email;
//                         } else if (result && result.email) {
//                           mailOptions.from = result.email;
//                         } else {
//                           mailOptions.from = 'notification@admtc.pro';
//                         }
//                       } else {
//                         if (result && result.email) {
//                           mailOptions.from = result.email;
//                         } else {
//                           mailOptions.from = 'notification@admtc.pro';
//                         }
//                       }
//                     } else {
//                       mailOptions.from = 'notification@admtc.pro';
//                     }
//                     resolve(result);
//                   });
//               } else {
//                 if (signatoryEmailNotification.includes(mailOptions.notificationReference) && mailOptions.from) {
//                   if (result && result.signatory_email) {
//                     mailOptions.from = result.signatory_email;
//                     resolve(result);
//                   } else {
//                     resolve(result);
//                   }
//                 } else {
//                   resolve(result);
//                 }
//               }
//             });
//         });
//       };

//       userFound()
//         .then(function (result) {
//           // read notification template html & put the data to there
//           fs.readFile(templatePath, 'utf8', function (err, templateData) {
//             if (err) {
//               logError('Cannot send Email ', err);
//               callback(err);
//             } else {
//               try {
//                 let htmlTemplate = parseTemplate(templateData, mailOptions.requiredParams);

//                 // add some default css
//                 htmlTemplate += `
//           <style>
//             table {
//               border-collapse: collapse;
//             }
          
//             table,
//             th,
//             td {
//               border: 2px solid black;
//               padding: 5px;
//             }
//           </style>
//           `;

//                 let recipientProperty = [],
//                   from = emailTemplate.from;

//                 // set up email recipient
//                 if (_.isArray(mailOptions.to)) {
//                   if (mailOptions.isADMTCInCC) {
//                     recipientProperty = mailOptions.to.concat({
//                       recipients: admtcCCEmail,
//                       rank: 'cc',
//                       mail_type: 'inbox',
//                     });
//                   } else {
//                     recipientProperty = mailOptions.to;
//                   }
//                 } else {
//                   recipientProperty.push({
//                     recipients: [mailOptions.to],
//                     rank: 'a',
//                     mail_type: 'inbox',
//                   });
//                 }
//                 // change sender to aide if it's notification WrgMail_N1
//                 if (mailOptions.notificationReference === 'WrgMail_N1') {
//                   from = aideEmail;
//                 } else if (mailOptions.from) {
//                   from = result && result.email ? result.email : mailOptions.from;

//                   // if server is stagging sender by platform
//                   if (process.env.SERVER_ENV === 'staging') {
//                     from = platformEmail;
//                   } 
//                   // {
//                   // if (result && result.is_email_aws_verified === true) {
//                   //   from = result.email;
//                   // } else {
//                   //   from = platformEmail;
//                   // }
//                   // }
//                 }

//                 let parameters = {
//                   sender_property: {
//                     sender: from,
//                   },
//                   recipient_properties: recipientProperty,
//                   subject: subject,
//                   message: htmlTemplate,
//                   file_attachments: mailOptions.fileAttachments,
//                   user: result,
//                 };
//                 sendCustomMail(
//                   { parameters: parameters, mailOptions: mailOptions, saveInNotificationHistory: true },
//                   (err, newNotification) => {
//                     if (err) {
//                       return callback(err);
//                     }
//                     return callback(null, newNotification);
//                   }
//                 );
//               } catch (error) {
//                 console.log(`error send email: ${error.message}`);
//               }
//             }
//           });
//         })
//         .catch(() => {
//           console.log('user from not found');
//         });
//     }
//   }
// }

// function sendCustomMail(params, callback = () => {}) {
//   if (params.mailOptions.sendToPlatformMailBox === false) {
//     let newNotification = {
//       sender_property: params.parameters.sender_property,
//       subject: params.parameters.subject,
//       message: params.parameters.message,
//       is_sent: false,
//       recipient_properties: params.parameters.recipient_properties,
//       file_attachments: params.parameters.file_attachments,
//       toSaveInDb: 'false',
//     };

//     sendEmail(newNotification, (err) => {
//       if (err) {
//         logError(err);
//         return callback(err);
//       } else {
//         let mailOptions = params.mailOptions;
//         UserModel.find({
//           $or: [{ email: params.parameters.sender_property.sender }, { signatory_email: params.parameters.sender_property.sender }],
//         }).exec((err, user) => {
//           if (err) {
//             logError(err);
//           }

//           // save the email to notification history
//           if (user.length) {
//             if (mailOptions.notificationReference === 'CHANGE_COMP_CRON' || mailOptions.notificationReference === 'TESTCHECK_N1') {
//               //do not send
//             } else {
//               let history = {
//                 sent_date: {
//                   date_utc: moment.utc(new Date()).format('DD/MM/YYYY'),
//                   time_utc: moment.utc(new Date()).format('HH:mm'),
//                 },
//                 notification_reference: mailOptions.notificationReference,
//                 notification_subject: params.parameters.subject,
//                 rncp_titles: mailOptions.RNCPTitleId,
//                 schools: mailOptions.schoolId,
//                 from: mailOptions.fromId ? mailOptions.fromId : user[0]._id,
//                 to: mailOptions.toId,
//                 subject: mailOptions.subjectId,
//                 test: mailOptions.testId,
//                 notification_message: params.parameters.message,
//                 class_ids: mailOptions.classId,
//               };

//               NotificationHistoryModel.create(history, (err) => {
//                 if (err) {
//                   logError(err);
//                 }
//                 return callback(null, newNotification);
//               });
//             }
//           }
//         });
//       }
//     });
//   } else {
//     sendNotification(params, (err, newNotification) => {
//       if (err) {
//         logError(err);
//         return callback(err);
//       }

//       logMails('******************************* NOTIFICATION *******************************');
//       logMails('To\n', newNotification.recipientProperty);
//       logMails('Subject\n', newNotification.subject);
//       logMails('Mail\n', newNotification.message);

//       if (params.mailOptions.sendToPersonalEmail) {
//         sendEmail(newNotification, (err) => {
//           if (err) {
//             return callback(err);
//           } else {
//             if (params.saveInNotificationHistory) {
//               UserModel.find({
//                 $or: [{ email: params.parameters.sender_property.sender }, { signatory_email: params.parameters.sender_property.sender }],
//               }).exec(function (err, user) {
//                 if (err) {
//                   logError(err);
//                 }
//                 if (user) {
//                   if (
//                     params.mailOptions.notificationReference === 'CHANGE_COMP_CRON' ||
//                     params.mailOptions.notificationReference === 'TESTCHECK_N1'
//                   ) {
//                     //do not send
//                   } else {
//                     let history = {
//                       sent_date: {
//                         date_utc: moment.utc(new Date()).format('DD/MM/YYYY'),
//                         time_utc: moment.utc(new Date()).format('HH:mm'),
//                       },
//                       notification_reference: params.mailOptions.notificationReference,
//                       notification_subject: params.parameters.subject,
//                       rncp_titles: params.mailOptions.RNCPTitleId,
//                       schools: params.mailOptions.schoolId,
//                       from: params.mailOptions.fromId ? params.mailOptions.fromId : user[0]._id,
//                       to: params.mailOptions.toId,
//                       subject: params.mailOptions.subjectId,
//                       test: params.mailOptions.testId,
//                       notification_message: params.parameters.message,
//                       class_ids: params.mailOptions.classId,
//                     };

//                     NotificationHistoryModel.create(history, function (err) {
//                       if (err) {
//                         logError(JSON.stringify(err, null, 2));
//                       }
//                       return callback(null, newNotification);
//                     });
//                   }
//                 }
//               });
//             }
//           }
//         });
//       } else {
//         return callback(null, newNotification);
//       }
//     });
//   }
// }

// function sendEmail(parameters, callback) {
//   if (process.env.SERVER_ENV !== 'production') {
//     // const originalRecipient = _.cloneDeepWith(parameters.recipient_properties);

//     let to = 'Recepients: ';
//     parameters.recipient_properties.forEach((recipientEach) => {
//       if (recipientEach.rank === 'a') {
//         to += 'To: ' + recipientEach.recipients[0];
//       } else if (recipientEach.rank === 'cc') {
//         to += '<br>';
//         to += 'CC: ' + recipientEach.recipients[0];
//       } else if (recipientEach.rank === 'c') {
//         to += '<br>';
//         to += 'BCC: ' + recipientEach.recipients[0];
//       } else {
//         to += '<br>';
//         to += 'Others: ' + recipientEach.recipients[0];
//       }

//       if (recipientEach.rank === 'a') {
//         to += '<br>';
//         recipientEach.recipients[0] = emailToSendAllEmails;
//       } else {
//         recipientEach.recipients[0] = emailToSendAllEmails;
//       }
//     });

//     parameters.recipient_properties = _.uniqBy(parameters.recipient_properties, 'rank');

//     // if (process.env.STAGING_SEND_TO_USER_EMAIL) {
//     //   parameters.recipient_properties = parameters.recipient_properties.concat(originalRecipient);
//     // }

//     parameters.message = to + parameters.message;
//   }
//   if (parameters.sender_property.sender) {
//     // if (process.env.SERVER_ENV === 'staging') {
//     if (!parameters.user || !parameters.user.is_email_aws_verified || parameters.user.is_email_aws_verified === false) {
//       parameters.sender_property.sender = platformEmail;
//     }
//     // }
//   }
//   // email send with function send() for a while with same payload as send function in mail schema model
//   send(parameters, (err, result) => {
//     if (err) {
//       return callback(err);
//     }
//     return callback(null, result);
//   });
//   // mail schema not available for a while
//   // Mail.send(parameters, (err, result) => {
//   //   if (err) {
//   //     return callback(err);
//   //   }
//   //   return callback(null, result);
//   // });
// }

// function send(mail, callback) {
//   let recipients = {
//     a: '',
//     cc: '',
//     c: '',
//   };

//   for (let i = 0; i < mail.recipient_properties.length; i++) {
//     if (recipients[mail.recipient_properties[i].rank] !== '') recipients[mail.recipient_properties[i].rank] += ', ';
//     recipients[mail.recipient_properties[i].rank] += mail.recipient_properties[i].recipients;
//   }

//   const AmazonMailService = require('../../services/email/amazon-mail');

//   let emailOptions = {
//     from: mail.sender_property.sender,
//     subject: mail.subject,
//     to: recipients.a.split(',').map((a) => a.trim()),
//     cc: recipients && recipients.cc ? recipients.cc.split(',').map((cc) => cc.trim()) : undefined,
//     bcc: recipients && recipients.c ? recipients.c.split(',').map((c) => c.trim()) : undefined,
//     html: mail.message,
//     attachments: mail.file_attachments,
//     replyTo: mail.sender_property.sender,
//   };
//   if (!mail.is_sent) {
//     if (emailOptions.to && emailOptions.html) {
//       AmazonMailService.sendMail(emailOptions, (err) => {
//         if (err) {
//           return callback(err);
//         } else {
//           // the email not saved in platform yet
//           if (mail.toSaveInDb !== 'false') {
//             MailModel.updateOne({ _id: mail._id }, { $set: { is_sent: true } }).exec();
//           }
//         }

//         return callback(null, mail);
//       });
//     } else {
//       return callback('emailOptions.to && emailOptions.html returned false.');
//     }
//   } else {
//     return callback('mail.is_sent is not set.');
//   }
// }

// function sendNotification(parameters, callback) {
//   let originalParams = _.cloneDeep(parameters.parameters);
//   let mailOptions = parameters.mailOptions;
//   let params = parameters.parameters;
//   saveAttachments();

//   async function saveAttachments() {
//     params.attachments = [];
//     let fileAttachments = [];
//     let pattern = /NotifS/;
//     if (params.file_attachments && params.file_attachments.length) {
//       const taskBuilderNotificationPattern = ['AT-', '_Notif_N', 'NotifG_N'];

//       let isTaskBuilderNotifCanBeSent;
//       taskBuilderNotificationPattern.forEach((patternTaskBuilderNotication) => {
//         if (mailOptions.notificationReference.indexOf(patternTaskBuilderNotication) >= 0) {
//           isTaskBuilderNotifCanBeSent = true;
//         } 
//       });

//       for (let file of params.file_attachments) {
//         if (
//           (file.filename && mailOptions.notificationReference === 'StatUpdate_N1') ||
//           (file.filename && mailOptions.notificationReference === 'GrandDoc_N1A') ||
//           (file.filename && mailOptions.notificationReference === 'GrandDoc_N1B') ||
//           (file.filename && mailOptions.notificationReference === 'EEExpReady_N1') ||
//           (file.filename && mailOptions.notificationReference === 'SchExpReady_N1') ||
//           (file.filename && mailOptions.notificationReference === 'PUBLISHDECISION_N1') ||
//           (file.filename && isTaskBuilderNotifCanBeSent)
//         ) {
//           params.attachments.push(`${common.globalUrls.apibase}/fileuploads/${file.filename}`);
//           fileAttachments.push({
//             file_name: `${file.filename}`,
//             path: `${common.globalUrls.apibase}/fileuploads/${file.filename}?download=true`,
//           });
//         } else if (file.filename && file.content) {
//           let random = common.create_UUID();
//           let extName = file.filename.substr(file.filename.lastIndexOf('.') + 1);
//           let fileName = file.filename.substr(0, file.filename.lastIndexOf('.'));
//           let fullFileName = `${fileName}-${random}.${extName}`;
//           params.attachments.push(`${common.globalUrls.apibase}/fileuploads/${fullFileName}`);
//           fileAttachments.push({
//             file_name: `${fullFileName}`,
//             path: `${common.globalUrls.apibase}/fileuploads/${fullFileName}`,
//           });

//           let fileToS3 = {
//             originalname: '',
//             buffer: '',
//           };

//           fileToS3.buffer = file.content;
//           fileToS3.originalname = fullFileName;

//           await awsService.uploadToS3(fileToS3);
//         }
//       }
//     }

//     let paramsToCB = _.cloneDeep(params);
//     let recipientPropertiesData = [];
//     if (params.recipient_properties && params.recipient_properties.length) {
//       for (let recipient of params.recipient_properties) {
//         let recipientData = await UserModel.findOne({ $or: [{email: recipient.recipients},{email: recipient.recipients[0]}] }).select('_id').exec();
//         if (recipientData) {
//           recipientPropertiesData.push({
//             recipients: recipientData._id,
//             rank: recipient.rank,
//             mail_type: recipient.mail_type,
//           });
//         }
//       }
//     }

//     let userSender = await UserModel.findOne({
//       $or: [{ email: params.sender_property.sender }, { signatory_email: params.sender_property.sender }],
//     })
//       .select('_id')
//       .lean();
//     let userPlatformEmail = await UserModel.findOne({ email: platformEmail }).select('_id').lean();
//     let senderPropertyData = {
//       sender: userSender && userSender._id ? userSender._id : userPlatformEmail._id,
//       is_read: params.sender_property.is_read,
//       mail_type: params.sender_property.mail_type,
//     };

//     const notifSent = await MailModel.create({
//       ...params,
//       sender_property: senderPropertyData,
//       recipient_properties: recipientPropertiesData,
//       file_attachments: fileAttachments,
//     });

//     //save to notif history if notif ref is TUTORIAL_N1
//     if(mailOptions.notificationReference === 'TUTORIAL_N1' && parameters.saveInNotificationHistory) {
//       let history = {
//         sent_date: {
//           date_utc: moment.utc(new Date()).format('DD/MM/YYYY'),
//           time_utc: moment.utc(new Date()).format('HH:mm'),
//         },
//         notification_reference: mailOptions.notificationReference,
//         notification_subject: params.subject,
//         rncp_titles: mailOptions.RNCPTitleId,
//         schools: mailOptions.schoolId,
//         from: mailOptions.fromId,
//         to: mailOptions.toId,
//         subject: mailOptions.subjectId,
//         test: mailOptions.testId,
//         notification_message: params.message,
//         class_ids: mailOptions.classId,
//       };
//       NotificationHistoryModel.create(history)
//     }

//     return callback(null, { ...paramsToCB, _id: notifSent._id });
//   }
// }

// function parseTemplate(template, dataObj) {
//   /* parses HTML email body.
//    * can be reused application wide by emailUtil.parseTemplate.
//    * functionality can be understood by seeing usage in sendMail function.
//    */
//   return template.replace(/\$\{.+?}/g, (match) => {
//     let path = match.substr(2, match.length - 3).trim();
//     return _.get(dataObj, path, '');
//   });
// }

// function computeSalutation(gender, language) {
//   /*  computes salutation based on language and gender.
//    *  Params: gender -> accecpted value(string): ['m', 'male', 'f', 'female'] (case insensitive)
//    *          language -> accepted value(string): ['en', 'fr'] (case insensitive)
//    *  Returns string based on following logic
//    *      if language is english: "Dear"
//    *      if language is french:   if gender is male:  "Cher"
//    *                               if gender is female:"Chère"
//    *                               if gender is not specified: "Cher"
//    */
//   if (!language) {
//     language = common.defaultLanguage;
//   }
//   let salutation = '';
//   if (language.toLowerCase() == 'en') {
//     salutation = 'Dear';
//   } else if (language.toLowerCase() == 'fr') {
//     if (gender) {
//       if (gender.toLowerCase().startsWith('m')) {
//         salutation = 'Cher';
//       } else if (gender.toLowerCase().startsWith('f')) {
//         salutation = 'Chère';
//       }
//     } else {
//       salutation = 'Cher';
//     }
//   }
//   return salutation;
// }

// function computeCivility(gender, language) {
//   /*  computes civility based on language and gender.
//    *  Params: gender -> accecpted value(string): ['m', 'male', 'f', 'female'] (case insensitive)
//    *          language -> accepted value(string): ['en', 'fr'] (case insensitive)
//    *  Returns string based on following logic
//    *      if language is english:  if gender is male:  "Mr"
//    *                               if gender is female:"Mrs"
//    *                               if gender is not specified: "Mr"
//    *      if language is french:   if gender is male:  "M."
//    *                               if gender is female:"Mme"
//    *                               if gender is not specified: "M."
//    */
//   let civility = '';
//   if (!language) {
//     language = common.defaultLanguage;
//   }
//   if (language.toLowerCase() == 'en') {
//     if (gender) {
//       if (gender.toLowerCase().startsWith('m')) {
//         civility = 'Mr';
//       } else if (gender.toLowerCase().startsWith('f')) {
//         civility = 'Mrs';
//       }
//     } else {
//       civility = 'Mr';
//     }
//   } else if (language.toLowerCase() == 'fr') {
//     if (gender) {
//       if (gender.toLowerCase().startsWith('m')) {
//         civility = 'M.';
//       } else if (gender.toLowerCase().startsWith('f')) {
//         civility = 'Mme';
//       }
//     } else {
//       civility = 'M.';
//     }
//   }
//   return civility;
// }

// function computeAffectedBy(gender) {
//   let affectedBy = '';
//   if (!gender) {
//     gender = 'm';
//   }

//   if (gender.toLowerCase().startsWith('m')) {
//     affectedBy = 'affecté';
//   } else {
//     affectedBy = 'affectée';
//   }
//   return affectedBy;
// }

// const weekday = {
//   en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
//   fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
// };

// const month = {
//   en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
//   fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
// };

// function computeLongDate(date, lang) {
//   date = new DateOnly(date);
//   if (!lang || (lang.toLowerCase().trim() != 'en' && lang.toLowerCase().trim() != 'fr')) {
//     lang = common.defaultLanguage;
//   }

//   // if (date.getTimezoneOffset() > 0) {
//   //   date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
//   // } else if (date.getTimezoneOffset() < 0) {
//   //   date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
//   // }

//   return (
//     weekday[lang.toLowerCase()][date.getDay()] +
//     ' ' +
//     date.getDate() +
//     ' ' +
//     month[lang.toLowerCase()][date.getMonth()] +
//     ' ' +
//     date.getFullYear()
//   );
// }

// const weekdayShort = {
//   en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
//   fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
// };

// const monthShort = {
//   en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//   fr: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jui', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
// };

// function computeShortdate(date, lang) {
//   date = new DateOnly(date);
//   if (!lang || (lang.toLowerCase().trim() != 'en' && lang.toLowerCase().trim() != 'fr')) {
//     lang = common.defaultLanguage;
//   }
//   date = new Date(moment(date).tz(timeZone).utc().format());
//   return (
//     weekdayShort[lang.toLowerCase()][date.getUTCDay()] +
//     ' ' +
//     date.getUTCDate() +
//     ' ' +
//     monthShort[lang.toLowerCase()][date.getUTCMonth()] +
//     ' ' +
//     date.getFullYear()
//   );
// }

// function computeXtraShortDate(date) {
//   date = new DateOnly(date);
//   date = new Date(moment(date).tz(timeZone).utc().format());
//   return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
// }

// function capitalizeFirstLetter(string) {
//   return string.charAt(0).toUpperCase() + string.slice(1);
// }

// function computeShortDateWithFullMonthName(date, lang) {
//   const moment = require('moment-timezone');
//   date = new DateOnly(date);
//   date = new Date(moment(date).tz('Europe/Paris').utc().format());
//   return date.getDate() + ' ' + month[lang.toLowerCase()][date.getMonth()] + ' ' + date.getFullYear();
// }

// function computeShortDateWithFullMonthNameMoment(date, lang) {
//   moment.locale('fr');
//   date = moment(date, 'DD/MM/YYYY');
//   let day = date.format('DD');
//   let monthYear = date.format('MMMM YYYY');
//   monthYear = capitalizeFirstLetter(monthYear);

//   return `${day} ${monthYear}`;
// }

// let tasksDescriptionFR = {
//   'assign corrector': 'Affecter un Correcteur',
//   'create groups': 'Créer les groupes',
//   'marks entry': 'Compléter la grille',
//   'validate the test correction': 'Valider la correction',
//   'validate problematics': 'Valider les notes de problématique',
//   // prettier-ignore
//   'send_the_evaluation': 'envoyer l\'évaluation au tuteur d\'enreprise',
//   // prettier-ignore
//   'send the evaluation to company\'s mentor': 'envoyer l\'évaluation au tuteur d\'enreprise',
//   // prettier-ignore
//   'validation': 'Validation de l\'Evaluation Tuteur d\'Entreprise',
//   'create cross corrector': 'Créer un Correcteur Croisé',
//   'assign cross corrector': 'Affecter un Correcteur Croisé',
//   // prettier-ignore
//   'submit students for re-take test': 'Soumettre les étudiants pour repasser l\'épreuve',
//   // prettier-ignore
//   'mark entry for retake exam': 'Saisir les notes pour l\'examen repassé',
//   // prettier-ignore
//   'validation of mentor evaluation': 'Validation de l\'Evaluation Tuteur d\'Entreprise',
//   'send copies': 'Envoyer des copies',
//   'enter jury decision for student in': 'Entrez la décision du jury pour les apprenants de',
//   // prettier-ignore
//   'enter student decision for final retake test': 'Entrez la décision de l\'apprenant pour l\'examen de rattrapage final',
//   // prettier-ignore
//   'please complete the employability survey before': 'compléter l\'enquête d\'employabilité',
//   // prettier-ignore
//   'assign corrector task for final retake test': 'Assigner un correcteur pour l\'examen de rattrapage final',
//   // prettier-ignore
//   'mark entry for final retake test': 'Saisir la note pour l\'examen de rattrapage final',
//   // prettier-ignore
//   'validate final retake test correction': 'Valider la correction de l\'examen de rattrapage final',
//   'certificate details revision': 'Révision des détails du certificat',
//   'sujets et copies épreuves majeures': 'Sujets et copies épreuves majeures',
//   'certificate details to confirm': 'Détails du Certificat à confirmer',
//   'student upload grand oral cv': 'Déposer CV - Grand Oral',
//   'student upload grand oral presentation': 'Déposer Présentation - Grand Oral',
//   'validate test': 'Valider la correction',
//   'student_admission.validate student admission process': "Valider le formulaire d'inscription",
//   'student_admission.revision student admission process': "Demande de revision du formulaire d'inscription",
//   'student_admission.student complete admission process': "Completer le formulaire d'inscription",
//   'quality_file.validate student admission process': 'Dossier qualité à valider définitivement',
//   'quality_file.revision student admission process': 'Dossier qualité à réviser',
//   'quality_file.student complete admission process': 'Dossier qualité à compléter',
//   'employability_survey.validate student admission process': 'Valider l\'enquête d\'employabilité',
//   'employability_survey.revision student admission process': 'Révision de l\'enquête d\'employabilité',
//   'employability_survey.student complete admission process': 'Enquête d\'Employabilité à remplir',
//   'Input the company/mentor and activate the contract': "Entrez l'entreprise d'accueil et le tuteur puis activez le contrat",
// };

// function computeTaskDescription(text, lang) {
//   if (!text || !_.isString(text)) {
//     return text;
//   }
//   let translatedText = text.toLowerCase().trim();
//   if (!lang || !_.isString(lang)) {
//     lang = common.defaultLanguage;
//   }
//   if (lang.toLowerCase().trim() == 'en') {
//     return text;
//   }
//   return tasksDescriptionFR[translatedText] ? tasksDescriptionFR[translatedText] : text;
// }

// //send email 1 alter only one time
// function trigger_validate_email1(recipientProperty, lang = 'fr', callback = () => {}) {
//   let todayDate = new DateOnly();
//   todayDate = common.formatDateFromDateOnly(todayDate);
//   recipientProperty = common.ensureArray(recipientProperty);
//   async.eachSeries(
//     recipientProperty,
//     (recipient, recipientCallback) => {
//       UserModel.findOne({ status: 'active', email: recipient.recipient })
//         .populate([
//           {
//             path: 'created_by',
//             select: 'first_name last_name sex email',
//           },
//         ])
//         .exec((err, user) => {
//           NotificationHistoryModel.find({ notification_reference: 'EMAIL_1', to: user._id, sent_date: todayDate }, (err, result) => {
//             if (err) {
//               logError(err);
//               recipientCallback();
//             }
//             if (result.length == 0) {
//               var params = { user: user, lang: lang };
//               trigger_EMAIL1(params, recipientCallback);
//             } else {
//               recipientCallback();
//             }
//           });
//         });
//     },
//     () => {
//       return callback();
//     }
//   );
// }

// async function trigger_EMAIL1(params, callback = () => {}) {
//   //params lang, userid
//   var lang = params.lang;
//   var user = params.user;
//   let newAuthURL;
//   var URL = common.globalUrls.host + '/mailbox';
//   var mailOptions = Object.assign({}, emailTemplate.EMAIL_1);
//   mailOptions.language = lang;
//   mailOptions.to = user.email;

//   if (!user.is_registered) {
//     let generatedToken = await genTokenForAuthURL(user);

//     newAuthURL = `${common.globalUrls.host}/mailbox${generatedToken}`;
//   } else {
//     newAuthURL = URL;
//   }

//   mailOptions.requiredParams = {
//     URL: newAuthURL,
//     userCivility: computeCivility(user.sex, lang),
//     userFirstName: user.first_name,
//     userLastName: user.last_name,
//     userCreatedCivility: computeCivility(user.created_by.sex, lang),
//     userCreatedFirstName: user.created_by.first_name,
//     userCreatedLastName: user.created_by.last_name,
//     userCreatedEmail: user.created_by.email,
//   };
//   mailOptions.toId = user._id;
//   mailOptions.fromId = user.created_by._id;
//   mailOptions.trigger_EMAIL1 = true;
//   mailOptions.sendToPlatformMailBox = false;
//   mailOptions.notificationReference = 'EMAIL_N1';

//   // sendMail(mailOptions, function (err) {
//   //   if (err) {
//   //     logError(err);
//   //   }
//   //   return callback();
//   // });
//   return callback();
// }

// function trigger_validate_manual_email(recipientProperty, parameters, lang = 'fr', callback = () => {}) {
//   let todayDate = new DateOnly();
//   todayDate = common.formatDateFromDateOnly(todayDate);
//   recipientProperty = common.ensureArray(recipientProperty);
//   async.eachSeries(
//     recipientProperty,
//     (recipient, recipientCallback) => {
//       UserModel.findOne({ status: 'active', email: recipient.recipients })
//         .populate([
//           {
//             path: 'created_by',
//             select: 'first_name last_name sex email',
//           },
//         ])
//         .exec((err, user) => {
//           NotificationHistoryModel.find({ notification_reference: 'MANUAL_EMAIL', to: user._id, sent_date: todayDate }, (err, result) => {
//             if (err) {
//               logError(err);
//               recipientCallback();
//             }
//             if (result.length == 0) {
//               var params = { user: user, lang: lang, ...parameters };
//               trigger_MANUAL_EMAIL(params, recipientCallback);
//             } else {
//               recipientCallback();
//             }
//           });
//         });
//     },
//     () => {
//       return callback();
//     }
//   );
// }

// async function trigger_MANUAL_EMAIL(params, callback = () => {}) {
//   //params lang, userid
//   let lang = params.lang;
//   let user = params.user;
//   let mailOptions = Object.assign({}, emailTemplate.MANUAL_EMAIL);
//   mailOptions.language = lang;
//   mailOptions.to = user.email;
//   mailOptions.subjectEN = params.subject;
//   mailOptions.subjectFR = params.subject;
//   let sender = await UserModel.findById(params.sender).lean();

//   mailOptions.requiredParams = {
//     emailBody: params.message,
//   };
//   if (params.file_attachments && _.isArray(params.file_attachments)) {
//     mailOptions.fileAttachments = params.file_attachments.map((attach) => {
//       return {
//         filename: attach.file_name,
//         path: attach.path,
//       };
//     });
//   }

//   mailOptions.toId = user._id;
//   mailOptions.fromId = sender._id;
//   mailOptions.from = sender.email;
//   mailOptions.trigger_MANUAL_EMAIL = true;
//   mailOptions.sendToPlatformMailBox = false;
//   mailOptions.notificationReference = 'MANUAL_EMAIL';

//   sendMail(mailOptions, function (err) {
//     if (err) {
//       logError(err);
//     }
//     return callback();
//   });
// }

// async function trigger_MANUAL_EMAIL_without_group(recipientProperty, params, lang = 'fr', callback = () => {}) {
//   //params lang, userid
//   var mailOptions = Object.assign({}, emailTemplate.MANUAL_EMAIL);
//   mailOptions.language = lang;
//   mailOptions.to = recipientProperty;
//   mailOptions.subjectEN = params.subject;
//   mailOptions.subjectFR = params.subject;
//   let sender = await UserModel.findById(params.sender).lean();

//   mailOptions.requiredParams = {
//     emailBody: params.message,
//   };
//   if (params.file_attachments && _.isArray(params.file_attachments)) {
//     mailOptions.fileAttachments = params.file_attachments.map((attach) => {
//       return {
//         filename: attach.file_name,
//         path: attach.path,
//       };
//     });
//   }

//   mailOptions.fromId = sender._id;
//   mailOptions.from = sender.email;
//   mailOptions.trigger_MANUAL_EMAIL = true;
//   mailOptions.sendToPlatformMailBox = false;
//   mailOptions.notificationReference = 'MANUAL_EMAIL';
//   sendMail(mailOptions, function (err) {
//     if (err) {
//       logError(err);
//     }
//     return callback();
//   });
// }

// /**
//  * To generate set password token for user
//  *
//  * @param {Object} userDetails Data of the user
//  * @param {String} userDetails._id ID of the user
//  * @param {String} userDetails.email Email of the user
//  *
//  * @returns {Promise<string>} Token to set password
//  */
// async function genTokenForAuthURL(userDetails) {
//   return new Promise(async (resolve) => {
//     // generate authtoken.
//     let dataTokenSetPassword = {
//       email: userDetails.email,
//       user: 'token',
//       time: new Date().getTime(),
//     };

//     let tokenSetPassword = common.getToken(dataTokenSetPassword);

//     await UserModel.findByIdAndUpdate(userDetails._id, {
//       $push: { auth_token: tokenSetPassword },
//     });

//     resolve(`?setPasswordToken=${tokenSetPassword}&userId=${userDetails._id}`);
//   });
// }

// async function addNotificationReferenceOfDynamicNotification(form_process_id, body_message, notification_reference, lang = 'fr') {
//     const form_process = await FormProcessModel.findById(form_process_id)
//       .select('student_id user_id class_id school_id rncp_title_id form_builder_id')
//       .populate([
//         { path: 'student_id' , select: 'last_name first_name'},
//         { path: 'user_id' ,select: 'last_name first_name'},
//         { path: 'class_id' , select: 'name'},
//         { path: 'school_id' , select: 'short_name'},
//         { path: 'rncp_title_id' , select: 'short_name'},
//         { path: 'form_builder_id' , select: 'form_builder_name'},
//       ])
//       .lean();
//     let user_data = form_process.student_id && form_process.student_id._id ? form_process.student_id : form_process.user_id;

//     body_message = `${body_message}<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><p>${notification_reference} ${form_process.form_builder_id.form_builder_name}<br>`;
//     if (user_data) {
//       body_message += `<br>${user_data.last_name.toUpperCase()} ${user_data.first_name} ${
//         user_data.sex ? computeCivility(user_data.sex, lang) : ''
//       }`;
//     }
//     if (form_process && form_process.school_id && form_process.school_id._id) {
//       body_message += ` - ${form_process.school_id.short_name}`;
//     }
//     if (form_process && form_process.rncp_title_id && form_process.rncp_title_id._id) {
//       body_message += ` - ${form_process.rncp_title_id.short_name}`;
//     }
//     if (form_process && form_process.class_id && form_process.class_id._id) {
//       body_message += ` - ${form_process.class_id.name}`;
//     }
//     body_message += '</p>';

//     return body_message;
  
// }

// module.exports = {
//   platformEmail,
//   aideEmail,
//   admtcCCEmail,
//   sendMail,
//   sendNotification,
//   sendEmail,
//   computeSalutation,
//   computeCivility,
//   computeAffectedBy,
//   computeLongDate,
//   computeShortdate,
//   computeXtraShortDate,
//   computeShortDateWithFullMonthName,
//   computeTaskDescription,
//   trigger_validate_email1,
//   trigger_EMAIL1,
//   trigger_validate_manual_email,
//   trigger_MANUAL_EMAIL,
//   trigger_MANUAL_EMAIL_without_group,
//   genTokenForAuthURL,
//   computeShortDateWithFullMonthNameMoment,
//   addNotificationReferenceOfDynamicNotification,
// };

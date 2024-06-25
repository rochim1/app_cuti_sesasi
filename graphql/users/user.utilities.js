const jwt = require('jsonwebtoken')
const fs = require('fs');
const path = require('path');
const {compareSync, hash} = require("bcrypt");
const moment = require('moment')
const { GraphQLError } = require('graphql');
const userModel = require('./user.model'); 
const handlebars = require('handlebars');
const nodemailer = require("nodemailer");

function generateToken(user, expires) {
    expires = expires || '1h'
    let token = jwt.sign(
        {
            _id: user._id,
            email: user.email,
        },
        process.env.TOKEN_SECRET,
        {
            expiresIn: expires
        }
    );

    return token;
}

const GenerateCode = (code_length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    let randomString = '';
    for (let i = 0; i < code_length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
}

const remember_me = (length)=> {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const comparePassword = (plaintextPassword, hash) => {
    const result = compareSync(plaintextPassword, hash);
    return result;
}

const saveImage = async (filename, needUploadToFile = false) => {
    try { 
        let resultImage = {}
        // readfile after uploaded. the image should exist first
        const fileToBase64 = fs.readFileSync(filename, { encoding: 'base64' });

        const ext = path.extname(filename).replace('.', '');
        let base64File;

        if (ext === 'pdf') {
            base64File = ext ? `data:application/${ext};base64,${fileToBase64}` : '';
        } else {
            base64File = ext ? `data:image/${ext};base64,${fileToBase64}` : '';
        }
        
        resultImage.extension = ext;
        resultImage.base64File = base64File;
        // resultImage.changeToBuffer = file;
        return resultImage
    } catch(error) {
        console.log(error)
        console.log('tidak dapat convert image ke base64')
        throw new GraphQLError(`Ada kesalahan sistem, ${error}`, {
            extensions: { code: 'BAD_REQUEST', http: { status: 400 } },
        })
    }
};

const deleteImages = async (filename) => {
    try{
        fs.unlinkSync(filename)
        return true
    }catch(e) {
        return false
    }
};

const ReadStreamCSV = (createReadStream) => {
    if (!createReadStream) return null
    return new Promise((resolve, reject) => {
        const headers = [
        "Timestamp",
        "email",
        "name",
        "email_input",
        "no_identitas",
        "identity_type",
        "gender (f/m)",
        "divisi_name",
        "address",
        "domisili",
        "pos_code",
        "date_of_birth",
        "date_join",
        ];
        let listOfData = [];

        const stream = createReadStream;

        stream.on("data", async function (filestream) {
            let arrayData = filestream.toString().split("\n");
            if (arrayData && arrayData.length) {
                arrayData = arrayData.slice(1);
            }

            for (let i = 0; i < arrayData.length; i++) {
                let objectValue = {};
                const comma_split = arrayData[i].split(";");
              
                headers.forEach((key, index) => {
                    objectValue[key] = comma_split[index];
                });
              
                delete objectValue.Timestamp

                listOfData.push(objectValue)
            }

            resolve(listOfData)
        });

        stream.on("error", (err) => {
            reject(false);
        });
    });
};

const maskingEmail = (email) => {
    const atIndex = email.indexOf('@');
    const charsToMask = Math.floor(atIndex / 2); // Calculate 50% of characters to mask
    const maskedPart = '*'.repeat(charsToMask);
    let visiblePart = charsToMask ? email.slice(0, charsToMask) : '*' 
    visiblePart = visiblePart + maskedPart + email.slice(atIndex);
  
    return visiblePart;
};

/**
 * validasi untuk request change password hanya dapat dilakukan 3x selama 3 jam sekali supaya tidak ada spam
 *
 * @param {*} dateStrings
 * @return {*} 
 */
const validasiChangePassword = async (user) => {
    let isAllow = true
    const dateStrings = user.date_request_change_pw ? user.date_request_change_pw : []
    
    const currentDate = moment();

    // Define a time range for the last 3 hours
    const timeRange = moment.duration(3, 'hours');

    // Filter dates within the last 3 hours
    const filteredDates = dateStrings.filter(dateStr =>
        moment(currentDate).diff(moment(dateStr), 'hours') < 3
    );

    const jumlahRequest = filteredDates.length;

    if (user.allow_change_pw_after) {
        const validasiTanggal = moment(user.allow_change_pw_after).isAfter(currentDate);

        if (validasiTanggal) {
            isAllow = false
            return isAllow
        }
    }

    if (jumlahRequest > 3) {
        const batasUpdate = moment().add(3, "hours").format();
        await userModel.updateOne(
            { _id: user._id },
            {
                $set: {
                    allow_change_pw_after: batasUpdate,
                },
            }
        );

        isAllow = false
    }


    return isAllow
};

const sendNotifSucessUpdatePw = async (user, aktor) => {
    if (!user && !aktor) { return false }
    const templatePath = "./utils/email/templates/NOTIF_CHG_PW.html";
    const templateContent = fs.readFileSync(templatePath, "utf8");
    const template = handlebars.compile(templateContent);

    let requireParams = {
      name: user.name,
      akun: user.username,
      aktor: aktor.username,
      is_admin: aktor.is_admin,
      telpon: "082154441119",
      loginPage: "https://presensi.zensemitraraya.com/login",
    };
      
    mailOptions = {
      from: '"Zera Presensi - Berhasil Ubah Password"',
      to: user.email,
      subject: "Anda berhasil mengubah password akun zera presensi",
      html: template(requireParams),
    };

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.PASSWORD_SENDER,
      },
    });

    try {
      let sendmail = transporter.sendMail(mailOptions, (error, result) => {
        if (error) {
          console.log("err:", error);
          return false;
        }
        return true;
      });
      console.log('email terkirim');
    } catch (error) {
      console.log(error);
    }
}

module.exports = {GenerateCode, generateToken, remember_me, comparePassword, saveImage, deleteImages, ReadStreamCSV, maskingEmail, validasiChangePassword, sendNotifSucessUpdatePw}

const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const util = require('util');
const emailConfig = require('../config/email');
const googleApi = require('../config/googleapis');
const {google} = require('googleapis');


const oAuth2Client = new google.auth.OAuth2 (googleApi.CLIENT_ID,googleApi.CLIENT_SECRET,googleApi.REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: googleApi.REFRESH_TOKEN})


        const accesToken =  oAuth2Client.getAccessToken()

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                type: 'oauth2',
                user: 'roque.licobarrios@gmail.com',
                clientId: googleApi.CLIENT_ID,
                clientSecret: googleApi.CLIENT_SECRET,
                refreshToken: googleApi.REFRESH_TOKEN,
                accessToken: accesToken
            }
        })


// let transport = nodemailer.createTransport({
//     host: emailConfig.host,
//     port: emailConfig.port,
//     auth: {
//       user: emailConfig.user, 
//       pass: emailConfig.pass
//     }
// });

// generar HTML
const generarHTML = (archivo, opciones = {}) => {
    const html = pug.renderFile(`${__dirname}/../views/emails/${archivo}.pug`, opciones);
    return juice(html);
}
exports.enviar = async (opciones) => {
    const html = generarHTML(opciones.archivo, opciones );
    const text = htmlToText.fromString(html);
    let opcionesEmail = {
        from: '<UpTask <no-reply@uptask.com>',
        to: opciones.usuario.email, 
        subject: opciones.subject,
        text, 
        html
    };

    const enviarEmail = util.promisify(transport.sendMail, transport);
    return enviarEmail.call(transport, opcionesEmail)
}



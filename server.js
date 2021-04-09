const express = require('express');
const exphbs = require('express-handlebars');
const handlebars = require('handlebars');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const pdf = require('html-pdf');

/* MAIL CONFIG */

const transport = nodemailer.createTransport(smtpTransport({
    host: 'web-html.com',
    port: 587,
    auth: {
        user: 'mdc@web-html.com',
        pass: 'hjdyws6;9hl@'
    },
    tls: {
        rejectUnauthorized: false
    }
}));

/* ROUTES */

app.post('/send-mail-pdf', (req, res) => {
    res.set('Content-type', 'application/pdf');
    res.status(200).render('pdf-bill', req.body, (err, html) => {
        pdf.create(html).toBuffer((err, buffer) => {
            const date = new Date();
            let mailOptions = {
                from: 'mdc@web-html.com',
                to: req.body.email,
                subject: 'Small CRM Bill',
                text: 'Hi, here is your bill invoice. Please check it',
                attachments: [{
                    filename: `bill_${date.getTime()}.pdf`,
                    content: buffer,
                    contentType: 'application/pdf'
                }]
            };
            transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.status(500).send(error.message);
                } else {
                    res.status(200).send('Email was sent successfully');
                }
            });
        });
    });
});

app.post('/bill-pdf', (req, res) => {
    // res.status(200).render('pdf-bill', req.body);
    res.set('Content-type', 'application/pdf');
    res.status(200).render('pdf-bill', req.body, (err, html) => {
        pdf.create(html).toStream((err, stream) => {
            stream.pipe(res);
        });
    });
});

/* HELPER FOR ARRAY TABLES */

handlebars.registerHelper('inc', (value, opts) => {
    return parseInt(value) + 1;
});

handlebars.registerHelper('multiply', (valueOne, valueTwo) => {
    return parseInt(valueOne) * parseInt(valueTwo)
})

app.listen(process.env.port || 3000, () => {
    console.log('Server running on port 3000');
});
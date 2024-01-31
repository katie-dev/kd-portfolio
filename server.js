const dotenv = require('dotenv');
dotenv.config({ path: './config/.env' }); 

const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const rateLimit = require('express-rate-limit');
const app = express();
const port = 3000;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/contact', limiter);
app.use(express.static('public'));



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const validator = require('validator');

function isValidEmail(email) {
  return validator.isEmail(email);
}

app.post('/contact', (req, res) => {
  const { firstname, lastname, email, message } = req.body;

  // Validation
  if (!isValidEmail(email)) {
    res.status(400).send('Invalid email address');
    return;
  }

  // Process the form data
  console.log(`New form submission: First Name - ${firstname}, Last Name - ${lastname}, Email - ${email}, Message - ${message}`);

  // Send an email using SendGrid
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: process.env.EMAIL_USERNAME,
    subject: 'New Form Submission',
    text: `First Name: ${firstname}\nLast Name: ${lastname}\nEmail: ${email}\nMessage: ${message}`,
  };

  sgMail.send(mailOptions)
    .then(() => {
      console.log('Email sent successfully');
    })
    .catch((error) => {
      console.error('Error sending email:', error);
    });

  // Send a response to the client
  res.send('Form submission successful!');
});
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY);


  
  
  

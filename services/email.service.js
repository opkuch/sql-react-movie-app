var nodemailer = require('nodemailer')

function sendEmailAfterPayment(clientData) {
  const { code, email } = clientData

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASS || "",
    },
  })

  var mailOptions = {
    from: 'actimel39393@gmail.com',
    to: 'nadi2022@gmail.com',
    subject: 'קוד לאתר קולנוע שבלולים',
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Document</title>
        </head>
        <body
          style="
            box-sizing: border-box;
            font-family: 'Miriam Libre', sans-serif;
            color: white;
            text-align: center;
            margin: 0;
          "
        >
          <header style="display: flex; justify-content: center">
            <div
              class="message-wrapper"
              style="max-height: 800px; max-width: 300px; background-color: black"
            >
              <h1 style="margin-block-start: 0">תודה על תמיכתך בקולנוע שבלולים</h1>
              <h2>הסרטים יהיו זמינים לך למשך חודש מרגע קבלת המייל</h2>
              <br />
              <img src="https://shablulimfilm.com/for_mail.jpeg" width="300" />
              <p style="font-size: 24px; margin-block: 24px; word-wrap: break-word">
                הקוד האישי שלך:
              </p>
              <p style="font-size: 24px; margin-block: 24px; word-wrap: break-word">
                ${code}
              </p>
              <br />
              <p style="margin-block: 1rem; word-wrap: break-word">
                את הקוד יש להכניס באתר
              </p>
              <br />
              <p style="margin-block: 1rem; word-wrap: break-word">
                ניתן גם להיכנס דרך הלינק הבא:
              </p>
              <a
                href="https://shablulimfilm.com/v2/html/index.php?code=CODE_HTML"
                style="word-wrap: break-word"
                >https://shablulimfilm.com/v2/html/index.php?code=CODE_HTML</a
              >
              <p     margin-block: 1rem;
              word-wrap: break-word;
          >צפייה נעימה</p>
              <br /><br /><br />
            </div>
          </header>
        </body>
      </html>`,
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('problem with sending email', error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}
module.exports = {
  sendEmailAfterPayment,
}

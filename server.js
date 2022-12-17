
const DBService = require('./services/DBService')
const authService = require('./services/auth.service')
const emailService = require('./services/email.service')
const path = reuqire('path')
const cookieParser = require('cookie-parser')
const express = require('express')
const cors = require('cors')
const paypal = require('paypal-rest-sdk')
const app = express()

const MOVIES_TABLE = 'movies'
const COMMENTS_TABLE = 'comments'

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
  // Express serve static files on production environment
  app.use(express.static(path.resolve(__dirname, 'dist')))
} else {
  // Configuring CORS
  const corsOptions = {
    // Make sure origin contains the url your frontend is running on
    origin: [
      ' ',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
    ],
    credentials: true,
  }
  app.use(cors(corsOptions))
}

paypal.configure({
  mode: 'sandbox', //sandbox or live
  client_id:
    'AU1nOg4TUN86em-Zvt7w1UrZ02pW51QaQcl6sJQEDRnUG9QwR_FbbYmvPNuj27DX87rLKhHh-4RqZrDm',
  client_secret:
    'EKwsO_IEGGHJl9ZKZiAOkqQuS5mME72cw0Jqe2oR7WpTCR7fOD2zVcrFw6Z8yOyPnE31cTrn7BODso_R',
})

//LIST MOVIES
app.get('/api/movies', (req, res) => {
  var query = `SELECT * FROM ${MOVIES_TABLE}`
  const aquireVideosFromDb = (videos) => {
    if (!videos) res.status(500).send({ err: 'Failed to get videos' })
    else {
      res.send(videos)
    }
  }
  DBService.runSQL(query, aquireVideosFromDb)
})

// LIST COMMENTS
app.get('/api/comments/:id', (req, res) => {
  const movieId = req.params.id
  var query = `SELECT * FROM ${COMMENTS_TABLE} WHERE movie_id = ${movieId}`
  const aquireCommentsFromDb = (comments) => {
    if (!comments) res.status(500).send({ err: 'Failed to get comments' })
    else {
      res.send(comments)
    }
  }
  DBService.runSQL(query, aquireCommentsFromDb)
})

// GET MOVIE BY ID
app.get('/api/movies/:id', (req, res) => {
  const movieId = req.params.id
  var query = `SELECT * FROM ${MOVIES_TABLE} WHERE _id = ${movieId}`
  const aquireMovieFromDb = (movie) => {
    if (!movie) res.status(500).send({ err: 'Failed to get movie' })
    else {
      res.send(movie)
    }
  }
  DBService.runSQL(query, aquireMovieFromDb)
})

// POST COMMENT
app.post('/api/comments', (req, res) => {
  const { content, name, movieId } = req.body
  if (!content || !name || !movieId)
    res.status(500).send({ err: 'Fields are required to make request' })
  var query = `INSERT INTO ${COMMENTS_TABLE} (comment, name, movie_id) VALUES ("${content}", "${name}", "${movieId}")`
  const postCommentToDb = (results) => {
    if (!results) res.status(500).send({ err: 'Failed to post comment' })
    else {
      res.send(results)
    }
  }
  DBService.runSQL(query, postCommentToDb)
})

// VALIDATE COUPON

app.post('/api/validate-code', (req, res) => {
  const code  = req.cookies.code
  if (!code) {
    res.send(false)
    return
  }
  const isCodeValid = authService.decryptXor(code)
  res.send(isCodeValid)
})

app.post('/api/pay', (req, res) => {
  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'http://localhost:3030/success',
      cancel_url: 'http://localhost:3030/cancel',
    },
    transactions: [
      {
        amount: {
          currency: 'ILS',
          total: '0.1',
        },
        description: 'קופון קולנוע שבלולים',
      },
    ],
  }

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.send(payment.links[i].href)
        }
      }
    }
  })

  app.get('/success', (req, res) => {
    const payerId = req.query.PayerID
    const paymentId = req.query.paymentId

    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: 'ILS',
            total: '0.1',
          },
        },
      ],
    }

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        if (error) {
          console.log(error.response)
          throw error
        } else {
          console.log(JSON.stringify(payment))
          // save code to cookies
          const encryptedCode = authService.encryptXor()
          res.cookie('code', encryptedCode, {
            secure: false,
            maxAge: 30 * 24 * 60 * 60,
          })
          // sending email with code
          const clientEmail = payment.payer.payer_info.email
          emailService.sendEmailAfterPayment({code: encryptedCode, email: clientEmail})
          // change url after production
          res.redirect('http://localhost:5173/payment-message')
        }
      }
    )
  })
  app.get('/cancel', (req, res) => res.send('Cancelled'))
})

const port = process.env.PORT || 3030

app.listen(port, () => console.log(`Server is ready at port ${port}!`))

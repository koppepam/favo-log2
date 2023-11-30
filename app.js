const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const csurf = require('tiny-csrf');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [ 'query' ] });

const GitHubStrategy = require('passport-github2').Strategy;
const GITHUB_CLIENT_ID = '857bfcb89784dfa07323';
const GITHUB_CLIENT_SECRET = 'dd39e5f569df70f486de3eacfc89ad636ce5f107';

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:8000/auth/github/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(async () => {
      const userId = parseInt(profile.id);

      const data = {
        userId,
        username: profile.username
      }
      await prisma.user.upsert({  // ？
        where: { userId },
        create: data,
        update: data
      });

      done(null, profile);
    });
  }
));

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const postsRouter = require('./routes/posts');

const app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('nyobiko_signed_cookies'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: '5e05939c1d0a0a29', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(
  csurf(
    'nyobikosecretsecret9876543212345',
    ['POST'],
    [/.*\/(candidates|comments).*/i] 
  )
);

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/posts', postsRouter);

app.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    const loginFrom = req.cookies.loginFrom;
    // オープンリダイレクタ脆弱性対策
    if (loginFrom && loginFrom.startsWith('/')) {
      res.clearCookie('loginFrom');
      res.redirect(loginFrom);
    } else {
      res.redirect('/');
    }
  }
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

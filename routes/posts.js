'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const { param, body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [ 'query' ] });
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

router.get('/new', authenticationEnsurer, (req, res, next) => {
  res.render('new', { user: req.user, csrfToken: req.csrfToken() });
});

// 投稿作成
router.post('/', authenticationEnsurer, async (req, res, next) => {
  await body('title').isString().run(req);
  await body('body').isString().run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error('入力された情報が不十分または正しくありません。');
    err.status = 400;
    return next(err);
  }

  const postId = uuidv4();
  const updatedAt = new Date();
  const post = await prisma.post.create({
    data: {
      postId: postId,
      title: req.body.title.slice(0, 255) || '(タイトルなし)',
      body: req.body.body,
      postedBy: parseInt(req.user.id),
      updatedAt: updatedAt
    }
  });
  res.redirect('/');  // res.redirect('/posts/' + post.postId);
  console.log('----postId =', postId);
});

// 削除
router.post('/:postId/delete', authenticationEnsurer, async (req, res, next) => {
  await param('postId').isUUID('4').run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error('URL の形式が正しくありません。');
    err.status = 400;
    return next(err);
  }

  const post = await prisma.post.findUnique({
    where: { postId: req.params.postId }
  });
  const isMine = parseInt(req.user.id) === parseInt(post.postedBy);
  if (isMine) {
    await deletePostAggregate(post.postId);
    res.redirect('/');
  } else {
    const err = new Error('指定された投稿がない、または、削除する権限がありません');
    err.status = 404;
    next(err);
  }
});

async function deletePostAggregate(postId) {
  await prisma.post.delete({ where: { postId } });
}
router.deletePostAggregate = deletePostAggregate;

// 共有
router.get('/:postId', authenticationEnsurer, async (req, res, next) => {
  await param('postId').isUUID('4').run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error('URL の形式が正しくありません。');
    err.status = 400;
    return next(err);
  }

  const post = await prisma.post.findUnique({ where: { postId: req.params.postId } });
  if (post) {
    post.formattedUpdatedAt = dayjs(post.updatedAt).tz().format('YYYY/MM/DD HH:mm');
    res.render('posts', { 
      user: req.user,
      post: post
    });
  } else {
    const err = new Error('共有された投稿は見つかりませんでした。');
    err.status = 404;
    next(err);
  }
});


module.exports = router;
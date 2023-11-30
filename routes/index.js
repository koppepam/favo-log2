'use strict';
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [ 'query' ] });
// 年月日表示
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');


/* GET home page. */
router.get('/', async (req, res, next) => {
  const title = 'お気に入り記録';
  if (req.user) {
    const posts = await prisma.post.findMany({
      where: { postedBy: parseInt(req.user.id) },
      orderBy: { updatedAt: 'desc' }
    });
    posts.forEach((post) => {
      post.formattedUpdatedAt = dayjs(post.updatedAt).tz().format('YYYY/MM/DD HH:mm');
    });
    res.render('index', {
      title: title,
      user: req.user,
      posts: posts,
      csrfToken: req.csrfToken()
    });
  } else {
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;

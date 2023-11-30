'use strict';
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [ 'query' ] });

describe('/login', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  test('ログインのためのリンクが含まれる', async () => {
    await request(app)
      .get('/login')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/<a href="\/auth\/github"/)
      .expect(200);
  });

  test('ログイン時はユーザ名が表示される', async () => {
    await request(app)
      .get('/login')
      .expect(/testuser/)
      .expect(200);
  });
});

describe('/logout', () => {
  test('/ にリダイレクトされる', async () => {
    await request(app)
      .get('/logout')
      .expect('Location', '/')
      .expect(302);
  });
});

describe('/posts/new', () => {
  let postId = '';
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  afterAll(async () => {
    passportStub.logout();
    passportStub.uninstall();

    // テストで作成したデータを削除
    await prisma.post.delete({ where: { postId } });
  });

  test('新しく投稿でき、表示される', async () => {  // 失敗
    const userId = 0, username = 'testuser';
    const data = { userId, username };
    await prisma.user.upsert({
      where: { userId },
      create: data,
      update: data
    });
    const res = await request(app)
    .post('/posts/new')
    .send({
      title: 'テストタイトル',
      body: 'テスト本文'
    })
    .expect('Location', '/')
    .expect(302);
    
    const createdPostPath = res.headers.location;
    postId = createdPostPath.split('/posts/')[1];
    await request(app)
      .get(createdPostPath)
      .expect(/テストタイトル/)
      .expect(/テスト本文/)
      .expect(200);
  })
})
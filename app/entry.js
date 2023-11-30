'use strict';
import $ from 'jquery';

$('.share-button').each((_i, shareButton) => {
  const button = $(shareButton);
  button.on('click', () => {
    const postId = $(button).data('post-id');
    const shareUrl = `${location.origin}/posts/${postId}`;
    console.log(shareUrl);
    navigator.clipboard.writeText(shareUrl).then(() => {
      button.html(`<i class="bi bi-bookmark-check">Copied!</i>`);
      setTimeout(() => button.html(`<i class="bi bi-share-fill">共有</i>`), 1000);
    });
  });
});

// 検索機能 TODO 結果表示
// let meta = document.querySelector('meta[name="posts"]');
// let usermeta = document.querySelector('meta[name="user"]');
// const posts = JSON.parse(meta.content);
// const user = (usermeta.content);
// const searchInput = document.getElementById('search-input');
// let searchDisplay = document.getElementById('search-display');

// searchInput.addEventListener('input', () => {
//   if (searchInput.value.length === 0) {
//     return;
//   }
//   let keyword = null;
//   try {
//     keyword = hiraganaToKatakana(searchInput.value);
//     keyword = new RegExp(keyword);
//   } catch {
//     return;
//   }

//   const checkedPosts = posts.filter((post) => {
//     let target = post.content + post.cat + post.postedBy;
//     target = hiraganaToKatakana(target);

//     const result = keyword.test(target);
//     return result;
//   });

//   displayData(checkedPosts);
// });

// function displayData(checkedPosts) {
//   const keyword = searchInput.value;
//   searchDisplay.innerHTML = '';
//   if (checkedPosts.length > 0) {
//     searchDisplay.innerHTML = `<h4>「${keyword}」が含まれる投稿</h4>`;
//     for (const post of checkedPosts) {
//       let isDeletable = (user === post.postedBy || user === 'admin')
//       searchDisplay.innerHTML += `
//             <div class="card my-3">
//               <div class="card-header">
//                 <span class="h4 float-left" style="white-space:pre;">${sanitize(post.cat)?.replaceAll(keyword, `<strong style="color:red;">${keyword}</strong>`) || 'タイトルなし'}</span>
//                 ${isDeletable ?
//           `<form method="post" action="/posts/delete">
//                       <input type="hidden" name="id" value="${post.id}">
//                       <button class="btn btn-danger float-right" type="submit"><i class="bi bi-trash"></i> 削除</button>
//                     </form>` :
//           ''
//         }
//               </div>
//               <div class="card-body">
//                 <div class="d-flex align-items-center justify-content-between">
//                   <div class="d-flex align-items-center">
//                     <svg class="d-block bg-light rounded-circle mr-3" data-jdenticon-value="${post.postedBy}" width="30" height="30"></svg>
//                     <h5>${post.postedBy.replaceAll(keyword, `<strong style="color:red;">${keyword}</strong>`)}</h5>
//                   </div>
//                   <small class="float-right">${dayjs(post.createdAt).format('YYYY年MM月DD日 HH時mm分ss秒')}</small>
//                 </div>
//                 <hr>
//                 <p class="card-text" style="white-space:pre; overflow:auto;">${sanitize(post.content).replaceAll(keyword, `<strong style="color:red;">${keyword}</strong>`)}</p>
//               </div>
//             </div>
//             `;
//     }
//     const script = document.createElement('script');
//     script.setAttribute('src', "https://cdn.jsdelivr.net/npm/jdenticon@3.2.0/dist/jdenticon.min.js");
//     script.setAttribute('async', '');
//     script.setAttribute('integrity', "sha384-yBhgDqxM50qJV5JPdayci8wCfooqvhFYbIKhv0hTtLvfeeyJMJCscRfFNKIxt43M");
//     script.setAttribute('crossorigin', "anonymous");
//     searchDisplay.appendChild(script);
//   } else {
//     searchDisplay.innerHTML = `<h4>「${keyword}」に一致する投稿はありませんでした</h4>`;
//   }
// }

// function hiraganaToKatakana(text) {
//   return text.replace(/[\u3041-\u3096]/g, (match) => {
//     const charCode = match.charCodeAt(0) + 0x60;
//     return String.fromCharCode(charCode);
//   });
// }

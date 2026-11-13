/**
 * 随记广场 —— 迷你动态分享应用
 * 纯原生 JavaScript 实现，数据基于 Local Storage 持久化
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'mini-feed-posts';

  var inputEl = document.getElementById('composer-input');
  var submitEl = document.getElementById('composer-submit');
  var hintEl = document.getElementById('composer-hint');
  var listEl = document.getElementById('feed-list');
  var emptyEl = document.getElementById('feed-empty');

  /* ===== 数据读写（含容错） ===== */

  function loadPosts() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      // 过滤掉结构不完整的脏数据
      return data.filter(function (post) {
        return post && typeof post.content === 'string' && typeof post.createdAt === 'number';
      });
    } catch (e) {
      // 存储损坏时回退为空数组
      return [];
    }
  }

  function savePosts(posts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
      return true;
    } catch (e) {
      // 隐私模式等 Local Storage 不可用时降级为仅内存展示
      return false;
    }
  }

  /* ===== 工具函数 ===== */

  function generateId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function formatTime(timestamp) {
    var date = new Date(timestamp);
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日 '
      + pad(date.getHours()) + ':' + pad(date.getMinutes());
  }

  /* ===== 渲染 ===== */

  function render() {
    var posts = loadPosts().sort(function (a, b) {
      return b.createdAt - a.createdAt; // 按发布时间倒序
    });

    listEl.textContent = '';
    emptyEl.hidden = posts.length > 0;

    posts.forEach(function (post) {
      var item = document.createElement('li');
      item.className = 'feed__item';

      var content = document.createElement('p');
      content.className = 'feed__content';
      content.textContent = post.content; // textContent 防 XSS

      var time = document.createElement('time');
      time.className = 'feed__time';
      time.dateTime = new Date(post.createdAt).toISOString();
      time.textContent = formatTime(post.createdAt);

      item.appendChild(content);
      item.appendChild(time);
      listEl.appendChild(item);
    });
  }

  /* ===== 发布逻辑 ===== */

  function publish() {
    var content = inputEl.value.trim();
    if (!content) {
      showHint('内容不能为空', true);
      return;
    }

    var posts = loadPosts();
    posts.push({
      id: generateId(),
      content: content,
      createdAt: Date.now()
    });

    if (savePosts(posts)) {
      inputEl.value = '';
      updateSubmitState();
      showHint('');
      render();
    } else {
      showHint('保存失败：浏览器存储不可用，内容仅本次显示', true);
      render();
    }
  }

  function showHint(text, isError) {
    hintEl.textContent = text;
    hintEl.classList.toggle('is-error', Boolean(isError));
  }

  function updateSubmitState() {
    submitEl.disabled = inputEl.value.trim().length === 0;
  }

  /* ===== 事件绑定 ===== */

  submitEl.addEventListener('click', publish);

  inputEl.addEventListener('input', function () {
    updateSubmitState();
    if (hintEl.classList.contains('is-error')) showHint('');
  });

  inputEl.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      publish();
    }
  });

  /* ===== 初始化 ===== */

  render();
})();

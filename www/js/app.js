// Page init event
let application_key = localStorage.getItem('application_key');
let client_key = localStorage.getItem('client_key');
let ncmb = null;
if (application_key && client_key) {
  ncmb = new NCMB(application_key, client_key);
}

ons.ready(function() {
  let dialog = $('#dialog');
  $('.hideDialog').on('click', function(e) {
    e.preventDefault();
    $('#dialog').hide();
  });
});

// ダイアログを表示する関数
let showDialog = (title, content) => {
  let dialog = $('#dialog');
  dialog.find('.alert-dialog-title').text(title);
  dialog.find('.alert-dialog-content').html(content);
  dialog.show();
}

document.addEventListener('init', function(event) {
  var page = event.target;
  if (page.matches('#first-page')) {
    $(page).find('.showMenu').on('click', function(e) {
      e.preventDefault();
      $('#navigator')[0].pushPage('setting.html');
    });
    $(page).find('.member_register_idpw').on('click', function(e) {
      e.preventDefault();
      $('#navigator')[0].pushPage('idpw_register.html');
    });
    $(page).find('.member_login_idpw').on('click', function(e) {
      e.preventDefault();
      $('#navigator')[0].pushPage('idpw_login.html');
    });
    $(page).find('.member_logout').on('click', function(e) {
      e.preventDefault();
      ncmb.User.logout()
        .then(function() {
          showDialog('ログアウト完了', 'ログアウトしました');
          $('.member_login_status').text('未ログイン');
        })
        .catch(function(err) {
          showDialog('ログアウト失敗', `ログアウトに失敗しました<br />${err}`);
        })
    });
    
    $('.datastore_todo').on('click', function(e) {
      e.preventDefault();
      $('#navigator')[0].pushPage('datastore_todo.html');
    });
    
    if (ncmb) {
      let user = ncmb.User.getCurrentUser();
      if (user) {
        $('.member_login_status').text(user.userName);
      }
    }
  }
  
  // 設定ページに関するイベント
  if (page.matches('#setting')) {
    $('#application_key').val(application_key);
    $('#client_key').val(client_key);
    $(page).find('.save').on('click', function(e) {
      e.preventDefault();
      application_key = $('#application_key').val();
      client_key      = $('#client_key').val();
      localStorage.setItem('application_key', application_key);
      localStorage.setItem('client_key', client_key);
      ncmb = new NCMB(application_key, client_key);
      $('#navigator')[0].popPage();
    });
  }
  
  // IDとパスワードを使った会員登録に関するイベント
  if (page.matches('#idpw-register')) {
    $(page).find('.register').on('click', function(e) {
      e.preventDefault();
      let user = new ncmb.User();
      user
        .set("userName", $('#username').val())
        .set("password", $('#password').val())
        .signUpByAccount()
        .then(function(obj) {
          // 登録完了
          showDialog('登録完了', '登録したID/パスワードでログインを行ってください');
        })
        .catch(function(err) {
          // 登録失敗
          showDialog('登録失敗', `登録に失敗しました<br />${err}`);
        })
    });
  }
  
  // IDとパスワードを使った会員ログインに関するイベント
  if (page.matches('#idpw-login')) {
    $(page).find('.login').on('click', function(e) {
      e.preventDefault();
      ncmb.User.login($('#username').val(), $('#password').val())
        .then(function(user){
          // ログイン後処理
          showDialog('ログイン完了', 'ログインしました');
          $('.member_login_status').text(user.userName);
          $('#navigator')[0].popPage();
        })
        .catch(function(err){
          // エラー処理
          showDialog('ログイン失敗', `ログインに失敗しました<br />${err}`);
        });
    });
  }
  
  // データストアのTodo管理に関するイベント
  if (page.matches('#datastore_todo')) {
    const Todo = ncmb.DataStore('Todo');
    
    // タスクを追加するイベント
    $(page).find('.add').on('click', function(e) {
      e.preventDefault();
      let todo = new Todo;
      
      // ログインしている場合は権限設定を行う
      let user = ncmb.User.getCurrentUser();
      if (user) {
        let acl = new ncmb.Acl();
        acl
          .setUserReadAccess(user, true)
          .setUserWriteAccess(user, true)
        todo.set('acl', acl);
      }
      
      // タスクを保存する
      todo
        .set('value', $('#todo').val())
        .save()
        .then(function(todo) {
          task_add(todo);
          $('#todo').val('');
        });
    });
    
    // 初期表示用
    Todo
      .fetchAll()
      .then(function(todos) {
        for (let i = 0; i < todos.length; i++) {
          task_add(todos[i]);
        }
      });
    
    // タスクを追加する処理
    let task_add = (todo) => {
      $('#tasks').append(`
        <ons-list-item class="item">
          <div class="center">${todo.value}</div>
          <div class="right">
          <ons-icon icon="fa-trash-o" class="delete" data-id=${todo.objectId}>
          </ons-icon>
          </div>
        </ons-list-item>
      `);
    };
    
    // タスクを削除するイベント
    $(page).on('click', '#tasks', function(e) {
      e.preventDefault();
      let todo = new Todo;
      todo
        .set('objectId', $(e.target).data('id'))
        .delete()
        .then(function() {
          $(e.target).parents('.item').remove();
        })
    });
  }
});

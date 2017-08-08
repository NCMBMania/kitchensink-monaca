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
});

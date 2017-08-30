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
    
    $('.datastore_todo_array').on('click', function(e) {
      e.preventDefault();
      $('#navigator')[0].pushPage('datastore_todo_array.html');
    });
    
    $('.datastore_memo').on('click', function(e) {
      e.preventDefault();
      $('#navigator')[0].pushPage('datastore_memo.html');
    });
    
    $('.photo_list').on('click', function(e) {
      e.preventDefault();
      $('#navigator')[0].pushPage('photo_list.html');
    });
    
    $('.filestore_memo').on('click', function(e) {
      e.preventDefault();
      $('#navigator')[0].pushPage('filestore_memo.html');
    });
    
    $('.datastore_geosearch').on('click', function(e) {
      e.preventDefault();
      $('#navigator')[0].pushPage('datastore_geosearch.html');
    })
    
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
      $(page).find('#tasks').append(`
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


  // データストアのTodo管理（配列版）に関するイベント
  if (page.matches('#datastore_todo_array')) {
    let Todo = ncmb.DataStore('TodoArray');
    let todo = new Todo;
    
    // タスクを追加するイベント
    $(page).find('.add').on('click', function(e) {
      e.preventDefault();
      
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
      const task = $('#todo').val();
      if (todo.tasks) {
        todo.tasks.push(task);
      }else{
        todo.tasks = [task];
      }
      todo.set('tasks', todo.tasks);
      (todo.objectId ? todo.update() : todo.save())
        .then(function(data) {
          let last_index = todo.tasks.length - 1;
          task_add(todo.tasks[last_index], last_index);
          $('#todo').val('');
        });
    });
    
    // 初期表示用
    Todo
      .fetch()
      .then(function(data) {
        if (data.objectId) {
          todo = data;
        }
        if (!todo.tasks) {
          return;
        }
        for (let i = 0; i < todo.tasks.length; i++) {
          task_add(todo.tasks[i], i);
        }
      })
      .catch(function(err) {
        showDialog('取得失敗', `タスクの取得に失敗しました<br />${err}`);
      })
    
    // タスクを追加する処理
    let task_add = (todo, i) => {
      $(page).find('#tasks').append(`
        <ons-list-item class="item">
          <div class="center">${todo}</div>
          <div class="right">
          <ons-icon icon="fa-trash-o" class="delete" data-index=${i}>
          </ons-icon>
          </div>
        </ons-list-item>
      `);
    };
    
    // タスクを削除するイベント
    $(page).on('click', '#tasks', function(e) {
      e.preventDefault();
      const index = $(e.target).data('index');
      todo
        .set('tasks', todo.tasks.splice(index, 1))
        .update()
        .then(function() {
          $(e.target).parents('.item').remove();
        })
    });
  }

  if (page.matches('#datastore_memo')) {
    const Memo = ncmb.DataStore('Memo');
    let memo = null;
    // 既存データの取得
    Memo
      .fetch()
      .then(function(data) {
        memo = data;
        $('#memo').val(memo.text);
      });
    $(page).find('.save').on('click', function(e) {
      e.preventDefault();
      if (!memo.objectId) {
        memo = new Memo;
      }
      // ログインしている場合は権限設定を行う
      let user = ncmb.User.getCurrentUser();
      if (user) {
        let acl = new ncmb.Acl();
        acl
          .setUserReadAccess(user, true)
          .setUserWriteAccess(user, true)
        memo.set('acl', acl);
      }
      memo.set('text', $('#memo').val());
      (memo.objectId ? memo.update() : memo.save())
        .then(function(data) {
          memo = data;
        })
        .catch(function(err) {
          showDialog('保存失敗', `メモの保存に失敗しました<br />${err}`);
        })
    });
  }
  
  // ファイルストア版メモ
  if (page.matches('#filestore_memo')) {
    const Memo = ncmb.DataStore('Memo');
    let memo = null;
    let user = ncmb.User.getCurrentUser();
    if (user) {
      fileName = `memo.${user.objectId}.txt`;
    }else{
      fileName = `memo.txt`;
    }
    
    // 既存データの取得
    ncmb.File
      .download(fileName)
      .then(function(memo) {
        $('#memo').val(memo);
      })
      .catch(function(err) {
        // ファイルがまだない場合
        console.log(err);
      });
        
    $(page).find('.save').on('click', function(e) {
      e.preventDefault();
      let acl = new ncmb.Acl();
      if (user) {
        acl
          .setUserReadAccess(user, true)
          .setUserWriteAccess(user, true)
      }else{
        acl.setPublicReadAccess(true);
        acl.setPublicWriteAccess(true);
      }
      let blob = new Blob([$('#memo').val()], {type: 'text/plain'});
      console.log(blob)
      ncmb.File
        .upload(fileName, blob, acl)
        .then(function() {
          // ログインしている場合は権限設定を行う
        })
        .then(function() {
          
        })
        .catch(function(err) {
          showDialog('ファイル保存エラー', `ファイルの保存に失敗しました<br />${err}`);
        })
    });
  }
  
  // 位置情報検索
  if (page.matches('#datastore_geosearch')) {
    
    // 山手の線データの取り込み
    $(page).find('.import').on('click', function(e) {
      $.ajax({
        dataType: 'json',
        url: '../resources/yamanote.json'
      })
      .then(function(results) {
        let Station = ncmb.DataStore('Station');
        let ary = [];
        for (let i = 0; i < results.length; i++) {
          ary.push(saveStation(results[i]));
        }
        // まとめて処理
        Promise
          .all(ary)
          .then(function(results) {
            // 取り込み完了
          })
      });
    });

    let mapDiv = document.getElementById("map");
    let currentPosition = null;
    let Station = ncmb.DataStore('Station');
    let markers = [];
    let map = null;
    
    // 検索ボタンを押した時の処理
    $(page).find('.search').on('click', function(e) {
      // 中心を取得
      var origin = new ncmb.GeoPoint(currentPosition.latitude, currentPosition.longitude);
      Station
        // 周囲3キロで検索
        .withinKilometers('geo', origin, 3)
        .fetchAll()
        .then(function(results) {
          // すでにあるマーカーをすべて削除
          for (let i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
          }
          
          // マーカーを立てる
          for (let i = 0; i < results.length; i++) {
            let station = results[i];
            let marker = new google.maps.Marker({
              map: map,
	            position: new google.maps.LatLng(station.geo.latitude, station.geo.longitude)
            });
            markers.push(marker);
          }
        })
    });
    
    // 初期の地図表示
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let geo = position.coords;
        currentPosition = geo;
        map = new google.maps.Map(mapDiv, {
          center: new google.maps.LatLng(geo.latitude, geo.longitude),
          zoom: 16,
        });
        
        // 地図を動かしたら検索の中心位置情報を変更
        map.addListener("dragend", function(argument) {
          console.log('dragged')
          currentPosition = {
            latitude: map.center.lat(),
            longitude: map.center.lng()
          };
        });
      },
      (error) => {
        
      });
    
    // すでにデータストア上にデータがあるかどうかを確認して、なければデータを作成する
    let saveStation = (station) => {
      return new Promise((res, rej) => {
        Station
          .where({name: station.name})
          .fetch()
          .then(function(data) {
            if (data.name) {
              return res(data)
            }
            var geo = new ncmb.GeoPoint(new Number(station.latitude), new Number(station.longitude));
            let s = new Station;
            s
              .set('name', station.name)
              .set('geo', geo)
              .save()
              .then(function(e) {
                res(e);
              })
              .catch(function(e) {
                rej(e);
              })
          })
      });
    }
  }
  
  // 写真アップロードアプリ
  if (page.matches('#photo_list')) {
    $('#preview_area').hide();
    let file = null;
    $(page).find('#photo').on('change', function(e) {
      file = e.target.files[0];
      loadImage(file, function(img) {
          $('#preview_area').show();
          $('#preview').empty();
          $('#preview').append(img);
        },
        {
          maxWidth: 250,
          canvas: true
        }
      );
    });
    
    $(page).find('#upload').on('click', function(e) {
      // ログインしている場合は権限設定を行う
      let user = ncmb.User.getCurrentUser();
      let acl = new ncmb.Acl();
      if (user) {
        acl
          .setUserReadAccess(user, true)
          .setUserWriteAccess(user, true)
      }
      ncmb.File
        .upload(`photoList-${file.name}`, file, acl)
        .then(function(obj) {
          load_image(obj.fileName);
        });
      
      
    });

    let load_image = (fileName) => {
      var reader = new FileReader();
      reader.onload = function(e) {
        $('#photos').append(`
          <ons-col width="200px">
            <img width="200px" src="${reader.result}"
          </ons-col>
        `);
      };
      ncmb.File.download(fileName, "blob")
        .then(function(blob) {
          reader.readAsDataURL(blob);
        });
    }
    
    ncmb.File
      .regularExpressionTo('fileName', '^photoList\-.*')
      .fetchAll()
      .then(function(photos) {
        for (let i = 0; i < photos.length; i++) {
          load_image(photos[i].fileName);
        }
      })
  }
});

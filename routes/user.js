
var nodemailer = require('nodemailer');

var signup = function(req, res) {
    console.log('/signup 라우팅 함수 호출됨.');
  
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;
  
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramName);
  
    var database = req.app.get('database');

    // 데이터 베이스 객체가 초기화된 경우, signup 함수 호출하여 사용자 추가
    if(database) {
      signUp(database, paramId, paramPassword, paramName, function(err, result) {
  
        if(err) {
            console.log('회원가입 에러 발생...');
            console.dir(err);
            res.status(400).send();
        }
       // 결과 객체 확인하여 추가된 데이터 있으면 성공 응답 전송
        if(result) {
          console.log('회원가입 성공.');
          console.dir(result);
          res.status(200).send();
          console.log('\n\n');
  
        } else { // 결과 객체가 없으면 실패 응답 전송
          console.log('회원가입 에러 발생...');
          res.status(400).send();
          console.log('\n\n');
        }
      });
    }
    else { // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
      console.log('회원가입 에러 발생...');
      console.dir(err);
      res.status(400).send();
      console.log('\n\n');
    }
};

var login = function(req, res){
    console.log('/login 라우팅 함수 호출됨');
  
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);
    var database = req.app.get('database');
    if(database) {
        authUser(database, paramId, paramPassword, function(err, docs) {
  
          if (err) {
            console.log('로그인 에러 발생');
            console.dir(err);
            res.status(404).send();
          }
  
          if (docs) {
            console.log('doc확인절차 : ' + docs[0].id + ', ' + docs[0].name);
  
            // 찾은 결과 전송
            var objToSend = {
              id: docs[0].id,
              password: docs[0].password,
              name: docs[0].name
            };
  
            console.log('로그인 : 데이터베이스 존재 : 회원찾기 성공 : 찾은 결과 전송 성공');
  
            // 정상 코드 전송
            res.status(200).send(JSON.stringify(objToSend));
            console.log('\n\n');
  
          }
  
          else {
            console.log('로그인 에러 발생');
            res.status(404).send();
            console.log('\n\n');
          }
  
        });
    } else {
      console.log('데이터베이스가 정의되지 않음...');
      res.status(400).send();
      console.log("\n\n");
    }
};

var watchlist = function(req, res) {
    console.log('/watchlist(감상결과 목록 처리) 라우팅 함수 호출');
  
    var paramId = req.body.id || req.query.id; // 사용자 아이디 받아오기
    var database = req.app.get('database');
    if(database) {
      WatchModel.findById(paramId, function(err, results) {
          if (err) {
            callback(err, null);
            return;
          }
          console.log(results);
          console.log(paramId + '의 감상결과 리스트 가져오기');
  
          if(results.length>0) {
            console.log('감상결과 목록 존재');
            var resultArray = new Array(results.length);
            for(var i=0;i<results.length;i++) {
              var objToSend = {
                title: results[i].title,
                poster: results[i].poster
              };
              resultArray[i]=objToSend;
            }
            res.status(200).send(JSON.stringify(resultArray)); // 감상결과 목록 보내기
          } else {
            console.log('감상 기록 없음');
          }
        });
    }
    else{
        console.log('데이터베이스가 정의되지 않음...');
        res.status(400).send();
        console.log("\n\n");
    }
};

var watchresult = function(req, res) {
    console.log('/watchresult(감상결과) 라우팅 함수 호출');
  
    var paramId = req.body.id || req.query.userid; // 사용자 아이디 받아오기
    var paramMovie = req.body.movieId || req.query.movieId; // 영화 아이디 받아오기
    var database = req.app.get('database');
    if(database) {
  
      getWatchResult(database, paramId, paramMovie, function(err, results){
  
        console.dir(results)
  
        if (err){
          console.log('감상결과 가져오는 중에 에러 발생...');
          console.dir(err)
          res.status(400).send();
        }
  
        else if (results.length > 0) {
  
          var objToSend = {
            title: results[0].title,
            poster: results[0].poster,
            genres: results[0].genres,
            emotion: results[0].emotion,
            highlight: results[0].highlight
          };
  
          res.status(200).send(JSON.stringify(objToSend));
          console.log('감상기록 결과 : 데이터베이스 존재 : 기록 존재 : 찾은 결과 전송 성공');
          console.log('\n\n');
  
        }
  
        else {
          res.status(400).send();
          console.log('감상기록 결과 없음.');
          console.log('\n\n');
        };
  
      });
  
    }
    else{
      console.log('데이터베이스가 정의되지 않음...');
      res.status(400).send();
      console.log("\n\n");
    }
};

var sceneAnalyze = function(req, res) {
    console.log('/sceneAnalyze 라우팅 함수 호출');
    var database = req.app.get('database');
    // 감정맥스 초, 감정 종류 받아오기
    //var maxSecond = req.body.maxSecond || req.query.maxSecond;
    //var emotionKind = req.body.emotionKind || req.query.emotionKind;

    if(database) {
    // 파이썬 실행 처리 코드, 장면분석 결과 받아옴
      // 1. child-process모듈의 spawn 취득
      const spawn = require('child_process').spawn;
      // 2. spawn을 통해 "python 파이썬파일.py" 명령어 실행
      const result = spawn('python', ['video_test2.py']);

      // 3. stdout의 'data'이벤트리스너로 실행결과를 받는다.
      result.stdout.on('data', function(data) {
        const stringResult = data.toString();
        // 받아온 파이썬 코드 결과 데이터 형식 여기서 처리
        var array = stringResult.split('\n');
        for(var i=0;i<array.length;i++) {
           //array[i]=array[i].replace(/[0-9]/g, '');
           //array[i]=array[i].trim();
           console.log(array[i]);
        }
        res.status(200).send(JSON.stringify(array));
      });

      // 4. 에러 발생 시, stderr의 'data'이벤트리스너로 실행결과를 받는다.
      result.stderr.on('data', function(data) {
        const stringResult = data.toString();
        // 받아온 파이썬 코드 결과 데이터 형식 여기서 처리
        var array = stringResult.split('\n');
        for(var i=0;i<array.length;i++) {
           //array[i]=array[i].replace(/[0-9]/g, '');
           //array[i]=array[i].trim();
           console.log(array[i]);
        }
        res.status(200).send(JSON.stringify(array));
      });
    }
    else{
        console.log('데이터베이스가 정의되지 않음...');
        res.status(400).send();
        console.log("\n\n");
    }
}

var recommend1 = function(req, res){
    var database = req.app.get('database');
    if(database) {

    // 파이썬 실행 처리 코드, 파이썬에서 처리한 추쳔영화 10개 가져옴
      // 1. child-process모듈의 spawn 취득
      const spawn = require('child_process').spawn;
      // 2. spawn을 통해 "python 파이썬파일.py" 명령어 실행
      const result = spawn('python', ['test3_2.py']);
  
      // 3. stdout의 'data'이벤트리스너로 실행결과를 받는다.
      result.stdout.on('data', function(data) {
        const stringResult = data.toString();
  
        var array = stringResult.split('\n');
        for(var i=0;i<array.length-2;i++) {
           array[i]=array[i].replace(/[0-9]/g, '');
           array[i]=array[i].trim();
           console.log(array[i]);
        }
        res.status(200).send(JSON.stringify(array));
      });
  
      // 4. 에러 발생 시, stderr의 'data'이벤트리스너로 실행결과를 받는다.
      result.stderr.on('data', function(data) {
        const stringResult = data.toString();
  
        var array = stringResult.split('\n');
        for(var i=0;i<array.length;i++) {
           array[i]=array[i].replace(/[0-9]/g, '');
           array[i]=array[i].trim();
           console.log(array[i]);
        }
      });
    }
    else{
        console.log('데이터베이스가 정의되지 않음...');
        res.status(400).send();
        console.log("\n\n");
    }
  
};

var recommend2 = function(req, res){
    console.log('/recommend2 (사용자 추천) 라우팅 함수 호출');
  
    var paramId = req.body.id || req.query.id; // 사용자 아이디 받아오기
    var database = req.app.get('database');
    if (database){
  
      //파이썬 코드 실행 (유사 사용자 추천)
      const spawnSync = require('child_process').spawnSync; // child-process 모듈의 spawn 획득
      var getpython = ''
  
      //result에는 유저에게 추천할 사용자들 id 가 들어있음.
      const result = spawnSync('python', ['recommend/main.py'], {input : paramId});
      console.log('중간점검')
  
      if(result.status !== 0){
        process.stderr.write(result.stderr)
  
        process.exit(result.status);
      } else{
        process.stdout.write(result.stdout);
        process.stderr.write(result.stderr);
        getpython = result.stdout.toString();
        console.log('python 결과 형식 : ', typeof(getpython))
      }
  
      getRecommendUserList(database, getpython, function(err, result){
  
        console.dir(result);
  
        if(err){
          console.log('추천 사용자 목록 가져오는 중에 에러 발생 ...');
          console.dir(err);
          res.status(400).send();
        }
  
        else if(result.length > 0){
          console.log('추천 사용자 목록 가져오기 성공');
          console.log(result);
  
          // 전달 : 추천 사용자들 목록 find id 통해서 포스터, 영화제목
          res.status(200).send(JSON.stringify(result));
          console.log('추천 사용자 목록 전송 성공');
          console.log('\n\n');
        }
  
        else {
          res.status(400).send()
          console.log('추천 사용자 목록 없음.');
          console.log('\n\n');
        }
  
      });
  
    } else {
      console.log("데이터베이스가 정의되지 않음...");
      res.status(400).send
    }
};

var enterroom = function(req, res){

    console.log('/enterRoom ( 방 코드 입력 / 입장 ) 라우팅 함수 호출');
    var database = req.app.get('database');
    if(database){
  
      var paramRoomCode = req.body.roomCode || req.query.roomCode;
  
      console.log('입력된 룸 코드 : ' + paramRoomCode);
  
      enterRoom(database, paramRoomCode, function(err, result){
  
        if (err) {
          console.log('초대 코드 검색 중 오류');
          console.dir(err);
          res.status(400).send();
        }
  
        else if (result.length > 0){
          console.log('초대 코드에 해당하는 함께보기 방 검색 성공');
  
  
          // 방 생성한 유저 아이디를 스키마에 넣어서 전달해주는 것도 좋을듯
          res.status(200).send();
          console.log('같이 보기 방 : 초대 코드 검색 완료 : 정상코드 발송 완료');
          console.log('\n\n');
        }
  
        else{
          res.status(400).send();
          console.log('초대 코드에 해당하는 같이 보기 방 없음...');
          console.log('\n\n')
        };
  
      })
    }
    else{
      console.log('데이터베이스가 정의되지 않음...');
      res.status(400).send();
      console.log('\n\n');
    }
  
};

var watchAloneStart = function(req, res){ // watch스키마 생성
  var database = req.app.get('database');

  var paramId = req.body.id || req.query.id; // 사용자 아이디 받아오기
  var parammovieTitle = req.body.movieTitle || req.query.movieTitle; // 감상중인 영화 제목 받아오기

  if (database){

    var posterurl = ''
    var genres = ''
    var newWatch

    async function searchMovieInfo(){
      const existing = await database.MovieModel.find(
        {title : parammovieTitle}).clone()
      
      if (existing.length > 0) {
        posterurl = existing[0].poster
        genres = existing[0].genres
      }
    }
    async function createWatchResult(){
      newWatch = new database.WatchModel({ 
        'userId': paramId, 
        'movieTitle': parammovieTitle,
        'poster': posterurl,
        'genres': genres,
        'concentration': 0,
        'highlight_time': '1',
        'highlight_emotion': '1',
        'emotion_array': { "HAPPY" : 0, "SAD" : 0, "ANGRY" : 0, "CONFUSED" : 0, "DISGUSTED": 0, "SURPRISED" : 0, "FEAR" : 0, },
        'highlight_array' : {},
        'rating': 0,
        'comment': '',
        'sleepingCount ' : 0
      });
    }

    async function main(){
      await searchMovieInfo()
      await createWatchResult()
      await newWatch.save(function(err) {
        if (err){
          console.log('감상결과 스키마 생성 및 저장 오류')
          res.status(400).send() // 저장오류
          return;
        }
        console.log('감상 결과 데이터 추가 ');
        res.status(200).send()
      });
      console.log(newWatch)
    }
    main()
  }
  else { // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
    console.log('데이터 베이스 에러 ...');
    console.dir(err);
    res.status(400).send();
    console.log('\n\n');
  }
};

var watchImageCaptureEyetrack = async function(req, res){
  console.log('/watchImageCaptureEyetrack 라우팅 함수 호출됨.');

  var database = req.app.get('database');

  // eyetrack용 이미지를 s3버킷에 업로드 했다는 요청을 받으면

  var paramId = req.body.id || req.query.id; // 사용자 아이디 받아오기
  var parammovieTitle = req.body.movieTitle || req.query.movieTitle; // 감상중인 영화 아이디 받아오기
  var paramTime = req.body.time || req.query.time;

  var sleepCount = 0
  var checkLimit = 0

  if (database){
  
    //파이썬 코드 실행 (유사 사용자 추천)
    const spawnSync= require('child_process').spawnSync; // child-process 모듈의 spawn 획득
    var getpython = ''

    //result에는 유저에게 추천할 사용자들 id 가 들어있음.
    const result = spawnSync('python', ['eyetracking/eyetrack.py', paramTime]);

    if(result.status !== 0){
      process.stderr.write(result.stderr)
      process.exit(result.status);
    } else{
      process.stdout.write(result.stdout);
      process.stderr.write(result.stderr);
      getpython = result.stdout.toString();
      // console.log('eyetrack.py 결과 형식 : ', typeof(getpython))
    }

    var newEyetrack = new database.EyetrackModel({ 
      'userId': paramId, 'movieTitle': parammovieTitle, 'time' : paramTime,
      'concentration' :  Number(getpython) 
    });

    newEyetrack.save(function(err) {
      if (err){
        console.dir(err);
        res.status(400).send()
      }
      console.log('집중도 데이터 추가');
    });

    // 감상결과에 저장해놓은 (몇번 잤니?) 받아오기 
    // 영화 러닝타임 알아오기 -> (몇번 잤니?) 가 용인되는 횟수보다 적은가 확인해야 하기때문
    /// ==> 기다려줘야함 1. 
    const existing = await database.WatchModel.find(
      {userId : paramId, movieTitle : parammovieTitle}).clone()
    
    async function countlimit() {
      if (existing.length > 0) {
        // console.dir(existing)

        sleepCount = existing[0].sleepingCount 

        await database.MovieModel.findByTitle(parammovieTitle, async function(err, result){
          if (result.length > 0){
            // console.dir(result[0])
            checkLimit = result[0].runningTime / 10 / 2
            console.log('러닝타임 : ', result[0].runningTime)
            console.log('용인 한계 : ', checkLimit)
            console.log('현재 : ', sleepCount, "\n")
          }
        }).clone()
      }
      else{
        console.log('WatchModel에 정보 없음요')
        res.status(400).send()
      }
    }
    await countlimit()

    // 자는 중이니?
    /// 2.
    async function isSleep(){

      if (Number(getpython) == 0){
        console.log('집중도 분석 결과 : 자는 중');
        sleepCount = sleepCount + 1
  
        // 결과 스키마의 (몇번잤니?) 수정
        /// 3.
        await database.WatchModel.updateOne({
          userId: paramId,
          movieTitle: parammovieTitle
        },{
          $set: {
            sleepingCount: sleepCount
          }
        }).clone()
  
        // sleepCount가 용인 횟수를 넘었을 때
        /// 4.
        if ((sleepCount) >= checkLimit) {
          console.log('분석 횟수 중 절반 이상 자는 중.');
          res.status(410).send() // 자는 중이라고 프론트에 알려줌 - 410 // 프론트에 알려줘야 함.
        } else {
          console.log('아직 분석 횟수 중 절반 이하 자는 중.');
        }
  
      }
      else{ // 안 자는 중
        console.log('집중도 분석 결과 : 안 자는 중');
  
        path = '' // path - 수정필요
  
        // 감정분석 시작 - 수정 필요
        watchImageCaptureRekognition(database, paramId, parammovieTitle, paramTime, function(err, result){
          if (result){
            console.log('집중도 | 감정데이터 분석 및 정보 추가 완료');
            res.status(200).send()
          }
          else {
            console.log('집중도 성공 | 감정 실패');
            console.dir(err)
            res.status(400).send();
          }
        }); 
      }
    }
    await isSleep()

  } else {
    console.log("데이터베이스가 정의되지 않음...");
    res.status(400).send()
  }
}

var watchAloneEnd = function(req, res){
  var database = req.app.get('database');

  var paramId = req.body.id || req.query.id; // 사용자 아이디 받아오기
  var parammovieTitle = req.body.movieTitle || req.query.movieTitle; // 감상중인 영화 제목 받아오기
  var tmp_highlight_array // 정규화 전 배열
  var normalization_array // 정규화 후 배열
  var highlight_time // 감정의 폭이 큰 시간

  async function getWatchResult(userId, movieTitle){ // 감상결과 기록을 찾는 함수. / 하이라이트 계산 배열 찾아옴.

    var existing_watch = await database.WatchModel.find({
      userId : userId, movieTitle : movieTitle
    }).clone()

    if (existing_watch.length>0){
      console.log('해당 유저의 해당 영화의 감상 기록 찾음.')
      tmp_highlight_array = existing_watch[0].highlight_array
    }
    else {
      console.log('해당 유저의 해당 영화의 감상 기록 존재하지 않음.')
      res.status(400).send();
    }
  }
  async function getHighlightTile(){
    tmp_highlight_array.sort(function(a,b){
      if (a.emotion_diff > b.emotion_diff) return -1;
      if (a.emotion_diff < b.emotion_diff) return 1;
      if (a.emotion_diff == b.emotion_diff) return 0;
    });
    highlight_time = tmp_highlight_array[0].time
  }

  async function main(){

    ////////////////////////// 하이라이트 정규화 //////////////////////////
    await getWatchResult(paramId, parammovieTitle);
    await normalization(tmp_highlight_array, function(result){
      normalization_array = result
    });
    /////////////////////////////////////////////////////////////////

    await database.WatchModel.updateOne({ // 감상목록 highlight_array 수정 // 
      userId: paramId,
      movieTitle: parammovieTitle
    }, {  
      $set: {
        highlight_time : highlight_time,
        highlight_array : normalization_array,   
      },
    })
  }
  main()
  
  
  
};

var email = function(req, res){
    console.log('/email(이메일 인증) 라우팅 함수 호출');
    var database = req.app.get('database');
    if(database){
  
        var paramId = req.body.id;
  
        // 발신자 정의.
        var app_email = '***@gmail.com';
        var app_pass = '****';

  
        console.log('수신자 : ', paramId);
  
        sendEmail(app_email, app_pass, paramId, function(err, results){
  
          if(err){
            console.log('이메일 발송 실패')
            res.status(400).send();
            console.log('\n\n');
          }
  
          if (results){
            console.log('mail 전송을 완료하였습니다.');
            res.status(200).send(JSON.stringify(results));
            console.log('\n\n');
          }
        })
    }
    else{
        console.log('데이터베이스가 정의되지 않음...');
        res.status(400).send();
        console.log("\n\n");
    }
};

var makeRoom = function(req, res) {
    console.log('/makeRoom 라우팅 함수 호출됨');
    var database = req.app.get('database');
    
    var RoomCode = Math.random().toString(36).substr(2,11); // 랜덤으로 방 초대코드 생성

    if(database) {
      makeroom(database,RoomCode, function(err, result){
        if (err) {
          console.log('회원가입 중 에러 발생');
          console.dir(err);
          return;
        }
  
        if(result.length > 0) {
          console.log('초대 코드 중복, 다시 생성..');
          const Checking2 = Math.random().toString(36).substr(2,11); // 랜덤으로 방 초대코드 생성
  
          // 방을 새로 생성합니다.
          var room = new database.RoomModel({'roomCode': Checking2});
          console.log('RoomCode : ' + RoomCode);
  
          // save()로 저장
          room.save(function(err) {
            if(err) {
              return;
            }
            console.log('새로운 방 등록');
            // 찾은 결과 전송
            var objToSend = {
              roomCode: result[0].roomCode
            };
            res.status(200).send(JSON.stringify(objToSend));
          });
        }
  
        else {
          // 방을 새로 생성합니다.
          var room = new database.RoomModel({'roomCode': RoomCode});
          console.log('RoomCode : ' + RoomCode);
          // save()로 저장
          room.save(function(err) {
            if(err) {
              return;
            }
            console.log('새로운 방 등록');
            // 찾은 결과 전송
            var objToSend = {
              roomCode: RoomCode
            };
            res.status(200).send(JSON.stringify(objToSend));
          });
        }
      });
    }
    else{
        console.log('데이터베이스가 정의되지 않음...');
        res.status(400).send();
        console.log("\n\n");
    }
};

var logout = function (req, res) {
    res.status(200).send();
    console.log('로그아웃합니다..');
};

var getWatchResult = function(db, userid, movieid, callback){
  console.log('getWatchResult(감상결과 가져오기) 호출됨. userid : ' + userid + ', movieid : ' + movieid);

  WatchModel.findById(userid, function(err, results_id) {

        if (err) {
          callback(err, null);
          return;
        };

        if(results_id.length > 0) {

          console.log(userid + '의 감상결과 발견');
          WatchModel.findByMovieId(movieid, function(err, results_movie) {

            if(err){
              callback(err, null);
            }

            if (results_movie.length > 0) {

              console.log(movieid + ' : 감상 기록 존재');
              callback(null, results_movie);
            }

            else {
              callback(null, null);
            };

          });
        }
        else{
          callback(null, null);
        }
      });
}

var authUser = function(db, id, password, callback) {
  console.log('authUser(로그인) 호출됨' + id + ', ' + password);

  // 아이디를 사용해 검색
  db.UserModel.findById(id, function(err, results_id){

      if (err) {
          callback(err, null);
          return;
      }

      console.log('아이디 %s로 검색됨',id);

      if (results_id.length > 0) {
          console.log('아이디와 일치하는 사용자 찾음');
          db.UserModel.authenticate(password, function(err, results){
            if(err){
                callback(err, null)
                return;
            }

            if(results.length > 0){
                console.log('비밀번호 일치');

                callback(null, results_id);
            }

            else{
                callback(null, null);
            }

        })
      }
      else {
          console.log('아이디와 일치하는 사용자를 찾지 못함');
          callback(null, null);
      }

  });
};

// 사용자를 추가하는 함수
var signUp = function(db, id, password, name, callback) { // callback 함수는 함수를 호출하는 쪽에 결과 객체를 보내기 위해 쓰임
  console.log('signUp 호출됨' + id + ', ' + password + ', ' + name);

  // 아이디를 사용해 검색
  db.UserModel.findById(id, function(err, results){

    if (err) {
      console.log('회원가입 중 에러 발생');
      console.dir(err);
      return;
    }

    if(results.length > 0) {

      console.log('이미 가입된 아이디입니다.');
      console.log('username : ', results[0].name);

    }
    else {

      var user = new db.UserModel({'id' : id, 'password': password, 'name' : name});

      // save()로 저장
      user.save(function(err) {
        if(err) {
          callback(err, null);
          return;
        }
        console.log('사용자 데이터 추가함');
        callback(null, user);
      });
    }
  }
)};

var enterRoom = function(db, roomcode, callback){
  console.log('enterRoom (같이보기 방 입장)호출됨. 방 코드 : ' + roomcode);

  db.roomModel.findByRoomCode(roomcode, function(err, result){

    if(err){
      callback(err, null);
      return;
    }

    else if(result.length > 0){
      console.log('입력된 코드에 해당하는 같이보기 방 찾음.');

      callback(null, result);
    }

    else{
      callback(null, null);
      return;
    }

  })
}

var getRecommendUserList = function(database, result, callback){

  console.log('getRecommendUserList 호출됨.');

  substrResult = result.substring(2)
  splitResult = substrResult.split(' ')
  console.log(splitResult)

  console.log('result 개수 ; ', splitResult.length);

  splitResult2 = [];
  var resultArray = [];

  for (var i = 0; i<splitResult.length; i++){

    if (splitResult[i] == ''){
      // console.log(i+'번째는 continue')
      continue
    }
    else{
      splitResult2.push(parseInt(splitResult[i]))
      // console.log(i + '번째 검사결과 : ' + typeof(splitResult[i]))
      console.log(splitResult2)
    }
  };

  var count = splitResult2.length
  console.log('===================\n결과 갯수 : ', count)
  splitResult2.forEach(element => {
    database.WatchModel.findByMovieId(element, function(err, result){
      console.log('무비아이디로 찾는 중')

      if(err){
        console.log('추천 사용자 못찾음')
        callback(err, null)
      }

      if(result.length > 0){
        console.log('추천 사용자 찾음')
        resultArray.push({
          id : result[0].userId,
          title : result[0].title,
          poster : result[0].poster
        })
        console.log(resultArray)
      }

      else {
        console.log('추천 사용자 못찾음')
        callback(null, null);
      }

      if(resultArray.length == count){
        console.log('추천 사용자 | 추천 목록 생성 완료')
        callback(null, resultArray);
      }
    })
  })
};

var makeroom = function (db, roomcode, callback) {
  db.RoomModel.findByRoomCode(roomcode, function(err, result){
    if(err){
      callback(err, null);
      return;
    }

    else if(result.length > 0){
      console.log('입력된 코드에 해당하는 같이보기 방 찾음.생성불가');

      callback(null, result);
    }

    else{
      callback(null, '');
      return;
    }
  });
};

var sendEmail = function (sendemail, sendpass, userid, callback) {

    console.log('sendEmail 호출됨.');
  
    const email = async () => {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 3000,
        secure: false,
        auth: {
          user: sendemail,
          pass: sendpass,
        },
      });
  
      console.log('transporter 설정 완료');
  
      var code = (Math.floor(Math.random()*9000)+1000).toString()
  
      const objToSend = {
        code: code
      }
  
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: `"allonsy"`,
        to: userid,
        subject: '[하루뭅] 인증코드를 확인해주세요 ',
        text: code,
        html: '<a>안녕하세요. <b>하루뭅(Harumub)</b>입니다.<br>'
        +'고객님께서 입력하신 이메일의 소유확인을 위해 아래 인증번호를 회원가입 화면에 입력해주세요.</a> <br> <br><b>'
        +code+'</b>'
        
      });
  
      console.log("Messege email address : ", userid)
      console.log('Message sent: %s', info.messageId);
      console.log("Mail Code : ", code)
  
      callback(null, objToSend);
      return;
    };
  
    callback(console.err, null);
    email().catch(console.error);
};

var watchImageCaptureRekognition = function (db, userId, movieTitle, time, callback) {

  console.log('rekognition 함수 호출')

  var result_total // python 감정분석 실행 결과 배열

  //////////////////////////////////////////////////감정분석 파이썬 코드 실행//////////////////////////////////////////////////
  function rekognition_python() {
    //파이썬 코드 실행 (사용자 감정 분석)
    const spawnSync = require("child_process").spawnSync; // child-process 모듈의 spawn 획득
    var getpython = "";

    // (param) 이미지 경로 재설정 필요
    const result = spawnSync("python", ["rekognition/rekognition.py", time]);

    if (result.status !== 0) {
      process.stderr.write(result.stderr);

      process.exit(result.status);
    } else {
      process.stdout.write(result.stdout);
      process.stderr.write(result.stderr);
      getpython = result.stdout.toString();
      // console.log('rekognition.py 결과 형식 : ', typeof (getpython))
      //console.log(getpython)
    }

    // 문자 예쁘게 정리
    removedResult = getpython.replace(/\'/g, "");
    removedResult = removedResult.replace(/\[/g, "");
    removedResult = removedResult.replace(/\]/g, "");

    result_total = removedResult.split(", ");
  }
  rekognition_python()
  //////////////////////////////////////////////////감정분석 파이썬 코드 완료//////////////////////////////////////////////////

  //////////////////////////////////////////////////감정의 폭 관련 코드 시작//////////////////////////////////////////////////
  var calm_count = 0
  var calm_sum = 0
  var calm_emotion_count = 0
  var calm_emotion_sum = 0
  var calm_emotion_calm_sum = 0

  // rekognition모델 10초전의 기록을 찾아서 변수에 넣어야 함.
  var tmp_calm_count = 0
  var tmp_calm_sum = 0
  var tmp_calm_emotion_count = 0
  var tmp_calm_emotion_sum = 0
  var tmp_calm_emotion_calm_sum = 0

  // 감정의 폭 계산 결과
  var highlight_emotion_diff = 0
  var highlight_emotion_time = 0


  // watch모델에 기록된 감상결과
  var tmp_emotion_array = []

  // 수정된 감상결과
  var edit_emotionArray = []

  async function getPastRekognition(userId, movieTitle, time){ // 10초 전의 rekognition 기록을 찾는 함수.
    
    var pastTime = time - 10

    var existing_re = await db.RekognitionModel.find({
      userId : userId, movieTitle : movieTitle, time : pastTime
    }).clone()

    if (existing_re.length>0){
      console.log('10초 전의 rekognition 기록 찾음.', existing_re[0])

      tmp_calm_count = existing_re[0].calm_count
      tmp_calm_sum = existing_re[0].calm_sum
      tmp_calm_emotion_count = existing_re[0].calm_emotion_count
      tmp_calm_emotion_sum = existing_re[0].calm_emotion_sum
      tmp_calm_emotion_calm_sum = existing_re[0].calm_emotion_calm_sum
    }
    else {
      console.log('10초 전의 rekognition 기록 존재하지 않음.')
    }
  }


  async function getWatchResult(userId, movieTitle){ // 감상결과 기록을 찾는 함수.

    var existing_watch = await db.WatchModel.find({
      userId : userId, movieTitle : movieTitle
    }).clone()

    if (existing_watch.length>0){
      console.log('해당 유저의 해당 영화의 감상 기록 찾음.')
      tmp_emotion_array = existing_watch[0].emotion_array
      return true;
    }
    else {
      console.log('해당 유저의 해당 영화의 감상 기록 존재하지 않음.')
      callback(null, null); // 감상기록을 찾지 못하면 콜백으로 돌아가버림 - 문제가 있는것.
    }
  }

  async function getCalmConcentration(){ // 감정분석 후 calm 의 confidence를 찾기 위한 함수
    for (var i = 0; i < 15; i += 2){
      if (result_total[i] == "CALM"){
        calm_emotion_calm_sum = Number(tmp_calm_emotion_calm_sum) + Number(result_total[i+1])
        break;
      }
    }
  }
  async function check_highlight(){

      calm_emotion_count = tmp_calm_emotion_count + 1
      calm_emotion_sum = Number(tmp_calm_emotion_sum) + Number(result_total[1])
      console.log('calm_emotion_sum: ', calm_emotion_sum)

      await getCalmConcentration();

      console.log('tmp_calm_count : ', tmp_calm_count)
      console.log('calm_emotion_count : ', calm_emotion_count)

      if (tmp_calm_count == 0){
        calm_count = 0;
        calm_sum = 0;
        calm_emotion_count = 0;
        calm_emotion_sum = 0;
        calm_emotion_calm_sum = 0;
      }

      else if (tmp_calm_count == 1){
        calm_count = 0;
        calm_sum = 0;
        calm_emotion_count = 0;
        calm_emotion_sum = 0;
        calm_emotion_calm_sum = 0;
      }

      else if (tmp_calm_count == 2){
        if (calm_emotion_count == 2){
          // 감정의 폭 계산
          calm_aver = (tmp_calm_sum / 2)
          calm_emotion_calm_aver = (calm_emotion_calm_sum / 2)
          calm_emotion_aver = (calm_emotion_sum / 2)
          highlight_emotion_diff = (((calm_aver - calm_emotion_calm_aver) + calm_emotion_aver)/2)
          highlight_emotion_time = time

          // 초기화
          calm_count = 0;
          calm_sum = 0;
          calm_emotion_count = 0;
          calm_emotion_sum = 0;
          calm_emotion_calm_sum = 0;
        }
      }
  }

  async function edit_emotion_array(first){
    if (first == 'HAPPY') {
      edit_emotionArray[0].HAPPY += 1
      await check_highlight()
    }
    else if (first == 'SAD') {
      edit_emotionArray[0].SAD += 1
      await check_highlight()
    }
    else if (first == 'ANGRY') {
      edit_emotionArray[0].ANGRY += 1
      check_highlight()
    }
    else if (first == 'CONFUSED') {
      edit_emotionArray[0].CONFUSED += 1
      check_highlight()
    }
    else if (first == 'DISGUSTED') {
      edit_emotionArray[0].DISGUSTED += 1
      check_highlight()
    }
    else if (first == 'SURPRISED') {
      edit_emotionArray[0].SURPRISED += 1
      check_highlight()
    }
    else if (first == 'FEAR') {
      edit_emotionArray[0].FEAR += 1
      check_highlight()
    }
    else if (first == 'CALM') {
      calm_count = tmp_calm_count + 1
      calm_sum = tmp_calm_sum + result_total[1]

      if (tmp_calm_emotion_count == 1){
        calm_emotion_count = 0
        calm_emotion_sum = 0
        calm_emotion_calm_sum = 0
      }
    }
  }


  async function main(){

    await getPastRekognition(userId, movieTitle, time)
    console.log('====================첫번째 완료====================')

    await getWatchResult(userId, movieTitle);
    console.log("====================두번째 완료====================");

    // watch model 기록안에 있던 emotion_array를 대입.
    edit_emotionArray = tmp_emotion_array;
    console.log("확인필요 ; ", edit_emotionArray[0]);
    console.log("확인필요 ; ", edit_emotionArray[0].SAD);

    await edit_emotion_array(result_total[0])
    console.log('====================네번째 완료====================')

    if (highlight_emotion_time == 0){
      await db.WatchModel.updateOne({ // 감상목록 emotion_array 수정 //
        userId: userId,
        movieTitle: movieTitle
      }, {  
        $set: {
          emotion_array: edit_emotionArray,   
        },
      })
    }
    else {
      await db.WatchModel.updateOne({ // 감상목록 emotion_array 수정 //
        userId: userId,
        movieTitle: movieTitle
      }, {  
        $set: {
          emotion_array: edit_emotionArray,   
        },
        $push : {
          highlight_array: {
            time : highlight_emotion_time,
            emotion_diff : highlight_emotion_diff
          }
        }
      })
    }
    console.log('====================다섯번째 완료====================')

    // 감정분석 기록 추가 //
    var newRekognition = await new db.RekognitionModel({
      'userId': userId, 'movieTitle': movieTitle, 'time': time,
      'firstEmotion': result_total[0],
      'firstConfidence': result_total[1],
      'secondtEmotion': result_total[2],
      'thirdEmotion': result_total[4],
      'fourthEmotion': result_total[6],
      'fifthEmotion': result_total[8],
      'sixthEmotion': result_total[10],
      'seventhEmotion': result_total[12],
      'eighthEmotion': result_total[14],
      'calm_count': calm_count, // calm 횟수
      'calm_sum' : calm_sum, // calm confidence 합
      'calm_emotion_count' : calm_emotion_count, // calm 2번 후에 emotion 횟수
      'calm_emotion_sum' : calm_emotion_sum, // calm 2번 후에 emotion confidence 합
     'calm_emotion_calm_sum' : calm_emotion_calm_sum // calm 2번 후에 emotion 나왔을 때 calm의 합
    });
    await newRekognition.save(function (err) {
      if (err) {
        console.dir(err);
        callback(err, null)
      }
      console.log('감정분석 데이터 추가');
      callback(null, true)
    })
    console.log('====================여섯번째 완료====================')


  
  }
  main()
}
  
module.exports.signup = signup;
module.exports.login = login;
module.exports.watchlist = watchlist;
module.exports.watchresult = watchresult;
module.exports.recommend1 = recommend1;
module.exports.recommend2 = recommend2;
module.exports.enterroom = enterroom;
module.exports.email = email;
module.exports.makeRoom = makeRoom;
module.exports.sceneAnalyze = sceneAnalyze;
module.exports.logout = logout;
module.exports.watchAloneStart = watchAloneStart;
module.exports.watchImageCaptureEyetrack = watchImageCaptureEyetrack;
module.exports.watchAloneEnd = watchAloneEnd;
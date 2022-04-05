var Schema = {};

Schema.createSchema = function (mongoose) {

    console.log('createSchema 호출됨.')

    // 스키마 정의 - 몽구스는 각각 다른 스키마를 다루기 가능 (관계db와 차이점)
    // 스키마 정의 (속성: type, required, unique)
   var RekognitionSchema = mongoose.Schema({
        userId: { type: String, require: true, unique: false, 'default': '' },
        movieTitle: { type: String, require: true, unique: false, 'default': '' },
        time: { type: String, require: true, unique: true, 'default': '' },
        firstEmotion: { type: String, require: true, unique: false, 'default': '' },
        firstConfidence : { type: Number, require: true, unique: false, 'default': '' },
        secondtEmotion: { type: String, require: true, unique: false, 'default': '' },
        thirdEmotion: { type: String, require: true, unique: false, 'default': '' },
        fourthEmotion: { type: String, require: true, unique: false, 'default': '' },
        fifthEmotion: { type: String, require: true, unique: false, 'default': '' },      
        sixthEmotion: { type: String, require: true, unique: false, 'default': '' },        
        seventhEmotion: { type: String, require: true, unique: false, 'default': '' },       
        eighthEmotion: { type: String, require: true, unique: false, 'default': '' },   
        calm_count : { type: Number, require: true, unique: false, 'default': '' }, 
        calm_sum : { type: Number, require: true, unique: false, 'default': '' }, 
        calm_emotion_count : { type: Number, require: true, unique: false, 'default': '' }, 
        calm_emotion_sum : { type: Number, require: true, unique: false, 'default': '' }, 
        calm_emotion_calm_sum : { type: Number, require: true, unique: false, 'default': '' }, 
    });

    console.log('Schema 정의를 완료하였습니다.');

    // RekognitionSchema userId, movieId 로 검색
    RekognitionSchema.static('findByUsermovieTitle', function (userId, movieTitle, callback) { // findByUserMovieId 함수 추가
        return this.find({ userId : userId , movieTitle : movieTitle }, callback);
    });

    // RekognitionSchema userId, movieTitle 로 검색
    RekognitionSchema.static('findByTime', function (time, callback) { // findByTime 함수 추가
        return this.find({ time : time }, callback);
    });

    console.log('Schema 설정을 완료하였습니다.');

    return RekognitionSchema;
}

module.exports = Schema
var Schema = {};

Schema.createSchema = function (mongoose) {

    console.log('createSchema 호출됨.')

    // 스키마 정의 - 몽구스는 각각 다른 스키마를 다루기 가능 (관계db와 차이점)
    // 스키마 정의 (속성: type, required, unique)
   var EyetrackSchema = mongoose.Schema({
        userId: { type: String, require: true, unique: false, 'default': '' },
        movieTitle: { type: String, require: true, unique: false, 'default': '' },
        time: { type: String, require: true, unique: true, 'default': '' },
        concentration: { type: Number, require: true, unique: false, 'default': '' },
    });

    console.log('Schema 정의를 완료하였습니다.');

    // EyetrackSchema userId, movieId 로 검색
    EyetrackSchema.static('findByUserMovieId', function (userId, movieTitle, callback) { // findByUserMovieId 함수 추가
        return this.find({ userId : userId , movieTitle : movieTitle }, callback);
    });

    console.log('Schema 설정을 완료하였습니다.');

    return EyetrackSchema;
}

module.exports = Schema
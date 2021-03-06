var Schema = {};

Schema.createSchema = function (mongoose) {

    console.log('createSchema 호출됨.')

    // 스키마 정의 - 몽구스는 각각 다른 스키마를 다루기 가능 (관계db와 차이점)
    // 스키마 정의 (속성: type, required, unique)

    var WatchSchema = mongoose.Schema({ // 감상기록
        userId: { type: String, required: true, 'default': '' },// 사용자 아이디
        movieId: { type: String, required: true, unique: true, 'default': '' },
        title: { type: String, required: true, 'default': '' },
        poster: { type: String, required: true },
        genres: { type: String, required: true },
        emotion: { type: String, required: true },
        highlight: { type: String, required: true }
    });

    console.log('Schema 정의를 완료하였습니다.');

    // 필수 속성에 대한 유효성 확인 (길이 값 체크)
    // WatchSchema id로 검색
    WatchSchema.static('findById', function (id, callback) { // findById 함수 추가해서 모델객체에서 호출할 수 있도록함
        return this.find({ userId: id }, callback);
    });
    // WatchSchema id로 검색
    WatchSchema.static('findByMovieId', function (id, callback) { // findById 함수 추가해서 모델객체에서 호출할 수 있도록함
        return this.find({ movieId: id }, callback);
    });

    console.log('Schema 설정을 완료하였습니다.');

    return WatchSchema;
}

module.exports = Schema
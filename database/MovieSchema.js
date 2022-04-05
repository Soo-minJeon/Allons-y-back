

var Schema = {};

Schema.createSchema = function (mongoose) {

    console.log('MovieSchema 호출됨.')

    // 스키마 정의 - 몽구스는 각각 다른 스키마를 다루기 가능 (관계db와 차이점)
    // 스키마 정의 (속성: type, required, unique)
    var MovieSchema = mongoose.Schema({ // d영화정보
        title: { type: String, required: true, unique: true, 'default': '' }, // 영화 제목
        runningTime: { type: Number, required: true, unique: false, 'default': '' }, // 영화 재생 시간
        genres: { type: String, required: true, unique: false, 'default' : '' }, // 장르
        poster: { type: String, required: true, unique: true, 'default': '' }, // 영화 포스터
    });

    console.log('Schema 정의를 완료하였습니다.');

    // 스키마에 static 메소드 추가, static 메소드를 사용하여 스키마에 메소드를 추가한다. - 2개의 메소드 이용할 수 있게 됨. findById, findAll
    MovieSchema.static('findByTitle', function (title, callback) { // findById 함수 추가해서 모델객체에서 호출할 수 있도록함
        return this.find({ title: title }, callback);
    });

    console.log('Schema 설정을 완료하였습니다.');

    return MovieSchema;
}

module.exports = Schema
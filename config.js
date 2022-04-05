// 설정 정보

module.exports = {
    server_port : 3000,
    db_url : "mongodb://127.0.0.1:27017/local",
    db_schemas : [
        {file : './UserSchema', 
        collection : 'UserCollection', 
        schemaName : "UserSchema", 
        modelName : "UserModel"},

        {file : './WatchSchema', 
        collection : 'WatchCollection', 
        schemaName : "WatchSchema", 
        modelName : "WatchModel"},

        {file : './RoomSchema', 
        collection : 'RoomCollection', 
        schemaName : "RoomSchema", 
        modelName : "RoomModel"},

        {file : './EyetrackSchema', 
        collection : 'EyetrackCollection', 
        schemaName : "EyetrackSchema", 
        modelName : "EyetrackModel"},

        { file : './RekognitionSchema', 
        collection : 'RekognitionCollection', 
        schemaName : "RekognitionSchemㅁa", 
        modelName : "RekognitionModel"},

        { file : './MovieSchema', 
        collection : 'MovieCollection', 
        schemaName : "MovieSchema", 
        modelName : "MovieModel"}
    ],
    route_info: [
        {file:'./routes/user', path:'/login', method:'login', type:'post'},
        {file:'./routes/user', path:'/signup', method:'signUp', type:'post'},
        {file:'./routes/user', path:'/watchlist', method:'watchlist', type:'post'},
        {file:'./routes/user', path:'/watchresult', method:'watchresult', type:'post'},
        {file:'./routes/user', path:'/recommend1', method:'recommend1', type:'post'},
        {file:'./routes/user', path:'/recommend2', method:'recommend2', type:'post'},
        {file:'./routes/user', path:'/enterroom', method:'enterRoom', type:'post'},
        {file:'./routes/user', path:'/email', method:'email', type:'post'},
        {file:'./routes/user', path:'/makeRoom', method:'makeRoom', type:'post'},
        {file:'./routes/user', path:'/logout', method:'logout', type:'post'},
        {file:'./routes/user', path:'/watchAloneStart', method:'watchAloneStart', type:'post'},
        {file:'./routes/user', path:'/watchImageCaptureEyetrack', method:'watchImageCaptureEyetrack', type:'post'},
        {file:'./routes/user', path:'/watchImageCaptureRekognition', method:'watchImageCaptureRekognition', type:'post'},
        {file:'./routes/user', path:'/watchAloneEnd', method:'watchAloneEnd', type:'post'}
    ]
}
module.exports = {
    'development': {
        FILE_HOST: '127.0.0.1:3000',
        MONGO: 'fancier:fancier123@123.60.18.204:27027/myapp',
    },
    'production': {
        FILE_HOST: '123.60.18.204:3000',
        MONGO: 'fancier:fancier123@127.0.0.1:27027/myapp',
    }
}
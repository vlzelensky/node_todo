const {Schema, model, Types} = require('mongoose');
const schema = new Schema({
    title: {type: String, required: true},
});

module.exports = model('TodoList', schema);
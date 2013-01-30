var mongodb = require('../node_modules/db');

function User(user){
	if(!user){
		this.name = ""; 
		this.password = "";
	}
	this.name = user.name ? user.name : "";
	this.password = user.password ? user.password : "";
}
module.exports = User;

User.prototype.save = function save(callback){
	//save into Mongodb file
    var user = {
        name: this.name,
		password: this.password
	};
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//read users set
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//为name属性添加索引
			collection.ensureIndex('name', {unique: true, dropDups: true });
			//write user into file
			collection.insert(user, {safe: true}, function(err, user){
				mongodb.close();
				callback(err, user);
			});
		});
	});
}

User.get = function get(username, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//read users set
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//search key name which value equals username
			collection.findOne({name: username}, function(err, doc){
				mongodb.close();
				if(doc){
					//封装文档为User对象
					var user = new User(doc);
					callback(err, user);
				}else{
					callback(err, {name:"",password:""});
				}
			});
		});
	});
}
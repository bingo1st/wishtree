var mongodb = require('../node_modules/db');

function Post(username, post, time){
	this.user = username;
	this.post = post;
	if(time){
		this.time = time;
	}else{
		this.time = new Date();
	}
}
module.exports = Post;

Post.prototype.save = function save(callback){
	//save into Mongodb file
    var post = {
        user: this.user,
		post: this.post,
		time: this.time
	};
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
//db.collection.remove({});
		//read posts set
		db.collection('posts', function(err, collection){
			//db.collection.drop();
			if(err){
				mongodb.close();
				return callback(err);
			}
			//collection.drop(); //清空记录
			//为user属性添加索引
			collection.ensureIndex('time');
			//write post into file
			collection.insert(post, function(err, post){
				
				mongodb.close();
				callback(err, post);
			});
		});
	});
}

Post.get = function get(username, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//read posts set
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//search key user which value equals username, if not match all
			var query ={};
			if(username){
				query.user = username;
				collection.find(query).sort({time:-1}).toArray(function(err, docs){
					mongodb.close();
					if(err){
						callback(err);
					}
					var posts = [];
					docs.forEach(function(doc, index){
						var post = new Post(doc.user, doc.post, doc.time.toLocaleDateString());
						posts.push(post);
					});
					callback(null, posts);
				});
			}else{
				collection.find().sort({time:-1}).toArray(function(err, docs){
					mongodb.close();
					if(err){
						callback(err);
					}
					var posts = [];
					docs.forEach(function(doc, index){
						var post = new Post(doc.user, doc.post, doc.time.toLocaleDateString());
						posts.push(post);
					});
					callback(null, posts);
				});
			}
		});
	});
}
/*
 * GET home page.
 */
 var crypto = require('crypto');
 var User = require('../models/user');
 var Post = require('../models/post');
 
module.exports = function(app){
	app.get("/", function(req, res){
		Post.get("", function(err, posts){
			if(err){
				posts = [];
			}
			res.render('index', {
				title: '首页',
				error: '',
				success: '',
				posts: posts
			});
		})
	});
	app.get("/u/:user", function(req, res){
		User.get(req.params.user, function(err, user){
			if(!user){
				res.render('index', {
					title: '首页',
					error: '用户不存在',
					success: '',
					posts: ""
				});
			}
			
			Post.get(user.name, function(err, posts){
				if(err){
					res.render('index', {
						title: '首页',
						error: err,
						posts: "",
						success: ''
					});
					return;
				}
				res.render('index', {
					title: user.name,
					posts: posts,
					error: err,
					success: ''
				});
			});
		});
	});

	app.post("/", function(req, res){
		var currentUser = req.session.user;
		var post = new Post(currentUser.name, req.body.post);
		post.save(function(err){
			if(err){
				res.render('index', {
					title: '首页',
					error: err,
					success: '',
					posts: ""
				});
				return;
			}
			res.redirect('/u/' + currentUser.name);
		});
	});
	
	app.post("/u/:user", function(req, res){
		var currentUser = req.session.user;
		var post = new Post(currentUser.name, req.body.post);
		post.save(function(err){
			if(err){
				res.render('index', {
					title: '首页',
					error: err,
					success: '',
					posts: ""
				});
				return;
			}
			res.redirect('/u/' + currentUser.name);
		});
	});

	app.get("/reg", function(req, res){
		res.render('reg', {
			title: '用户注册',
			error: '',
			success: ''
		});
	});

	app.post("/reg", function(req, res){
		//double check
		if(req.body['password-repeat'] != req.body['password']){
			res.render('reg', {
				title: '用户注册',
				error: '两次输入密码不一致',
				success: ''
			});
		}
		if(!req.body['password-repeat'] || !req.body['password'] || !req.body['username']){
			res.render('reg', {
				title: '用户注册',
				error: '用户名或密码不能为空',
				success: ''
			});
		}
		//生成口令散列值
		//var md5 = crypto.create('md5');
		//var password = md5.update(req.body.password).digest('base64');
		
		var newUser = new User({
			name: req.body.username,
			password: req.body.password
		});
		
		//check user existence
		User.get(newUser.name, function(err, user){
			if(user){
				err = 'Username already exists.';
			}
			if(err){
				 res.render('reg', {
					title: '用户注册',
					error: err,
					success: ''
				});
			}
			//如果不存在则新增用户
			newUser.save(function(err){
				if(err){
					 res.render('reg', {
						title: '用户注册',
						error: err,
						success: ''
					});
				}
				res.locals.user = newUser;
				res.render('index', {
					title: '首页',
					error: "",
					success: '注册成功',
					posts: ""
				});
			});
		});
	});

	app.get("/login", function(req, res){
		res.render('login', {
			title: '用户登录',
			error: '',
			success: ''
		});
	});

	app.post("/login", function(req, res){
		if(!req.body['password'] || !req.body['username']){
			return res.render('login', {
				title: '用户登录',
				error: '用户名或密码不能为空',
				success: ''
			});
		}
        User.get(req.body.username, function(err, user){
			if(!user || !user['password'] || !user['name']){
				err = '用户不存在';
				return res.render('login', {
					title: '用户登录',
					error: err,
					success: ''
				});
			}
			if(user.password != req.body.password){
				err = '用户密码错误';
				return res.render('login', {
					title: '用户登录',
					error: err,
					success: ''
				});
			}
			req.session.user = user;
			res.redirect('/');
			res.render('index', {
				title: '首页',
				error: '',
				success: '登入成功',
				posts: ""
			});
		});
	});

	app.get("/logOut", function(req, res){
		req.session.user = "";
		res.redirect('/');
		 res.render('index', {
			title: '首页',
			error: '',
			success: '退出成功',
			posts: ""
		});
	});
	
	return app.router;
}
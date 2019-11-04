// import axios from 'axios'
var http = require('http');			// http 网路
var cheerio = require('cheerio');	// html 解析
var fs = require("fs");				// 流
const request = require('request');
var queryHref = "http://127.0.0.1:8302/topic/1/new/"; 	// 设置被查询的目标网址
var querySearch = 1;								// 设置分页位置
var urls = [];

var sumConut = 0;
var reptCount = 0;		// 重复的
var downCount = 0;		// 实际下载的


/**
 * 根据url和参数获取分页内容
 * @param {String}： url
 * @param {int}： serach
 */
function getHtml(href, serach) {
	console.log(href, serach)
	request(href + serach, function (error, response, body) {
		$ = cheerio.load(body);
		var html = $(".joke-list-item .joke-main-content a img");
		for(var i = 0; i < html.length; i++) {
			if (html[i].attribs['data-original']) {
				var src = 'http:' + html[i].attribs['data-original'];
				// 筛选部分广告，不是真的段子
				urls.push(src)
			}
		}
		// console.log(serach, pagemax)
		if (serach < pagemax) {
			// if (serach > 2) return
			getHtml(href, ++serach);
		} else {
			console.log(urls, 44)
			console.log("图片链接获取完毕！");
			sumConut = urls.length;
			console.log("链接总数量：" + urls.length);
			console.log("开始下载......");
			downImg(urls.shift());
		}
		// console.log(html.length)
	})
}


/**
 * 下载图片
 * @param {String} imgurl：图片地址
 */
function downImg(imgurl) {
	console.log(imgurl, 'test')
	var narr = imgurl.replace("http://image.haha.mx/", "").split("/")
	// narr[0] = 'http/'
	// console.log(narr, 333)
	// 做一步优化，如果存在文件，则不下载
	// var filename = "./img/" + narr[0]  + narr[1] + narr[2] + "_" + narr[4];
	var filename = "./img/" + narr[7];
	fs.exists(filename, function(b){
		if (!b) {
			// 文件不存则进行 下载
			// request(imgurl.replace("/small/", "/big/"), function(res))
			request({method: 'GET', url: imgurl.replace("/normal/", "/big/"), encoding: 'binary'}, function (error, response, body) {
				var savePath = "./img/" + narr[7];
				console.log(savePath)
				fs.writeFile(savePath, body, "binary", function(err) {
					if(err) {
						console.log(err);
					} else {
						if (urls.length > 0) {
							downImg(urls.shift());
							downCount++;
							console.log("剩余图片数量....");
						}
					}
				})
			})
		} else {
			// 统计重复的图片
			console.log("该图片已经存在重复.");
			reptCount++;
			if (urls.length > 0) {
				downImg(urls.shift());
			}
		}
	});
	
	if (urls.length <= 0) {
		console.log("下载完毕");
		console.log("重复图片：" + reptCount);
		console.log("实际下载：" + downCount);
	}
}

var pagemax = 2;		// 获取到多少页的内容
var startindex = 1;		// 从多少页开始获取

function start(){
	console.log("开始获取图片连接");
	getHtml(queryHref, startindex);
}

start();

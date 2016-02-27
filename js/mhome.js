$(function() {

	var init = function() {

		var width = document.body.clientWidth;
		var height = document.body.clientHeight;

		$("#page_1").css("background-size", width + "px " + height + "px");

		var logoPositon = (width - 217) / 2;
		$(".y_logo").css("left", logoPositon);
		var btnWidth = (width - 193) / 2;
		$(".y_btn").css("left", btnWidth);

		$(".y_back img").height(height);
		$(".y_back img").css("max-height", height);

		$(".s_pic img").css("height", height - 106);
		$(".s_pic img").css("max-height", height - 106);
	};
	
	$(".y_download").click(function(){
		downloadApp();
	});

	init();
});

function downloadApp() {
	var browser = {
		versions : function() {
			var u = navigator.userAgent, app = navigator.appVersion;
			return {
				trident : u.indexOf('Trident') > -1,
				presto : u.indexOf('Presto') > -1,
				webKit : u.indexOf('AppleWebKit') > -1,
				gecko : u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,
				ios : !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
				android : u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
				iPhone : u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1,
				iPad : u.indexOf('iPad') > -1,
				webApp : u.indexOf('Safari') == -1,
				QQbrw : u.indexOf('MQQBrowser') > -1,
				ucLowEnd : u.indexOf('UCWEB7.') > -1,
				ucSpecial : u.indexOf('rv:1.2.3.4') > -1,
				safari : u.indexOf('Safari') > -1 && u.indexOf("Chrome") < 1,
				chrome : u.indexOf("Chrome") > -1,
				weixinweibo : u.toLowerCase().indexOf("weibo") > -1
						|| u.toLowerCase().indexOf("micromessenger") > -1,
				weixin : u.toLowerCase().indexOf("micromessenger") > -1,
				ucweb : function() {
					try {
						return parseFloat(u.match(/ucweb\d+\.\d+/gi).toString()
								.match(/\d+\.\d+/).toString()) >= 8.2
					} catch (e) {
						if (u.indexOf('UC') > -1) {
							return true
						} else {
							return false
						}
					}
				}(),
				Symbian : u.indexOf('Symbian') > -1,
				ucSB : u.indexOf('Firefox/1.') > -1
			}
		}()
	};

	if (browser.versions.weixin) {
		location.href = "http://a.app.qq.com/o/simple.jsp?pkgname=cn.youlin.platform";

	} else {
		if (browser.versions.ios) {
			location.href = "https://itunes.apple.com/us/app/you-lin/id924870667?mt=8";
		} else if (browser.versions.android) {
			location.href = "http://a.app.qq.com/o/simple.jsp?pkgname=cn.youlin.platform";
		} else {
			location.href = "http://software.youlin.cn/654321/lastest/YL.apk";
		}
	}
}

	$(document).ready(function(){
		var windowH = $(window).height();
		var screenImgH = $("#screenImg").height();
		var topImg = screenImgH/2;

		$(".screen").css({
			'margin-top' :-topImg+"px",
			'height' : screenImgH
		});
		$("#screenImg").css({"margin-top":-topImg+"px"});
		
	});
	
	$(window).resize(function(){
		var windowH = $(window).height();
		var screenImgH = $("#screenImg").height();
		var topImg = screenImgH/2;

		$(".screen").css({
			'margin-top' : -topImg+"px",
			'height' : screenImgH
		});
		$("#screenImg").css({"margin-top":-topImg+"px"});
	});



;(function($){
	//显示缩略图
	function showSLT(target,img,opt){
		return function(){
			_showSLT(target,img,opt);
		}
	}
	//缩略图
	function _showSLT(target,img,opt){
		var bl = (img.height()/img.width()).toFixed(1)*10;
		$('<img>').attr('src',img.attr('src'))
				  .css({
				  		'position':'absolute',
				  		'width':opt.sltWidth,
				  		'height':'auto',
				  		'right':0,
				  		'bottom':0,
				  		'border':'1px solid black',
				  		'z-index':200
				  }).appendTo(target);
	}
	
	//显示控制器
	function imgControl(target,img,opt){
		return function(){
			_imgControl(target,img,opt);
		}
	}
	//控制器
	function _imgControl(target,img,opt){
		var bl = (img.height()/img.width()).toFixed(1)*10;
		var id = 'control'+new Date().getTime();
		var kibo = new Kibo();
		var html = '<input type="button" title="快捷键：ctrl + n5" value="复位" />';
			html+= '<input type="button" title="快捷键：ctrl + up" value="上" />';
			html+= '<input type="button" title="快捷键：ctrl + down" value="下" />';
			html+= '<input type="button" title="快捷键：ctrl + left" value="左" />';
			html+= '<input type="button" title="快捷键：ctrl + right" value="右" />';
			html+= '<input type="button" title="快捷键：ctrl + n0" value="旋转" />';
			html+= '<input type="button" title="快捷键：ctrl + n1" value="重置1" />';
			html+= '<input type="button" title="快捷键：ctrl + n2" value="重置2" />';
			html+= '<input type="button" title="快捷键：ctrl + n3" value="重置3" />';
			html+= '<input type="button" title="快捷键：ctrl + n4" value="重置4" />';
			html+= '<input type="button" title="快捷键：ctrl + n6" value="水平翻转" />';
			html+= '<input type="button" title="快捷键：ctrl + n8" value="垂直翻转" />';
			html+= '<input type="button" title="快捷键：ctrl + n7" value="宽适应" />';
			html+= '<input type="button" title="快捷键：ctrl + n9" value="高适应" />';
		
		$('<div>').attr('src',img.attr('src'))
				  .attr('id',id)
				  .css({
				  		'position':'absolute',
				  		'width':'100%',
				  		'height':'auto',
				  		'top':0,
				  		'left':0,
				  		'display':opt.cdisplay,
				  		'background-color':'rgba(0,0,0,0.5)',
				  		'border':'1px solid black',
				  		'z-index':100
				  }).html(html).appendTo(target);
		
		$control = $('#'+id+' input[type=button]');
		$control.eq(0).click(function(){
			//复位
			img.rotate(0);
			img.css({top:opt.itop,left:opt.ileft,width:opt.iwidth,height:opt.iheight});
		});
		$control.eq(1).click(function(){
			//向上移动一段距离
			img.css('top','-='+opt.idy+'px');
		});
		$control.eq(2).click(function(){
			//向下移动一段距离
			img.css('top','+='+opt.idy+'px');
		});
		$control.eq(3).click(function(){
			//向左移动一段距离
			img.css('left','-='+opt.idx+'px');
		});
		$control.eq(4).click(function(){
			//向右移动一段距离
			img.css('left','+='+opt.idx+'px');
		});
		$control.eq(5).click(function(){
			//旋转
			var rota = img.getRotateAngle();
			var jd = 30;
			if(rota.length>0){
				jd += rota[0];
			}
			img.rotate(jd);
		});
		$control.eq(6).click(function(){
			//复位1
			img.rotate(0);
			img.css('top','-600px');
		});
		$control.eq(7).click(function(){
			//复位2
			img.rotate(0);
			img.css('top','-1200px');
		});
		$control.eq(8).click(function(){
			//复位3
			img.rotate(0);
			img.css('top','-1800px');
		});
		$control.eq(9).click(function(){
			//复位4
			img.rotate(0);
			img.css('top','-2400px');
		});
		$control.eq(10).click(function(){
			//水平翻转
			img.css( {'filter' : 'fliph','-moz-transform': 'matrix(1, 0, 0, 1, 0, 0)','-webkit-transform': 'matrix(1, 0, 0, 1, 0, 0)'} );
		});
		$control.eq(11).click(function(){
			//垂直翻转
			img.css( {'filter' : 'flipv','-moz-transform': 'matrix(1, 0, 0, -1, 0, 0)','-webkit-transform': 'matrix(1, 0, 0, -1, 0, 0)'} );
		});
		$control.eq(12).click(function(){
			//宽适应
			img.rotate(0);
			img.css({left:'0px',width:'100%',height:'auto'});
		});
		$control.eq(13).click(function(){
			//高适应
			img.rotate(0);
			img.css({top:'0px',height:'100%',width:'auto'});
		});
		
		
		
		kibo.down('ctrl n5',function(){
			$control.eq(0).click();
		});
		kibo.down('ctrl up',function(){
			$control.eq(1).click();
		});
		kibo.down('ctrl down',function(){
			$control.eq(2).click();
		});
		kibo.down('ctrl left',function(){
			$control.eq(3).click();
		});
		kibo.down('ctrl right',function(){
			$control.eq(4).click();
		});
		kibo.down('ctrl n0',function(){
			$control.eq(5).click();
		});
		kibo.down('ctrl n1',function(){
			$control.eq(6).click();
		});
		kibo.down('ctrl n2',function(){
			$control.eq(7).click();
		});
		kibo.down('ctrl n3',function(){
			$control.eq(8).click();
		});
		kibo.down('ctrl n4',function(){
			$control.eq(9).click();
		});
		kibo.down('ctrl n6',function(){
			$control.eq(10).click();
		});
		kibo.down('ctrl n8',function(){
			$control.eq(11).click();
		});
		kibo.down('ctrl n7',function(){
			$control.eq(12).click();
		});
		kibo.down('ctrl n9',function(){
			$control.eq(13).click();
		});
	}
	
	
	
	$.fn.imgShow = function(src,options){
		var opt = $.extend({},$.imgShow.options,options);
		//对当前容器进行调整
		this.css({
			'border':'1px solid black',
			'position':'relative',
			'width':opt.cwidth,
			'height':opt.cheight,
			'margin':'0 auto',
			'text-align':'center',
			'overflow':'hidden',
			'background-color':'rgb(207, 207, 207)'
		});
		var className = 'imgshow'+new Date().getTime();
		$('<img>').attr('src',src)
				  .addClass(className)
				  .css({
				  		'position':'absolute',
				  		'width':opt.iwidth,
				  		'height':opt.iheight,
				  		'top':opt.itop,
				  		'left':opt.ileft
				  }).appendTo(this);
		var $img = $('.'+className);
		//添加移动
		$img.easydrag(opt.allowBubbling);
		//添加放大功能
		imgMouseWheel($img,opt);
		//显示缩略图
		if(opt.slt){
			setTimeout(showSLT(this,$img,opt),10);
		}
		//显示控制按钮
		if(opt.control){
			setTimeout(imgControl(this,$img,opt),10);
		}
		return $img;
	}
	//鼠标滚轮放大
	function imgMouseWheel(target,opt){
		target.bind('mousewheel', function(event, delta, deltaX, deltaY) {
		    var ofx = event.offsetX;
		    var ofy = event.offsetY;
		    var x = target.width();
		    var y = target.height();
		    var dx = ofx*(opt.dz/x);
		    var dy = dx*ofy/ofx;
		    var bl = y/x;
		    x += delta*opt.dz;
		    y = x*bl;
		    target.width(x);
		    target.height(y);
		    
		    target.css('left','+='+(-delta*dx)+'px');
		    target.css('top','+='+(-delta*dy)+'px');
		});
	}
	$.imgShow = {};
	$.imgShow.options = {
		iwidth:'100%',		//图片宽度
		iheight:'auto',		//图片高度
		itop:'0px',			//图片顶部
		ileft:'0px',		//图片左部
		idy:100,			//纵向移动增量
		idx:100,			//横向移动增量
		
		dz:40,      		//放大增量
		rota:30,			//旋转增量（单位°）
		
		slt:true,   		//显示缩略图
		sltWidth:'10%',		//缩略图宽度
		allowBubbling:false,//事件冒泡
		control:true, 		//使用控制键
		cdisplay:'block',	//显示菜单
		cwidth:800,			//容器的宽度
		cheight:600 		//容器的高度
	};
		
		
})(jQuery);
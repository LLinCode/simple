   // 当动画在画布上，最好使用requestanimationframe代替setTimeout或setInterval
	window.requestAnimFrame = ( function() {		
		return window.requestAnimationFrame ||
					window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame ||
					function( callback ) {
						window.setTimeout( callback, 1000/1 );						
					};
	})();


	var cw = $("#screenImg").width();
	var ch = $("#screenImg").height();
		
	// 设置基本变量的演示
	var canvas = document.getElementById('canvas'), ctx = canvas.getContext('2d'),		
		// 烟花集合 // 粒子集合
		fireworks = [], particles = [],
		// 存色调
		hue = 120,
		// 自动启动的烟花，每80个循环一次发射  timerTotal = 80
		timerTick = 0, timerTotal = 80;
						
		// 设置画布尺寸
		canvas.width = cw;
		canvas.height = ch;
		
		// 在某个范围内得到一个随机数
		function random( min, max ) {
			return Math.random() * ( max - min ) + min;
		}
	
		// 计算两点之间的距离
		function calculateDistance( p1x, p1y, p2x, p2y ) {
			var xDistance = p1x - p2x, yDistance = p1y - p2y;
			return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
		}
	
		// 创建烟花
		function Firework( sx, sy, tx, ty ) {
			// 实际坐标
			this.x = sx; this.y = sy;
			// 起始坐标
			this.sx = sx; this.sy = sy;
			// 目标坐标
			this.tx = tx; this.ty = ty;
			// 从起点到目标的距离
			this.distanceToTarget = calculateDistance( sx, sy, tx, ty );
			this.distanceTraveled = 0;
			
			// 跟踪过去的坐标，每一个烟花创造一个线索效应，增加坐标计数，以创造更突出的痕迹
			this.coordinates = [];
			this.coordinateCount = 1; // 3
			
			// 用当前坐标填充初始坐标集合
			while( this.coordinateCount-- ) {
				this.coordinates.push( [ this.x, this.y ] );
			}
			this.angle = Math.atan2( ty - sy, tx - sx );
			this.speed = 2; // 2
			this.acceleration = 1.03; //1.05
			this.brightness = random( 225, 225 ); //50 70
			// 圆目标指示器半径
			this.targetRadius = 0; //this.targetRadius = 1;
		}
	
		// 更新烟花firework.update
		Firework.prototype.update = function( index ) {
			// 删除坐标数组中的最后一个项目
			this.coordinates.pop();
			// 将当前坐标添加到数组的开始
			this.coordinates.unshift( [ this.x, this.y ] );			
			// 周期圆目标指示器半径
			if( this.targetRadius < 8 ) {  //8
				this.targetRadius = 0; //this.targetRadius += 0.3;
			} else {
				this.targetRadius = 0; //this.targetRadius = 1;
			}
			// speed up the firework
			this.speed *= this.acceleration;
			
			// 基于角度和速度的烟花速度
			var vx = Math.cos( this.angle ) * this.speed, vy = Math.sin( this.angle ) * this.speed;
			// 烟花用的速度会有多远？
			this.distanceTraveled = calculateDistance( this.sx, this.sy, this.x + vx, this.y + vy );
			
			// 如果距离运动，包括速度，是大于初始距离的目标，那么目标已达到
			if( this.distanceTraveled >= this.distanceToTarget ) {
				createParticles( this.tx, this.ty );
				// 删除烟花，使用索引传递到更新功能，以确定哪些要删除
				
				fireworks.splice( index, 1); //fireworks.splice( index, 1);			
			} else {
				// 目标未达到，继续行驶
				this.x += vx; this.y += vy;
			}
		}
	
		// 绘画 firework
		Firework.prototype.draw = function() {
			ctx.beginPath();
			ctx.moveTo( this.coordinates[ this.coordinates.length - 1][ 0 ], this.coordinates[ this.coordinates.length - 1][ 1 ] );
			ctx.lineTo( this.x, this.y );
			ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
			ctx.stroke();
			
			ctx.beginPath();
			// 画出这个烟火的目标
			ctx.arc( this.tx, this.ty, this.targetRadius, 0, Math.PI * 2 );
			ctx.stroke();
		}
		
		// 创建 烟花粒子
		function Particle( x, y ){
			this.x = x; this.y = y;
			// 跟踪过去的坐标，每一个粒子创建一个跟踪效果，增加坐标计数，以创建更突出的路径
			this.coordinates = [];
			this.coordinateCount = 5; //烟花粒子长度
			while( this.coordinateCount-- ) {
				this.coordinates.push( [ this.x, this.y ] );
			}
			// 在所有可能的方向设置一个任意角度、弧度
			this.angle = random( 0, Math.PI * 2 );
			this.speed = random( 1, 10 );
			// 摩擦会减缓粒子的速度
			this.friction = 0.95;
			// 重力将被应用，并将粒子拉下来
			this.gravity = 1;
			// 将色调设置为一个随机数+ - 20的整体色调变量
			this.hue = random( hue - 120, hue + 105 ); //hue - 20, hue + 20
			this.brightness = random( 50, 90); //this.brightness = random( 50, 80 );
			this.alpha = 1;
			// 设置粒子速度
			this.decay = random( 0.015, 0.03 );
		}
	
		// 更新烟花粒子
		Particle.prototype.update = function( index ) {
			this.coordinates.pop();
			this.coordinates.unshift( [ this.x, this.y ] );
			this.speed *= this.friction;
			// 应用速度
			this.x += Math.cos( this.angle ) * this.speed;
			this.y += Math.sin( this.angle ) * this.speed + this.gravity;
			// 淡出粒子
			this.alpha -= this.decay;
			
			if( this.alpha <= this.decay ) {
				particles.splice( index, 1 );
			}
		}
	
		// 绘画 particle
		Particle.prototype.draw = function() {
			ctx. beginPath();
			// 移动到集合中的最后一个跟踪坐标，然后绘制一条线到当前的X和Y
			ctx.moveTo( this.coordinates[ this.coordinates.length - 1 ][ 0 ], this.coordinates[ this.coordinates.length - 1 ][ 1 ] );
			ctx.lineTo( this.x, this.y );
			ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
			ctx.stroke();
		}
	
		// 创建粒子群/爆炸（烟花爆炸粒子数）
		function createParticles( x, y ) {
			// 增加粒子数为一个更大的爆炸
			var particleCount = 180; //particleCount = 30;
			while( particleCount-- ){
				particles.push( new Particle( x, y ) );
			}
		}
		
		function loop() {
			// 这个函数将requestanimationframe没完没了地跑
			requestAnimFrame( loop );
			
			// 增加色调，以获得不同的彩色烟花随着时间的推移
			hue += 0.5;
			ctx.globalCompositeOperation = 'destination-out';
			ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
			ctx.fillRect( 0, 0, cw, ch );
			ctx.globalCompositeOperation = 'lighter';// lighter
			// 在每一个烟花圈，画它，更新它
			var i = fireworks.length;
			while( i-- ){
				fireworks[ i ].draw();
				fireworks[ i ].update(i);
			}
			// 遍历每一个粒子，绘制它，更新它
			var i = particles.length;
			while( i-- ){
				particles[ i ].draw();
				particles[ i ].update( i );
			}
			
			// 发射烟花自动到随机坐标，发射烟花			
			if( timerTick >= timerTotal ) {
				// 设置随机烟花 随机目标坐标，随机的Y坐标将被设置在屏幕的上半部分的范围内
				fireworks.push( new Firework( cw / 2, ch, random( 0, cw ), random( 0, ch / 2 ) ) );
				timerTick = 0;				
			 }else{
				timerTick++;
			 }
		}
		
		// 一旦窗口负载，准备一些烟花！
		window.onload = loop;
		
var getitem = function(selector) {
	return document.querySelector(selector);
}

var canvas;
var ctx;

//캐릭터의 이동 좌표
var hero;
var heroti = 0;
var herox = 480;
var heroy = 500;


var highscore=0;

var score = 0;

var hero_up = false;
var hero_right = false;
var hero_down = false;
var hero_left = false;

var hp=100; // 플레이어 체력
var sound=100; // 사운드 게이지

//적
var minion = new Array();

var imgminion = new Image(); //적 이미지 삽입
imgminion.src = 'images/enemy.png';
var imghero = new Image(); //적 이미지 삽입
imghero.src = 'images/hero.png';

var imgsword = new Image();
imgsword.src = 'images/sword.png';

var stage =  new Image();
stage.src = 'images/stage.png'; //플레이어 이미지
var mx;
var my;

var shot = new Array();
var shotdir="up";
var spacefire;
var firetimer = 0;

var canvas_width = 800;
var canvas_height = 640; 

var minionregentime = 1;
var FPS = 60;
var gameplay=setInterval(function() {
		start();
		move();		
		shotmove();
		active();
}, 1000/FPS);
var regen=setInterval(function() {
		minionregen();
}, 1000/minionregentime);

function start(){ //캔버스 레이아웃 설정
	canvas = getitem('#gamescreen');
	ctx = canvas.getContext('2d');
	//hp
	ctx.fillStyle = "rgba(50,50,50,1)";
	ctx.fillRect (0, 0, 80, 640);
	//stage
	ctx.fillStyle = "rgba(200,200,200,1)";
    ctx.drawImage(stage,80,0,canvas_width,canvas_height);
    //sound
    ctx.fillStyle = "rgba(50,50,50,1)";
    ctx.fillRect (880, 0, 80, 640);
    hero = new Image(); //플레이어 이미지 삽입
	hero.src = 'images/hero.png'; //플레이어 이미지
	if(heroti>=0&&heroti<20)ctx.drawImage(imghero,0,0,60,60,herox-30,heroy-30,60,60);
	if(heroti>=20&&heroti<40)ctx.drawImage(imghero,60,0,60,60,herox-30,heroy-30,60,60);
	if(heroti>=40)ctx.drawImage(imghero,0,0,60,60,herox-30,heroy-30,60,60), heroti=0;
};

function active(){
	ctx.fillStyle = "rgba(245,0,30,1)"; //체력바
	ctx.fillRect (25,640-hp*6.4,30,hp*6.4);
	
	ctx.fillStyle = "rgba(0,30,245,1)"; //사운드바
	ctx.fillRect (905,640-sound*6.4,30,sound*6.4);
	if(sound<100)sound += 0.1;
	
	for(i=0; i<shot.length; i++){ //샷 생성
		shot[i].ti ++;
		if(shot[i].ti>=0&&shot[i].ti<5)ctx.drawImage (imgsword, 0, 0, 13, 13, shot[i].x-5, shot[i].y-5, 13, 13);
		if(shot[i].ti>=5&&shot[i].ti<10)ctx.drawImage (imgsword, 13, 0, 13, 13, shot[i].x-5, shot[i].y-5, 13, 13);
		if(shot[i].ti>=10&&shot[i].ti<15)ctx.drawImage (imgsword, 26, 0, 13, 13, shot[i].x-5, shot[i].y-5, 13, 13);
		if(shot[i].ti>=15&&shot[i].ti<20)ctx.drawImage (imgsword, 39, 0, 13, 13, shot[i].x-5, shot[i].y-5, 13, 13);
		if(shot[i].ti>=20)ctx.drawImage (imgsword, 0, 0, 13, 13, shot[i].x-5, shot[i].y-5, 13, 13), shot[i].ti=0;
	};
	for(i=0; i<minion.length; i++){
		//적이 주인공 따라오는 모션
		a = herox - minion[i].x - 30;
		b = heroy - minion[i].y - 30;
		ra = Math.abs(a);
		rb = Math.abs(b);
		minion[i].ti += 1;
		if(minion[i].ti>=0&&minion[i].ti<15){
			ctx.drawImage(imgminion,0,0,60,60,minion[i].x,minion[i].y,60,60);
		}
		if(minion[i].ti>=15&&minion[i].ti<30){
			ctx.drawImage(imgminion,60,0,60,60,minion[i].x,minion[i].y,60,60);
		}
		if(minion[i].ti>=30&&minion[i].ti<45){
			ctx.drawImage(imgminion,120,0,60,60,minion[i].x,minion[i].y,60,60);
		}
		if(minion[i].ti>=45&&minion[i].ti<60){
			ctx.drawImage(imgminion,60,0,60,60,minion[i].x,minion[i].y,60,60);
		}
		if(minion[i].ti>=60){
			minion[i].ti=0;
			ctx.drawImage(imgminion,0,0,60,60,minion[i].x,minion[i].y,60,60);
		}

		if(a>=0){
			minion[i].x += Math.cos(Math.atan(b/a));
			minion[i].y += Math.sin(Math.atan(b/a));
		}else{
			minion[i].x -= Math.cos(Math.atan(b/a));
			minion[i].y -= Math.sin(Math.atan(b/a));
		}
		//접촉시 플레이어 데미지
		ra = Math.abs(a);
		rb = Math.abs(b);
		if(ra<=60&&rb<=60){
			hp -= 0.5;
		}
		if(hp<=0){
			gameover();
		}
		//샷으로 적에게 데미지
		for(ii=0; ii<shot.length; ii++){
			sa = shot[ii].x - minion[i].x - 30;
			sb = shot[ii].y - minion[i].y - 30;
			rsa = Math.abs(sa);
			rsb = Math.abs(sb);
			if(rsa<=30&&rsb<30){
				minion[i].hp -= 100;
				shot.splice(ii,1);
			}
			if(minion[i].hp<=0){
				minion.splice(i,1);
				score += 1;
			}
		}
        
	};
	if(localStorage.hs>0){highscore = localStorage.hs;}else{localStorage.hs = 0};
	if(score >= highscore){
		highscore = score;
		localStorage.hs = highscore;
	}

	ctx.textAlign="right"; 
	ctx.font="20px Arial";
 	ctx.fillStyle = "rgba(255,255,255,1)";
	ctx.fillText(score,855,50);

	ctx.font="15px Arial";
 	ctx.fillStyle = "rgba(255,255,0,1)";
	ctx.fillText("highscore",855,15);

	ctx.font="15px Arial";
 	ctx.fillStyle = "rgba(255,255,0,1)";
	ctx.fillText(highscore,855,29);
};

function minionregen() {
	var obj = {};
	if(minion.length<8){	
		obj.x = 80 + Math.random() * 720;
		if(Math.random()>0.5){
			obj.y = -60;
		}else{
			obj.y = 700;
		}
		
		obj.hp = 100;
		obj.ti = Math.random()*300;
		minion.push(obj);
	};
};


// 누르는 순간 플레이어 방향에 따른 샷 이동
function shotmove(){ //발사 방향
	for(i=0; i<shot.length; i++){
		if(shot[i].up){
			if(shot[i].down)shot.splice(i,1);
			shot[i].y -= 4
		};
		if(shot[i].right){
			if(shot[i].left)shot.splice(i,1);
			shot[i].x += 4	
		};
		if(shot[i].down){
			if(shot[i].up)shot.splice(i,1);
			shot[i].y += 4
		};
		if(shot[i].left){
			if(shot[i].right)shot.splice(i,1)
			shot[i].x -= 4
		};
		if(shot[i].up==false&&shot[i].right==false&&shot[i].down==false&&shot[i].left==false){
			shot[i].y -= 4
		};

	};
};


// 이동 및 발사 방향 설정
window.onkeydown = function(e) { 
	if(hp<=0){
		hp=100;
		sound=100;
		herox = 480;
		heroy = 500;
		minion.splice(0,10);
		gameplay=setInterval(function() {
		start();
		move();		
		shotmove();
		active();
		}, 1000/FPS);
	}

	if(e.keyCode==32&&sound>=10)spacefire=true  //스페이스바 누르면 샷 발사

	//키를 눌렀을때 이동방향 설정
	if(e.keyCode==38)hero_up=true, shotdir="up",heroti++;;//  shotdir은 멈췄을때 발사방향
	if(e.keyCode==39)hero_right=true, shotdir="right";
	if(e.keyCode==40)hero_down=true, shotdir="down";
	if(e.keyCode==37)hero_left=true, shotdir="left";
}

window.onkeyup = function(e) { //키를 뗐을때 멈춤 설정 

	if(e.keyCode==32)spacefire=false;  //스페이스바를 떼면 샷 멈춤

	if(e.keyCode==38)hero_up=false;
	if(e.keyCode==39)hero_right=false;
	if(e.keyCode==40)hero_down=false;
	if(e.keyCode==37)hero_left=false;
	
}
function move(){ 
	//누르는 방향에 따라 이동
	if(heroy>30)if(hero_up)heroy -=3,heroti ++;;
	if(herox<849)if(hero_right)herox +=3,heroti ++;;
	if(heroy<610)if(hero_down)heroy +=3,heroti ++;;
	if(herox>111)if(hero_left)herox -=3,heroti ++;;
	
	if(spacefire){ //미사일 나감
		firetimer ++;
		if(firetimer%30==1&&sound>=10){
			sound-=10;
			shot.push( {ti:0, x:herox, y:heroy, up:shotdir=="up", right:shotdir=="right", down:shotdir=="down",  left:shotdir=="left"} );		
		}
	}else{
		firetimer = 0;
	};

};

function gameover() {
	clearInterval(gameplay);
		score = 0;
 		ctx = canvas.getContext('2d');
 		ctx.fillStyle = "rgba(0,0,0,0.5)";
 		ctx.fillRect (0, 0, 960, 640);
 		ctx.font="30px Arial";
 		ctx.fillStyle = "rgba(255,255,255,0.5)";
 		ctx.textAlign="center"; 
		ctx.fillText("GAME OVER",480,310);

};

		/*
			if(keydown.up) { //위
				if(keydown.left){ //대각선 이동 추가
    				heroy -= 3;
    				herox -= 3;
    			}else if(keydown.right) {
    				heroy -=3;
    				herox +=3;
    			}else{
    				heroy -=3;
    			}
    		}
    		else if(keydown.down) { //아래
				if(keydown.left){ //대각선 이동 추가
    				heroy += 3;
    				herox -= 3;
    			}else if(keydown.right) {
    				heroy +=3;
    				herox +=3;
    			}else{
    				heroy +=3;
    			}
    		}
		    else if(keydown.left) { //왼쪽
    			herox -= 3;
    		}
    		else if(keydown.right) { //오른쪽
    			herox += 3;
    		} jquery 이용한 무브
		*/
  		



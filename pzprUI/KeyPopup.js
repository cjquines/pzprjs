// KeyPopup.js v3.4.0
(function(){

var k = pzprv3.consts;

//---------------------------------------------------------------------------
// ★KeyPopupクラス マウスからキーボード入力する際のPopupウィンドウを管理する
//---------------------------------------------------------------------------
// キー入力用Popupウィンドウ
pzprv3.createCoreClass('KeyPopup',
{
	initialize : function(puzzle){
		this.puzzle = puzzle;

		this.paneltype = {1:0, 3:0};	// パネルのタイプ
		this.element = null;			// キーポップアップのエレメント

		this.prefix;
		this.tdcolor = "black";
		this.imgCR = [1,1];		// img表示用画像の横×縦のサイズ

		this.imgs  = [];			// resize用

		this.basetmp   = null;
		this.clearflag = false;

		// ElementTemplate
		this.node_empty = pzprv3.createEL('div');
		this.node_empty.className = 'kpcell kpcellempty';
		pzprv3.unselectable(this.node_empty);
		
		this.node_div = pzprv3.createEL('div');
		this.node_div.className = 'kpcell kpcellvalid';
		pzprv3.unselectable(this.node_div);
		
		this.node_num = pzprv3.createEL('span');
		this.node_num.className = 'kpnum';
		pzprv3.unselectable(this.node_num);
		
		this.node_img = pzprv3.createEL('img');
		this.node_img.className = 'kpimg';
		pzprv3.unselectable(this.node_img);
	},

	type : {
		slither    : [3,0],
		nawabari   : [4,0],
		fourcells  : [4,0],
		fivecells  : [4,0],
		fillmat    : [4,0],
		paintarea  : [4,0],
		lightup    : [4,0],
		shakashaka : [4,0],
		gokigen    : [4,0],
		wagiri     : [4,0],
		shugaku    : [4,0],
		creek      : [4,0],
		ichimaga   : [4,0],
		ichimagam  : [4,0],
		ichimagax  : [4,0],
		sukoro     : [4,4],
		sukororoom : [4,4],
		lookair    : [5,0],
		tawa       : [6,0],
		hashikake  : [8,0],
		amibo      : [10,0],
		bag        : [10,0],
		bdblock    : [10,0],
		country    : [10,0],
		usotatami  : [10,0],
		heyawake   : [10,0],
		ayeheya    : [10,0],
		kurodoko   : [10,0],
		nagenawa   : [10,0],
		ringring   : [10,0],
		numlin     : [10,0],
		nurikabe   : [10,0],
		nuribou    : [10,0],
		mochikoro  : [10,0],
		mochinyoro : [10,0],
		shikaku    : [10,0],
		aho        : [10,0],
		shimaguni  : [10,0],
		chocona    : [10,0],
		yajitatami : [10,0],
		tasquare   : [10,0],
		kurotto    : [10,0],
		bonsan     : [10,0],
		heyabon    : [10,0],
		yosenabe   : [10,0],
		firefly    : [10,0],
		tateyoko   : [10,0],
		factors    : [10,10],
		fillomino  : [10,10],
		renban     : [10,10],
		ripple     : [10,10],
		cojun      : [10,10],
		sudoku     : [10,10],
		nanro      : [10,10],
		view       : [10,10],
		kakuru     : [10,10],
		tilepaint  : [51,0],
		triplace   : [51,0],
		kakuro     : [51,10],
		
		slalom     : [101,0],
		reflect    : [102,0],
		pipelink   : [111,0],
		pipelinkr  : [111,0],
		loopsp     : [111,0],
		tatamibari : [112,0],
		hakoiri    : [113,0],
		husabi     : [114,0]
	},

	//---------------------------------------------------------------------------
	// kp.display()     キーポップアップを表示する
	//---------------------------------------------------------------------------
	display : function(){
		var mode = this.puzzle.getConfig('mode');
		if(this.element && !!this.paneltype[mode] && this.puzzle.getConfig('keypopup')){

			this.element.style.display = 'block';

			pzprv3.getEL('panelbase1').style.display = (mode==1?'block':'none');
			pzprv3.getEL('panelbase3').style.display = (mode==3?'block':'none');
		}
		else if(!!this.element){
			this.element.style.display = 'none';
		}
	},

	//---------------------------------------------------------------------------
	// kp.create()      キーポップアップを生成して初期化する
	// kp.createtable() キーポップアップのポップアップを作成する
	//---------------------------------------------------------------------------
	create : function(){
		var type = this.type[this.puzzle.pid];
		if(!type){ type=[0,0];}
		
		this.paneltype = { 1:(pzprv3.EDITOR?type[0]:0), 3:(type[1])};
		if(!this.paneltype[1] && !this.paneltype[3]){ return;}
		
		this.element = this.makeKeyPopup();
		
		if(this.paneltype[1]!==0){ this.createtable(1);}
		if(this.paneltype[3]!==0){ this.createtable(3);}
		
		this.resizepanel();
	},
	createtable : function(mode,type){
		this.prefix = ['kp',mode,'_'].join('');

		this.basetmp = pzprv3.getEL('panelbase'+mode);
		this.basetmp.innerHTML = '';

		this.generate(mode);
	},

	//---------------------------------------------------------------------------
	// kp.makeKeyPopup() キーポップアップのパネルを作成する
	//---------------------------------------------------------------------------
	makeKeyPopup : function(){
		var keypopup, bar, _doc = document, puzzle = this.puzzle;
		var rect = pzprv3.getRect(pzprv3.getEL('divques'));
		
		keypopup = _doc.createElement('div');
		keypopup.className = 'popup';
		keypopup.id = 'keypopup';
		keypopup.style.left   = (rect.left+48)+'px';
		keypopup.style.top    = (rect.top +48)+'px';
		keypopup.style.zIndex = 100;
		pzprv3.getEL("popup_parent").appendChild(keypopup);
		
		bar = _doc.createElement('div');
		bar.className = 'titlebar';
		bar.id = 'barkeypopup';
		bar.appendChild(_doc.createTextNode("panel"));
		pzprv3.unselectable(bar);
		keypopup.appendChild(bar);
		pzprv3.event.addMouseDownEvent(bar, pzprv3.ui.popupmgr, pzprv3.ui.popupmgr.titlebardown);
		pzprv3.event.addEvent(bar, 'dblclick', puzzle, function(){ puzzle.setConfig('keypopup',false)});
		
		var panel = _doc.createElement('div');
		panel.className = 'panelbase';
		panel.id = 'panelbase1';
		keypopup.appendChild(panel);
		
		panel = _doc.createElement('div');
		panel.className = 'panelbase';
		panel.id = 'panelbase3';
		keypopup.appendChild(panel);
		
		return keypopup;
	},

	//---------------------------------------------------------------------------
	// kp.generate()    キーポップアップのテーブルを作成する
	// kp.gentable4()   キーポップアップの0～4を入力できるテーブルを作成する
	// kp.gentable10()  キーポップアップの0～9を入力できるテーブルを作成する
	// kp.gentable51()  キーポップアップの[＼],0～9を入力できるテーブルを作成する
	//---------------------------------------------------------------------------
	generate : function(mode){
		var type = this.paneltype[mode];
		if     (type===4) { this.gentable4 (mode);}
		else if(type===10){ this.gentable10(mode);}
		else if(type===51){ this.gentable51(mode);}

		else if(type===3) { this.gentable3(mode);}
		else if(type===5) { this.gentable5(mode);}
		else if(type===6) { this.gentable6(mode);}
		else if(type===8) { this.gentable8(mode);}

		else if(type===101){ this.generate_slalom(mode);}
		else if(type===102){ this.generate_reflect(mode);}
		else if(type===111){ this.generate_pipelink(mode);}
		else if(type===112){ this.generate_tatamibari(mode);}
		else if(type===113){ this.generate_hakoiri(mode);}
		else if(type===114){ this.generate_kusabi(mode);}
	},
	gentable4 : function(mode){
		var pid=this.puzzle.pid;
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.insertrow();
		if((mode==3)&&(pid==='sukoro'||pid==='sukororoom')){
			this.tdcolor = this.puzzle.painter.mbcolor;
			this.inputcol('num','knumq','q','○');
			this.inputcol('num','knumw','w','×');
			this.tdcolor = "black";
			this.inputcol('num','knum_',' ',' ');
			this.inputcol('empty','','','');
		}
		else{
			this.inputcol('num','knum0','0','0');
			this.inputcol('empty','','','');
			this.inputcol('num','knum_',' ',' ');
			if(!this.puzzle.painter.hideHatena){
				this.inputcol('num','knum.','-','?');
			}
			else{
				var cap = '?';
				switch(pid){
					case 'lightup': case 'shakashaka':                           cap='■'; break;
					case 'gokigen': case 'wagiri': case 'shugaku': case 'creek': cap='○'; break;
				}
				this.inputcol('num','knum.','-',cap);
			}
		}
		this.insertrow();
	},
	gentable10 : function(mode){
		var pid = this.puzzle.pid;
		if((mode==3)&&(this.puzzle.classes.Cell.prototype.numberWithMB)){
			this.tdcolor = this.puzzle.painter.mbcolor;
			this.inputcol('num','knumq','q','○');
			this.inputcol('num','knumw','w','×');
			this.tdcolor = "black";
			this.inputcol('num','knum_',' ',' ');
			this.inputcol('empty','','','');
			this.insertrow();
		}
		if((mode==1)&&(pid==='kakuru'||pid==='tateyoko')){
			this.inputcol('num','knumq1','q1','■');
			this.inputcol('num','knumq2','q2','□');
			this.inputcol('num','knum_',' ',' ');
			this.inputcol('num','knum.','-','?');
			this.insertrow();
		}
		
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.insertrow();
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.insertrow();
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		if(!((mode==3)&&(this.puzzle.classes.Cell.prototype.numberWithMB))){
			this.inputcol('num','knum_',' ',' ');
		}
		else{
			this.inputcol('empty','','','');
		}
		if((mode===3)||(pid==='kakuru'||pid==='tateyoko')){
			this.inputcol('empty','','','');
		}
		else if(!this.puzzle.painter.hideHatena){
			this.inputcol('num','knum.','-','?');
		}
		else if(pid==='tasquare'){
			this.inputcol('num','knum.','-','□');
		}
		else if(pid==='kurotto'||pid==='bonsan'||pid==='heyabon'||pid==='yosenabe'){
			this.inputcol('num','knum.','-','○');
		}
		this.insertrow();
	},
	gentable51 : function(mode){
		this.inputcol('image','knumq','q',[0,0]);
		this.inputcol('num','knum_',' ',' ');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.insertrow();
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.insertrow();
		this.inputcol('num','knum7','7','7');
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum0','0','0');
		this.insertrow();
	},

	//---------------------------------------------------------------------------
	// kp.gentable3()  キーポップアップの0～4を入力できるテーブルを作成する
	// kp.gentable5()  キーポップアップの0～5を入力できるテーブルを作成する
	// kp.gentable6()  キーポップアップの0～6を入力できるテーブルを作成する
	// kp.gentable8()  キーポップアップの0～8を入力できるテーブルを作成する
	//---------------------------------------------------------------------------
	gentable3 : function(mode){
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.insertrow();
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum_',' ',' ');
		this.inputcol('num','knum.','-','?');
		this.insertrow();
	},
	gentable5: function(mode){
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.insertrow();
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.inputcol('empty','','','');
		this.insertrow();
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum_',' ',' ');
		this.inputcol('num','knum.','-','?');
		this.insertrow();
	},
	gentable6 : function(mode){
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.insertrow();
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.insertrow();
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum_',' ',' ');
		this.inputcol('num','knum.','-','?');
		this.insertrow();
	},
	gentable8 : function(mode){
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.insertrow();
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.inputcol('num','knum8','8','8');
		this.insertrow();
		this.inputcol('num','knum_',' ',' ');
		this.inputcol('num','knum.','-','○');
		this.insertrow();
	},

	//---------------------------------------------------------------------------
	// kp.generate_slalom()     スラローム用のテーブルを作成する
	// kp.generate_reflect()    リフレクトリンク用のテーブルを作成する
	//---------------------------------------------------------------------------
	generate_slalom : function(mode){
		this.imgCR = [4,1];
		this.inputcol('image','knumq','q',[0,0]);
		this.inputcol('image','knums','s',[1,0]);
		this.inputcol('image','knumw','w',[2,0]);
		this.inputcol('image','knume','e',[3,0]);
		this.inputcol('num','knumr','r',' ');
		this.insertrow();
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.insertrow();
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum0','0','0');
		this.insertrow();
		this.inputcol('num','knum.','-','-');
		this.inputcol('num','knum_',' ',' ');
		this.insertrow();
	},
	generate_reflect : function(mode){
		this.imgCR = [4,1];
		this.inputcol('image','knumq','q',[0,0]);
		this.inputcol('image','knumw','w',[1,0]);
		this.inputcol('image','knume','e',[2,0]);
		this.inputcol('image','knumr','r',[3,0]);
		this.inputcol('num','knumt','t','╋');
		this.inputcol('num','knumy','y',' ');
		this.insertrow();
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.insertrow();
		this.inputcol('num','knum7','7','7');
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum.','-','-');
		this.insertrow();
	},

	//---------------------------------------------------------------------------
	// kp.generate_pipelink()   パイプリンク、帰ってきたパイプリンク、環状線スペシャル用のテーブルを作成する
	// kp.generate_tatamibari() タタミバリ用のテーブルを作成する
	// kp.generate_hakoiri()    はこいり○△□用のテーブルを作成する
	// kp.generate_kusabi()     クサビリンク用のテーブルを作成する
	//---------------------------------------------------------------------------
	generate_pipelink : function(mode){
		var pid = this.puzzle.pid;
		this.inputcol('num','knumq','q','╋');
		this.inputcol('num','knumw','w','┃');
		this.inputcol('num','knume','e','━');
		this.inputcol('num','knumr','r',' ');
		if     (pid==='pipelink') { this.inputcol('empty','','','');}
		else if(pid==='pipelinkr'){ this.inputcol('num','knum.','1','○');}
		else if(pid==='loopsp')   { this.inputcol('num','knum.','-','○');}
		this.insertrow();
		this.inputcol('num','knuma','a','┗');
		this.inputcol('num','knums','s','┛');
		this.inputcol('num','knumd','d','┓');
		this.inputcol('num','knumf','f','┏');
		if(pid!=='loopsp'){ this.inputcol('num','knum_','-','?');}
		this.insertrow();
		
		if(pid==='loopsp'){
			this.inputcol('num','knum1','1','1');
			this.inputcol('num','knum2','2','2');
			this.inputcol('num','knum3','3','3');
			this.inputcol('num','knum4','4','4');
			this.inputcol('num','knum5','5','5');
			this.insertrow();
			this.inputcol('num','knum6','6','6');
			this.inputcol('num','knum7','7','7');
			this.inputcol('num','knum8','8','8');
			this.inputcol('num','knum9','9','9');
			this.inputcol('num','knum0','0','0');
			this.insertrow();
		}
	},
	generate_tatamibari : function(mode){
		this.inputcol('num','knumq','q','╋');
		this.inputcol('num','knumw','w','┃');
		this.inputcol('num','knume','e','━');
		this.insertrow();
		this.inputcol('num','knumr','r',' ');
		this.inputcol('num','knum.','-','?');
		this.inputcol('empty','','','');
		this.insertrow();
	},
	generate_hakoiri : function(mode){
		if(mode==3){ this.tdcolor = this.puzzle.painter.fontAnscolor;}
		this.inputcol('num','knum1','1','○');
		this.inputcol('num','knum2','2','△');
		this.inputcol('num','knum3','3','□');
		this.insertrow();
		if(mode==3){ this.tdcolor = "rgb(255, 96, 191)";}
		this.inputcol('num','knum4','4',(mode===1 ? '?' : '・'));
		if(mode==3){ this.tdcolor = "black";}
		this.inputcol('num','knum_',' ',' ');
		this.inputcol('empty','','','');
		this.insertrow();
	},
	generate_kusabi : function(mode){
		this.inputcol('num','knum1','1','同');
		this.inputcol('num','knum2','2','短');
		this.inputcol('num','knum3','3','長');
		this.insertrow();
		this.inputcol('num','knum.','-','○');
		this.inputcol('num','knum_',' ',' ');
		this.inputcol('empty','','','');
		this.insertrow();
	},

	//---------------------------------------------------------------------------
	// kp.inputcol()  テーブルのセルを追加する
	// kp.insertrow() テーブルの行を追加する
	//---------------------------------------------------------------------------
	inputcol : function(type, id, ca, disp){
		var _div = null, _child = null, self = this;
		if(type!=='empty'){
			_div = this.node_div.cloneNode(false);
			_div.id = this.prefix+id;
			_div.onclick = function(){ self.puzzle.key.keyinput(ca);};
		}
		else{ _div = this.node_empty.cloneNode(false);}

		if(type==='num'){
			_child = this.node_num.cloneNode(false);
			_child.id = this.prefix+id+"_s";
			_child.style.color = this.tdcolor;
			_child.innerHTML   = disp;
		}
		else if(type==='image'){
			_child = this.node_img.cloneNode(false);
			_child.id = this.prefix+id+"_i";
			_child.src = "./src/img/"+this.puzzle.pid+"_kp.gif";
			this.imgs.push({'el':_child, 'x':disp[0], 'y':disp[1]});
		}

		if(this.clearflag){ _div.style.clear='both'; this.clearflag=false;}
		if(!!_child){ _div.appendChild(_child);}
		this.basetmp.appendChild(_div);
	},
	insertrow : function(){
		this.clearflag = true;
	},

	//---------------------------------------------------------------------------
	// kp.resizepanel() キーポップアップのセルのサイズを変更する
	//---------------------------------------------------------------------------
	resizepanel : function(){
		var cellsize = Math.min(this.puzzle.painter.cw, 120);
		if(cellsize<20){ cellsize=20;}

		var dsize = (cellsize*0.90)|0, tsize = (cellsize*0.70)|0;
		for(var i=0,len=this.imgs.length;i<len;i++){
			var obj = this.imgs[i], img=obj.el;
			img.style.width  = ""+(dsize*this.imgCR[0])+"px";
			img.style.height = ""+(dsize*this.imgCR[1])+"px";
			img.style.clip   = "rect("+(dsize*obj.y+1)+"px,"+(dsize*(obj.x+1))+"px,"+(dsize*(obj.y+1))+"px,"+(dsize*obj.x+1)+"px)";
			img.style.top    = "-"+(obj.y*dsize)+"px";
			img.style.left   = "-"+(obj.x*dsize)+"px";
		}

		pzprv3.ui.modifyCSS({
			"div.kpcell" : { width:(""+dsize+"px"), height:(""+dsize+"px"), lineHeight:(""+dsize+"px")},
			"span.kpnum" : { fontSize:(""+tsize+"px")}
		});
	}
});

})();

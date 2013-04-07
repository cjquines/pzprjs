// Main.js v3.4.0

//---------------------------------------------------------------------------
// ★Ownerクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

// Ownerクラス
pzprv3.createCoreClass('Owner',
{
	initialize : function(){
		this.pid     = '';			// パズルのID("creek"など)
		this.canvas  = null;		// 描画canvas本体
		this.canvas2 = null;		// 補助canvas
		this.classes = null;

		this.ready = false;

		this.editmode = (pzprv3.EDITOR && !pzprv3.debugmode);	// 問題配置モード
		this.playmode = !this.editmode;							// 回答モード

		this.starttime = 0;
		this.resetTime();
	},

	//---------------------------------------------------------------------------
	// owner.openByURL()      URLを入力して盤面を開く
	// owner.openByFileData() ファイルデータを入力して盤面を開く
	//---------------------------------------------------------------------------
	openByURL : function(url){
		var pzl = pzprv3.parseURLType(url);
		if(!!pzl.id){ this.open(pzl);}
	},
	openByFileData : function(filedata){
		var farray = filedata.split(/[\t\r\n\/]+/), fstr = "";
		for(var i=0;i<farray.length;i++){
			if(farray[i].match(/^http\:\/\//)){ break;}
			fstr += (farray[i]+"/");
		}
		var pid = (farray[0].match(/^pzprv3/) ? farray[1] : this.targetpuzzle.pid);
		this.open({id:pid, fstr:fstr});
	},

	//---------------------------------------------------------------------------
	// owner.open()      新しくパズルのファイルを開く時の処理
	//---------------------------------------------------------------------------
	open : function(pzl){
		var self = this;

		this.ready = false;

		/* canvasが用意できるまでwait */
		if(!this.canvas || !this.canvas2){
			setTimeout(function(){ self.open.call(self,pzl);},10);
			return;
		}

		/* 今のパズルと別idの時 */
		if(this.pid != pzl.id){
			if(!!this.pid){ ui.clearObjects();}
			this.pid = pzl.id;
			this.classes = null;
			pzprv3.includeCustomFile(this.pid);
		}
		/* Classが用意できるまで待つ */
		if(!pzprv3.custom[this.pid]){
			setTimeout(function(){ self.open.call(self,pzl);},10);
			return;
		}

		if(!this.classes){
			/* クラスなどを初期化 */
			this.classes = pzprv3.custom[this.pid];
			this.initObjects();
		}

		// ファイルを開く・複製されたデータを開く
		if(!!pzl.fstr){
			this.fio.filedecode(pzl.fstr);
		}
		// URLからパズルのデータを読み出す
		else if(!!pzl.qdata){
			this.enc.pzlinput(pzl);
		}
		// 何もないとき
		else{
			this.board.initBoardSize();
		}

		this.resetTime();

		this.ready = true;
	},

	//---------------------------------------------------------------------------
	// owner.initObjects()   各オブジェクトの生成などの処理
	//---------------------------------------------------------------------------
	initObjects : function(){
		// クラス初期化
		this.board   = this.newInstance('Board');		// 盤面オブジェクト
		this.checker = this.newInstance('AnsCheck');	// 正解判定オブジェクト
		this.painter = this.newInstance('Graphic');		// 描画系オブジェクト

		this.cursor = this.newInstance('TargetCursor');	// 入力用カーソルオブジェクト
		this.mouse  = this.newInstance('MouseEvent');	// マウス入力オブジェクト
		this.key    = this.newInstance('KeyEvent');		// キーボード入力オブジェクト

		this.opemgr = this.newInstance('OperationManager');	// 操作情報管理オブジェクト

		this.enc = this.newInstance('Encode');		// URL入出力用オブジェクト
		this.fio = this.newInstance('FileIO');		// ファイル入出力用オブジェクト

		this.config = this.newInstance('Properties');	// パズルの設定値を保持するオブジェクト

		// 盤面保持用データ生成処理
		this.board.initialize2();
	},

	//---------------------------------------------------------------------------
	// owner.newInstance()    新しいオブジェクトを生成する
	//---------------------------------------------------------------------------
	newInstance : function(classname, args){
		return (new this.classes[classname](this, args));
	},

	//---------------------------------------------------------------------------
	// owner.resetTime()      開始時間をリセットする
	// owner.getTime()        開始からの時間をミリ秒単位で取得する
	//---------------------------------------------------------------------------
	resetTime : function(){
		this.starttime = pzprv3.currentTime();
	},
	getTime : function(){
		return (pzprv3.currentTime() - this.starttime);
	},

	//---------------------------------------------------------------------------
	getConfig : function(idname){ return this.config.getVal(idname);},
	setConfig : function(idname,val){ return this.config.setVal(idname,val,true);},
	setConfigOnly : function(idname,val){ return this.config.setVal(idname,val,false);},
	
	isDispred : function(){
		if     (this.config.flag_redline  && this.config.getVal('redline')) { return true;}
		else if(this.config.flag_redblk   && this.config.getVal('redblk'))  { return true;}
		else if(this.config.flag_redblkrb && this.config.getVal('redblkrb')){ return true;}
		else if(this.pid==='roma'         && this.config.getVal('redroad')) { return true;}
		return false;
	}
});

//--------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------
// ★Propertiesクラス 設定値の値などを保持する
//---------------------------------------------------------------------------
pzprv3.createCommonClass('Properties',
{
	initialize : function(){
		this.init();
	},

	/* フラグ */
	flag_use      : false,
	flag_redline  : false,
	flag_redblk   : false,
	flag_redblkrb : false,
	flag_bgcolor  : false,
	flag_irowake : 0,			// 0:色分け設定無し 1:色分けしない 2:色分けする

	disable_subclear : false,	// "補助消去"ボタンを作らない

	/* 設定値 */
	val : {},

	//---------------------------------------------------------------------------
	// config.init()  各設定値を初期化する
	//---------------------------------------------------------------------------
	init : function(){
		/* 全般的な設定 */
		this.add('mode', (puzzle.editmode?1:3), [1,3]);			/* モード */
		this.add('autocheck', puzzle.playmode);					/* 正解自動判定機能 */
		this.add('language', 'ja', ['ja','en']);				/* 言語設定 */

		/* 表示形式設定 */
		this.add('adjsize', true);								/* 自動横幅調節 */
		this.add('size', 2, [0,1,2,3,4]);						/* 表示サイズ */
		this.add('text', (!pzprv3.OS.mobile?0:2), [0,1,2,3]);	/* テキストのサイズ */

		this.add('cursor', true);								/* カーソルの表示 */
		this.add('irowake', (this.flag_irowake===2));			/* 線の色分け */

		this.add('disptype_pipelinkr', 1, [1,2]);				/* pipelinkr: 表示形式 */
		this.add('disptype_bosanowa', 1, [1,2,3]);				/* bosanowa: 表示形式 */

		/* 入力方法設定 */
		this.add('use', (!pzprv3.env.touchevent?1:2), [1,2]);	/* 黒マスの入力方法 */
		this.add('use_tri', 1, [1,2,3]);						/* shakashaka: 三角形の入力方法 */

		this.add('lrcheck', false);			/* マウス左右反転 */
		this.add('keypopup', false);		/* 数字などのパネル入力 */

		this.add('bgcolor', false);			/* 背景色入力 */
		this.add('enline', true);			/* kouchoku: 線は点の間のみ引ける */
		this.add('lattice', true);			/* kouchoku: 格子点チェック */

		/* 補助入力設定 */
		this.add('redline', false);			/* 自動横幅調節 */
		this.add('redblk', false);			/* 黒マスつながりチェック */
		this.add('redblkbd', false);		/* 連黒分断禁黒マス繋がりチェック */
		this.add('redroad', false);			/* roma: ローマの通り道チェック */

		/* 回答お助け機能 */
		this.add('circolor', false);		/* 数字 or kouchokuの正解の点をグレーにする */
		this.add('plred', false);			/* hitori:ひとくれの重複した数字を表示 */
		this.add('colorslash', false);		/* wagiri: 斜線の色分け */

		/* 正解判定 */
		this.add('enbnonum', false);		/* fillomino: 数字がすべて入っていなくても正解とする */

		this.add('uramashu', false);		/* mashu: 裏ましゅ */
		this.add('snakebd', false);			/* snakes: へびの境界線を表示する */

		/* EDITORのみ */
		this.add('bdpadding', true);		/* goishi: URL出力で1マス余裕を持って出力する */
		this.add('discolor', false);		/* tentaisho: 色分け無効化 */
	},
	add : function(name, defvalue, option){
		if(!option){ this.val[name] = {val:defvalue};}
		else{ this.val[name] = {val:defvalue, option:option};}
	},

	//---------------------------------------------------------------------------
	// config.getVal()  各フラグのvalの値を返す
	// config.setVal()  各フラグの設定値を設定する
	//---------------------------------------------------------------------------
	getVal : function(name){
		return this.val[name]?this.val[name].val:null;
	},
	setVal : function(name, newval, isexecfunc){
		if(!!this.val[name]){
			this.val[name].val = newval;
			ui.menu.setcaption(name);
		}
	}
});

// Piece.js v3.4.1

pzpr.addConsts({
	// const値
	NDIR : 0,	// 方向なし
	UP   : 1,	// up
	DN   : 2,	// down
	LT   : 3,	// left
	RT   : 4	// right
});

pzpr.classmgr.makeCommon({
//---------------------------------------------------------------------------
// ★BoardPieceクラス Cell, Cross, Border, EXCellクラスのベース
//---------------------------------------------------------------------------
BoardPiece:{
	bx : -1,	// X座標(border座標系)を保持する
	by : -1,	// Y座標(border座標系)を保持する

	group  : 'none',
	id     : null,
	isnull : true,

	iscell   : false,
	iscross  : false,
	isborder : false,
	isexcell : false,

	// デフォルト値
	/* 問題データを保持するプロパティ */
	ques  : 0,	// cell  :(1:黒マス 2-5:三角形 6:アイス・なべ等 7:盤面外 11-17:十字型パーツ 21-22:旗門 51:カックロ)
				// cross :(交点の黒点)
				// border:(問題の境界線)
	qdir  : 0,	// cell  :(数字につく矢印の向き)
				// border:(アイスバーンの矢印/マイナリズムの不等号)
	qnum  :-1,	// cell  :(セルの数字/○△□/マカロ以外の単体矢印/白丸黒丸/カックロの右側)
				// cross :(交点の数字)
				// border:(マイナリズムの数字/天体ショーの星)
	qnum2 :-1,	// cell  :(カックロの下側/よせなべの丸無し数字)
	qchar : 0,	// excell:キンコンカンの文字

	/* 回答データを保持するプロパティ */
	qans  : 0,	// cell  :(1:黒マス/あかり 2-5:三角形 11-13:棒 31-32:斜線 41-50:ふとん)
				// border:(回答の境界線)
	anum  :-1,	// cell  :(セルの数字/○△□/単体矢印)
	line  : 0,	// border:(ましゅやスリリンなどの線)

	/* 補助データを保持するプロパティ */
	qsub  : 0,	// cell  :(1:白マス 1-2:背景色/○× 3:絵になる部分)
				// border:(1:補助線 2:×)
	qcmp : 0,	// cell  :

	/* 履歴保存しないプロパティ */
	color : "",	// 色分けデータを保持する
	error : 0,
	qinfo : 0,

	propques : ['ques', 'qdir', 'qnum', 'qnum2', 'qchar'],
	propans  : ['qans', 'anum', 'line', 'color'],
	propsub  : ['qsub', 'qcmp'],
	propinfo : ['error', 'qinfo'],
	propnorec : { color:1, error:1, qinfo:1 },

	// 入力できる最大・最小の数字
	maxnum : 255,
	minnum : 1,

	//---------------------------------------------------------------------------
	// getaddr() 自分の盤面中での位置を返す
	// relcell(), relcross(), relbd(), relexcell() 相対位置に存在するオブジェクトを返す
	//---------------------------------------------------------------------------
	getaddr : function(){ return (new this.owner.Address(this.bx, this.by));},

	relcell   : function(dx,dy){ return this.owner.board.getc(this.bx+dx,this.by+dy);},
	relcross  : function(dx,dy){ return this.owner.board.getx(this.bx+dx,this.by+dy);},
	relbd     : function(dx,dy){ return this.owner.board.getb(this.bx+dx,this.by+dy);},
	relexcell : function(dx,dy){ return this.owner.board.getex(this.bx+dx,this.by+dy);},
	
	//---------------------------------------------------------------------------
	// ub() db() lb() rb()  セルや交点の上下左右にある境界線のIDを返す
	//---------------------------------------------------------------------------
	ub : function(){ return this.owner.board.getb(this.bx,this.by-1);},
	db : function(){ return this.owner.board.getb(this.bx,this.by+1);},
	lb : function(){ return this.owner.board.getb(this.bx-1,this.by);},
	rb : function(){ return this.owner.board.getb(this.bx+1,this.by);},

	//---------------------------------------------------------------------------
	// オブジェクト設定値のgetter/setter
	//---------------------------------------------------------------------------
	getQues : function(){ return this.ques;},
	setQues : function(val){ this.setdata('ques', val);},

	getQans : function(){ return this.qans;},
	setQans : function(val){ this.setdata('qans', val);},

	getQdir : function(){ return this.qdir;},
	setQdir : function(val){ this.setdata('qdir', val);},

	getQnum : function(){ return this.qnum;},
	setQnum : function(val){ this.setdata('qnum', val);},

	getQnum2 : function(){ return this.qnum2;},
	setQnum2 : function(val){ this.setdata('qnum2', val);},

	getQchar : function(){ return this.qchar;},
	setQchar : function(val){ this.setdata('qchar', val);},

	getAnum : function(){ return this.anum;},
	setAnum : function(val){ this.setdata('anum', val);},

	getLineVal : function(){ return this.line;},
	setLineVal : function(val){ this.setdata('line', val);},

	getQsub : function(){ return this.qsub;},
	setQsub : function(val){ this.setdata('qsub', val);},

	getQcmp : function(){ return this.qcmp;},
	setQcmp : function(val){ this.setdata('qcmp', val);},

	//---------------------------------------------------------------------------
	// setdata() Cell,Cross,Border,EXCellの値を設定する
	//---------------------------------------------------------------------------
	setdata : function(prop, num){
		if(!!this.prehook[prop]){ if(this.prehook[prop].call(this,num)){ return;}}

		this.owner.opemgr.addOpe_Object(this, prop, this[prop], num);
		this[prop] = num;

		if(!!this.posthook[prop]){ this.posthook[prop].call(this,num);}
	},
	
	//---------------------------------------------------------------------------
	// nummaxfunc() 入力できる数字の最大値を返す
	// numminfunc() 入力できる数字の最小値を返す
	//---------------------------------------------------------------------------
	nummaxfunc : function(){ return this.maxnum;},
	numminfunc : function(){ return this.minnum;},

	//---------------------------------------------------------------------------
	// prehook  値の設定前にやっておく処理や、設定禁止処理を行う
	// posthook 値の設定後にやっておく処理を行う
	//---------------------------------------------------------------------------
	prehook  : {},
	posthook : {},

	//---------------------------------------------------------------------------
	// draw()   盤面に自分の周囲を描画する
	//---------------------------------------------------------------------------
	draw : function(){ this.getaddr().draw();},

	//---------------------------------------------------------------------------
	// seterr()  error値を設定する
	// setinfo() qinfo値を設定する
	//---------------------------------------------------------------------------
	seterr : function(num){
		if(this.owner.board.isenableSetError()){ this.error = num;}
	},
	setinfo : function(num){ this.qinfo = num;}
},

//---------------------------------------------------------------------------
// ★Cellクラス BoardクラスがCellの数だけ保持する
//---------------------------------------------------------------------------
// ボードメンバデータの定義(1)
// Cellクラスの定義
'Cell:BoardPiece':{
	group : 'cell',

	iscell : true,

	base : null,	// 丸数字やアルファベットが移動してきた場合の移動元のセルを示す (移動なし時は自分自身を指す)
	
	disInputHatena : false,	// qnum==-2を入力できないようにする
	
	numberWithMB   : false,	// 回答の数字と○×が入るパズル(○は数字が入っている扱いされる)
	numberAsObject : false,	// 数字以外でqnum/anumを使用する(同じ値を入力で消去できたり、回答で・が入力できる)
	
	numberIsWhite  : false,	// 数字のあるマスが黒マスにならないパズル
	
	//---------------------------------------------------------------------------
	// cell.up() dn() lt() rt()  セルの上下左右に接するセルのIDを返す
	//---------------------------------------------------------------------------
	up : function(){ return this.owner.board.getc(this.bx,this.by-2);},
	dn : function(){ return this.owner.board.getc(this.bx,this.by+2);},
	lt : function(){ return this.owner.board.getc(this.bx-2,this.by);},
	rt : function(){ return this.owner.board.getc(this.bx+2,this.by);},

	//---------------------------------------------------------------------------
	// prehook  値の設定前にやっておく処理や、設定禁止処理を行う
	// posthook 値の設定後にやっておく処理を行う
	//---------------------------------------------------------------------------
	prehook : {
		ques  : function(num){ if(this.owner.Border.prototype.enableLineCombined){ this.setCombinedLine(num);} return false;},
		qnum  : function(num){ return (this.minnum>0 && num===0);},
		qnum2 : function(num){ return (this.minnum>0 && num===0);},
		anum  : function(num){ return (this.minnum>0 && num===0);}
	},
	posthook : {
		ques  : function(num){ this.owner.board.setInfoByCell(this);},
		qnum  : function(num){ this.owner.board.setInfoByCell(this);},
		qnum2 : function(num){ this.owner.board.setInfoByCell(this);},
		anum  : function(num){ this.owner.board.setInfoByCell(this);},
		qans  : function(num){ this.owner.board.setInfoByCell(this);},
		qsub  : function(num){ if(this.numberWithMB){ this.owner.board.setInfoByCell(this);}} /* numberWithMBの○を文字扱い */
	},

	//---------------------------------------------------------------------------
	// cell.lcnt()       セルに存在する線の本数を返す
	// cell.iscrossing() 指定されたセル/交点で線が交差する場合にtrueを返す
	//---------------------------------------------------------------------------
	lcnt       : function(){ return (!!this.owner.board.lines.lcnt[this.id]?this.owner.board.lines.lcnt[this.id]:0);},
	iscrossing : function(){ return this.owner.board.lines.isLineCross;},

	//---------------------------------------------------------------------------
	// cell.drawaround() 盤面に自分の周囲1マスを含めて描画する
	//---------------------------------------------------------------------------
	drawaround : function(){ this.getaddr().drawaround();},

	//---------------------------------------------------------------------------
	// cell.isBlack()   該当するCellが黒マスかどうか返す
	// cell.isWhite()   該当するCellが白マスかどうか返す
	// cell.setBlack()  該当するCellに黒マスをセットする
	// cell.setWhite()  該当するCellに白マスをセットする
	//---------------------------------------------------------------------------
	isBlack : function(){ return this.qans===1;},
	isWhite : function(){ return this.qans!==1;},
	setBlack : function(){ this.setQans(1);},
	setWhite : function(){ this.setQans(0);},
	
	//-----------------------------------------------------------------------
	// cell.getNum()     該当するCellの数字を返す
	// cell.setNum()     該当するCellに数字を設定する
	//-----------------------------------------------------------------------
	getNum : function(){ return (this.qnum!==-1 ? this.qnum : this.anum);},
	setNum : function(val){
		if(this.minnum>0 && val===0){ return;}
		// editmode時 val>=0は数字 val=-1は消去 val=-2は？など
		if(this.owner.editmode){
			val = (((this.numberAsObject||val===-2) && this.qnum===val)?-1:val);
			this.setQnum(val);
			this.setAnum(-1);
			if(this.numberIsWhite) { this.setQans(0);}
			if(this.owner.painter.bcolor==="white"){ this.setQsub(0);}
		}
		// playmode時 val>=0は数字 val=-1は消去 numberAsObjectの・はval=-2 numberWithMBの○×はval=-2,-3
		else if(this.qnum===-1){
			var vala = ((val>-1 && !(this.numberAsObject && this.anum=== val  ))? val  :-1);
			var vals = ((val<-1 && !(this.numberAsObject && this.qsub===-val-1))?-val-1: 0);
			this.setAnum(vala);
			this.setQsub(vals);
			this.setQdir(0);
		}
	},
	
	//-----------------------------------------------------------------------
	// cell.isNum()       該当するCellに数字があるか返す
	// cell.noNum()       該当するCellに数字がないか返す
	// cell.isValidNum()  該当するCellに0以上の数字があるか返す
	// cell.isNumberObj() 該当するCellに数字or○があるか返す
	// cell.sameNumber()  ２つのCellに同じ有効な数字があるか返す
	//-----------------------------------------------------------------------
	isNum : function(){ return !this.isnull && (this.qnum!==-1 || this.anum!==-1);},
	noNum : function(){ return !this.isnull && (this.qnum===-1 && this.anum===-1);},
	isValidNum  : function(){ return !this.isnull && (this.qnum>=0||(this.anum>=0 && this.qnum===-1));},
	isNumberObj : function(){ return (this.qnum!==-1 || this.anum!==-1 || (this.numberWithMB && this.qsub===1));},
	sameNumber : function(cell){ return (this.isValidNum() && (this.getNum()===cell.getNum()));},

	//---------------------------------------------------------------------------
	// cell.is51cell()     [＼]のセルかチェックする(カックロ以外はオーバーライドされる)
	// cell.set51cell()    [＼]を作成する(カックロ以外はオーバーライドされる)
	// cell.remove51cell() [＼]を消去する(カックロ以外はオーバーライドされる)
	//---------------------------------------------------------------------------
	// ※とりあえずカックロ用
	is51cell : function(){ return (this.ques===51);},
	set51cell : function(val){
		this.setQues(51);
		this.setQnum(0);
		this.setQnum2(0);
		this.setAnum(-1);
	},
	remove51cell : function(val){
		this.setQues(0);
		this.setQnum(0);
		this.setQnum2(0);
		this.setAnum(-1);
	},

	//---------------------------------------------------------------------------
	// cell.ice() アイスのマスかどうか判定する
	//---------------------------------------------------------------------------
	ice : function(){ return (this.ques===6);},

	//---------------------------------------------------------------------------
	// cell.isEmpty() / cell.isValid() 不定形盤面などで、入力できるマスか判定する
	//---------------------------------------------------------------------------
	isEmpty : function(){ return ( this.isnull || this.ques===7);},
	isValid : function(){ return (!this.isnull && this.ques!==7);},

	//---------------------------------------------------------------------------
	// cell.isDeparture()   オブジェクトを動かすパズルで移動元セルかどうか判定する
	// cell.isDestination() オブジェクトを動かすパズルで移動先セルかどうか判定する
	// ※動いていない場合は、idDestinationのみtrueを返します
	//---------------------------------------------------------------------------
	isDeparture   : function(){ return (!this.isnull &&  this.base.isnull && this.isNum());},
	isDestination : function(){ return (!this.isnull && !this.base.isnull);},

	//---------------------------------------------------------------------------
	// cell.isLineStraight()   セルの上で線が直進しているか判定する
	//---------------------------------------------------------------------------
	isLineStraight : function(){
		if     (this.ub().isLine() && this.db().isLine()){ return true;}
		else if(this.lb().isLine() && this.rb().isLine()){ return true;}
		return false;
	},

	//---------------------------------------------------------------------------
	// cell.setCombinedLine() 自分のセルの設定に応じて周りの線を設定する
	// cell.isLP()  線が必ず存在するセルの条件を判定する
	// cell.noLP()  線が引けないセルの条件を判定する
	//---------------------------------------------------------------------------
	setCombinedLine : function(){	// cell.setQuesから呼ばれる
		if(this.owner.Border.prototype.enableLineCombined){
			var bx=this.bx, by=this.by;
			var blist = this.owner.board.borderinside(bx-1,by-1,bx+1,by+1);
			for(var i=0;i<blist.length;i++){
				var border=blist[i];
				if        (border.line===0 && border.isLineEX()){ border.setLineVal(1);}
				// 黒マスが入力されたら線を消すとかやりたい場合、↓のコメントアウトをはずす
				// else if(border.line!==0 && border.isLineNG()){ border.setLineVal(0);}
			}
		}
	},

	// 下記の関数で用いる定数
	isLPobj : {
		1 : {11:1,12:1,14:1,15:1}, /* k.UP */
		2 : {11:1,12:1,16:1,17:1}, /* k.DN */
		3 : {11:1,13:1,15:1,16:1}, /* k.LT */
		4 : {11:1,13:1,14:1,17:1}  /* k.RT */
	},
	noLPobj : {
		1 : {1:1,4:1,5:1,13:1,16:1,17:1,21:1}, /* k.UP */
		2 : {1:1,2:1,3:1,13:1,14:1,15:1,21:1}, /* k.DN */
		3 : {1:1,2:1,5:1,12:1,14:1,17:1,22:1}, /* k.LT */
		4 : {1:1,3:1,4:1,12:1,15:1,16:1,22:1}  /* k.RT */
	},

	isLP : function(dir){
		return !!this.isLPobj[dir][this.ques];
	},
	// ans.checkenableLinePartsからnoLP()関数が直接呼ばれている
	noLP : function(dir){
		return !!this.noLPobj[dir][this.ques];
	},

	//---------------------------------------------------------------------------
	// cell.countDir4Cell()  上下左右4方向で条件func==trueになるマスの数をカウントする
	//---------------------------------------------------------------------------
	countDir4Cell : function(func){
		var cnt=0, cell;
		cell=this.up(); if(!cell.isnull && func(cell)){ cnt++;}
		cell=this.dn(); if(!cell.isnull && func(cell)){ cnt++;}
		cell=this.lt(); if(!cell.isnull && func(cell)){ cnt++;}
		cell=this.rt(); if(!cell.isnull && func(cell)){ cnt++;}
		return cnt;
	},

	//---------------------------------------------------------------------------
	// cell.getdir4clist()   上下左右4方向の存在するセルを返す
	// cell.getdir4cblist()  上下左右4方向のセル＆境界線＆方向を返す
	//---------------------------------------------------------------------------
	getdir4clist : function(){
		var cell, list=[];
		cell=this.up(); if(!cell.isnull){ list.push([cell,k.UP]);}
		cell=this.dn(); if(!cell.isnull){ list.push([cell,k.DN]);}
		cell=this.lt(); if(!cell.isnull){ list.push([cell,k.LT]);}
		cell=this.rt(); if(!cell.isnull){ list.push([cell,k.RT]);}
		return list;
	},
	getdir4cblist : function(){
		var cell, border, cblist=[];
		cell=this.up(); border=this.ub(); if(!cell.isnull || !border.isnull){ cblist.push([cell,border,k.UP]);}
		cell=this.dn(); border=this.db(); if(!cell.isnull || !border.isnull){ cblist.push([cell,border,k.DN]);}
		cell=this.lt(); border=this.lb(); if(!cell.isnull || !border.isnull){ cblist.push([cell,border,k.LT]);}
		cell=this.rt(); border=this.rb(); if(!cell.isnull || !border.isnull){ cblist.push([cell,border,k.RT]);}
		return cblist;
	},

	//---------------------------------------------------------------------------
	// cell.setCellLineError()    セルと周りの線にエラーフラグを設定する
	//---------------------------------------------------------------------------
	setCellLineError : function(flag){
		var bx=this.bx, by=this.by;
		if(flag){ this.seterr(1);}
		this.owner.board.borderinside(bx-1,by-1,bx+1,by+1).seterr(1);
	}
},

//---------------------------------------------------------------------------
// ★Crossクラス BoardクラスがCrossの数だけ保持する(hascross>=1の時)
//---------------------------------------------------------------------------
// ボードメンバデータの定義(2)
// Crossクラスの定義
'Cross:BoardPiece':{
	group : 'cross',

	iscross : true,

	//---------------------------------------------------------------------------
	// cross.lcnt()       交点に存在する線の本数を返す
	// cross.iscrossing() 指定されたセル/交点で線が交差する場合にtrueを返す
	//---------------------------------------------------------------------------
	lcnt       : function(){ return (!!this.owner.board.lines.lcnt[this.id]?this.owner.board.lines.lcnt[this.id]:0);},
	iscrossing : function(){ return this.owner.board.lines.isLineCross;},

	//---------------------------------------------------------------------------
	// cross.setCrossBorderError() 交点とその周り四方向にエラーフラグを設定する
	//---------------------------------------------------------------------------
	setCrossBorderError : function(){
		this.seterr(1);
		this.owner.board.borderinside(this.bx-1,this.by-1,this.bx+1,this.by+1).seterr(1);
	}
},

//---------------------------------------------------------------------------
// ★Borderクラス BoardクラスがBorderの数だけ保持する(hasborder>0の時)
//---------------------------------------------------------------------------
// ボードメンバデータの定義(3)
// Borderクラスの定義
'Border:BoardPiece':{
	initialize : function(){
		this.sidecell  = [null,null];	// 隣接セルのオブジェクト
		this.sidecross = [null,null];	// 隣接交点のオブジェクト
		this.lineedge  = [];			// LineManager用
	},
	group : 'border',

	isborder : true,

	isvert: false,	// true:境界線が垂直(縦) false:境界線が水平(横)

	// isLineNG関連の変数など
	enableLineNG       : false,
	enableLineCombined : false,

	//---------------------------------------------------------------------------
	// prehook  値の設定前にやっておく処理や、設定禁止処理を行う
	// posthook 値の設定後にやっておく処理を行う
	//---------------------------------------------------------------------------
	prehook : {
		qans : function(num){ return (this.ques!==0);},
		line : function(num){ return (this.checkStableLine(num));}
	},
	posthook : {
		ques : function(num){ this.owner.board.setInfoByBorder(this);},
		qans : function(num){ this.owner.board.setInfoByBorder(this);},
		line : function(num){ this.owner.board.setInfoByLine(this);}
	},

	//---------------------------------------------------------------------------
	// border.draw() 盤面に自分の周囲を描画する (Borderはちょっと範囲が広い)
	//---------------------------------------------------------------------------
	draw : function(){
		this.owner.painter.paintRange(this.bx-2, this.by-2, this.bx+2, this.by+2);
	},

	//-----------------------------------------------------------------------
	// border.isLine()      該当するBorderにlineが引かれているか判定する
	// border.setLine()     該当するBorderに線を引く
	// border.setPeke()     該当するBorderに×印をつける
	// border.removeLine()  該当するBorderから線を消す
	//-----------------------------------------------------------------------
	isLine : function(){ return this.line>0;},
	setLine    : function(id){ this.setLineVal(1); this.setQsub(0);},
	setPeke    : function(id){ this.setLineVal(0); this.setQsub(2);},
	removeLine : function(id){ this.setLineVal(0); this.setQsub(0);},

	//---------------------------------------------------------------------------
	// border.isBorder()     該当するBorderに境界線が引かれているか判定する
	// border.setBorder()    該当するBorderに境界線を引く
	// border.removeBorder() 該当するBorderから線を消す
	//---------------------------------------------------------------------------
	isBorder  : function(){ return (this.ques>0 || this.qans>0);},
	setBorder : function(){
		if(this.owner.editmode){ this.setQues(1); this.setQans(0);}
		else if(this.ques!==1){ this.setQans(1);}
	},
	removeBorder : function(){
		if(this.owner.editmode){ this.setQues(0); this.setQans(0);}
		else if(this.ques!==1){ this.setQans(0);}
	},

	//---------------------------------------------------------------------------
	// border.isVert()  該当するBorderが垂直(縦)かどうか返す
	// border.isHorz()  該当するBorderに水平(横)かどうか返す
	//---------------------------------------------------------------------------
	isVert : function(){ return  this.isvert;},
	isHorz : function(){ return !this.isvert;},

	//---------------------------------------------------------------------------
	// border.checkStableLine() 線が引けない or 必ず存在する状態になっているか判定する
	// border.isLineEX() 線が必ず存在するborderの条件を判定する
	// border.isLineNG() 線が引けないborderの条件を判定する
	//---------------------------------------------------------------------------
	// [pipelink, loopsp], [barns, slalom, reflect, yajirin]で呼ばれる関数
	checkStableLine : function(num){	// border.setLineから呼ばれる
		if(this.enableLineNG){
			if(this.enableLineCombined){
				return ( (num!==0 && this.isLineNG()) ||
						 (num===0 && this.isLineEX()) );
			}
			return (num!==0 && this.isLineNG());
		}
		return false;
	},

	// cell.setQues => setCombinedLineから呼ばれる関数 (exist->ex)
	//  -> cellidの片方がnullになっていることを考慮していません
	isLineEX : function(){
		var cell1 = this.sidecell[0], cell2 = this.sidecell[1];
		return this.isVert() ? (cell1.isLP(k.RT) && cell2.isLP(k.LT)) :
							   (cell1.isLP(k.DN) && cell2.isLP(k.UP));
	},
	// border.setLineCal => checkStableLineから呼ばれる関数
	//  -> cellidの片方がnullになっていることを考慮していません
	isLineNG : function(){
		var cell1 = this.sidecell[0], cell2 = this.sidecell[1];
		return this.isVert() ? (cell1.noLP(k.RT) || cell2.noLP(k.LT)) :
							   (cell1.noLP(k.DN) || cell2.noLP(k.UP));
	}
},

//---------------------------------------------------------------------------
// ★EXCellクラス BoardクラスがEXCellの数だけ保持する
//---------------------------------------------------------------------------
// ボードメンバデータの定義(4)
// EXCellクラスの定義
'EXCell:BoardPiece':{
	group : 'excell',

	isexcell : true
}
});
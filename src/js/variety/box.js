//
// パズル固有スクリプト部 ボックス版 box.js v3.4.1
//
pzpr.classmgr.makeCustom(['box'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.input_onstart();}
		}
	},

	input_onstart : function(){
		var excell = this.getcell_excell();
		if(excell.isnull || excell.group!=='excell'){ return;}

		if(excell!==this.cursor.getex()){
			this.setcursor(excell);
		}
		else{
			this.inputnumber(excell);
		}
	},
	inputnumber : function(excell){
		var qn = excell.getQnum(), max=excell.getmaxnum();
		if(this.btn.Left){ excell.setQnum(qn!==max ? qn+1 : 0);}
		else if(this.btn.Right){ excell.setQnum(qn!==0 ? qn-1 : max);}

		excell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){
		var cursor = this.cursor;
		var excell0 = cursor.getex(), dir = excell0.NDIR;
		switch(ca){
			case 'up':    if(cursor.bx===cursor.minx && cursor.miny<cursor.by){ dir=excell0.UP;} break;
			case 'down':  if(cursor.bx===cursor.minx && cursor.maxy>cursor.by){ dir=excell0.DN;} break;
			case 'left':  if(cursor.by===cursor.miny && cursor.minx<cursor.bx){ dir=excell0.LT;} break;
			case 'right': if(cursor.by===cursor.miny && cursor.maxx>cursor.bx){ dir=excell0.RT;} break;
		}

		if(dir!==excell0.NDIR){
			cursor.movedir(dir,2);

			excell0.draw();
			cursor.draw();
			this.stopEvent();	/* カーソルを移動させない */

			return true;
		}
		return false;
	},

	keyinput : function(ca){
		this.key_inputexcell(ca);
	},
	key_inputexcell : function(ca){
		var excell = this.cursor.getex(), qn = excell.getQnum();
		var max = excell.getmaxnum();

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca);

			if(qn<=0 || this.prev!==excell){
				if(num<=max){ excell.setQnum(num);}
			}
			else{
				if(qn*10+num<=max){ excell.setQnum(qn*10+num);}
				else if (num<=max){ excell.setQnum(num);}
			}
		}
		else if(ca===' ' || ca==='-'){ excell.setQnum(0);}
		else{ return;}

		this.prev = excell;
		this.cursor.draw();
	}
},

TargetCursor:{
	initCursor : function(){
		this.init(-1,-1);
	}
},

//---------------------------------------------------------
// 盤面管理系
EXCell:{
	qnum : 0,

	disInputHatena : true,

	maxnum : function(){
		var bx=this.bx, by=this.by;
		if(bx===-1 && by===-1){ return 0;}
		var sum=0;
		for(var n=(bx===-1?this.owner.board.qrows:this.owner.board.qcols);n>0;n--){ sum+=n;}
		return sum;
	},
	minnum : 0
},

Board:{
	qcols : 9,
	qrows : 9,

	hasexcell : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		var bx1=(d.x1|1), by1=(d.y1|1);
		this.qnumw = [];
		this.qnumh = [];

		var bd=this.owner.board;
		for(var by=by1;by<=d.y2;by+=2){ this.qnumw[by] = bd.getex(-1,by).getQnum();}
		for(var bx=bx1;bx<=d.x2;bx+=2){ this.qnumh[bx] = bd.getex(bx,-1).getQnum();}
	},
	adjustBoardData2 : function(key,d){
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2), bx1=(d.x1|1), by1=(d.y1|1);

		var bd=this.owner.board;
		switch(key){
		case this.FLIPY: // 上下反転
			for(var bx=bx1;bx<=d.x2;bx+=2){ bd.getex(bx,-1).setQnum(this.qnumh[bx]);}
			break;

		case this.FLIPX: // 左右反転
			for(var by=by1;by<=d.y2;by+=2){ bd.getex(-1,by).setQnum(this.qnumw[by]);}
			break;

		case this.TURNR: // 右90°反転
			for(var by=by1;by<=d.y2;by+=2){ bd.getex(-1,by).setQnum(this.qnumh[by]);}
			for(var bx=bx1;bx<=d.x2;bx+=2){ bd.getex(bx,-1).setQnum(this.qnumw[xx-bx]);}
			break;

		case this.TURNL: // 左90°反転
			for(var by=by1;by<=d.y2;by+=2){ bd.getex(-1,by).setQnum(this.qnumh[yy-by]);}
			for(var bx=bx1;bx<=d.x2;bx+=2){ bd.getex(bx,-1).setQnum(this.qnumw[bx]);}
			break;
		}
	}
},

Flags:{
	use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawShadedCells();
		this.drawGrid();

		this.drawBGEXcells();
		this.drawNumbers_box();

		this.drawCircledNumbers_box();

		this.drawChassis();

		this.drawTarget();
	},

	getCanvasCols : function(){
		return this.getBoardCols()+2*this.margin+1;
	},
	getCanvasRows : function(){
		return this.getBoardRows()+2*this.margin+1;
	},
	getOffsetCols : function(){ return 0.5;},
	getOffsetRows : function(){ return 0.5;},

	drawNumbers_box : function(){
		this.vinc('excell_number', 'auto');

		var exlist = this.range.excells;
		for(var i=0;i<exlist.length;i++){
			var excell = exlist[i];
			if(excell.id>=this.owner.board.qcols+this.owner.board.qrows){ continue;}

			if(excell.bx===-1 && excell.by===-1){ continue;}
			var px = excell.bx*this.bw, py = excell.by*this.bh;
			var option = { key:"excell_text_"+excell.id };
			option.color = (excell.error!==1 ? this.fontcolor : this.fontErrcolor);
			this.disptext(""+excell.qnum, px, py, option);
		}
	},

	drawCircledNumbers_box : function(){
		var list = [], bd = this.owner.board;
		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x2>=bd.maxbx){ for(var by=(y1|1),max=Math.min(bd.maxby,y2);by<=max;by+=2){ list.push([bd.maxbx+1,by]);}}
		if(y2>=bd.maxby){ for(var bx=(x1|1),max=Math.min(bd.maxbx,x2);bx<=max;bx+=2){ list.push([bx,bd.maxby+1]);}}

		var g = this.vinc('excell_circle', 'auto');
		var header = "ex2_cir_", rsize  = this.cw*0.36;
		g.fillStyle   = this.circledcolor;
		g.strokeStyle = this.quescolor;
		for(var i=0;i<list.length;i++){
			var num = ((list[i][0]!==bd.maxbx+1 ? list[i][0] : list[i][1])+1)>>1;
			if(num<=0){ continue;}

			if(this.vnop([header,list[i][0],list[i][1]].join("_"),this.NONE)){
				g.shapeCircle(list[i][0]*this.bw, list[i][1]*this.bh, rsize);
			}
		}

		this.vinc('excell_number2', 'auto');
		var header = "ex2_cirtext_";
		for(var i=0;i<list.length;i++){
			var num = ((list[i][0]!==bd.maxbx+1 ? list[i][0] : list[i][1])+1)>>1;
			if(num<=0){ continue;}

			var option = { key: [header,list[i][0],list[i][1]].join("_") };
			option.globalratio = 0.95;
			this.disptext(""+num, list[i][0]*this.bw, list[i][1]*this.bh, option);
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBox();
	},
	encodePzpr : function(type){
		this.encodeBox();
	},

	decodeBox : function(){
		var ec=0, bstr = this.outbstr, bd = this.owner.board;
		for(var a=0;a<bstr.length;a++){
			var ca=bstr.charAt(a), obj=bd.excell[ec];
			if(ca==='-'){ obj.qnum = parseInt(bstr.substr(a+1,2),32); a+=2;}
			else        { obj.qnum = parseInt(ca,32);}
			ec++;
			if(ec >= bd.qcols+bd.qrows){ a++; break;}
		}

		this.outbstr = bstr.substr(a);
	},
	encodeBox : function(){
		var cm="", bd = this.owner.board;
		for(var ec=0,len=bd.qcols+bd.qrows;ec<len;ec++){
			var qnum=bd.excell[ec].qnum;
			if(qnum<32){ cm+=("" +qnum.toString(32));}
			else       { cm+=("-"+qnum.toString(32));}
		}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		var bd = this.owner.board, item = this.getItemList(bd.qrows+1);
		for(var i=0;i<item.length;i++) {
			var ca = item[i];
			if(ca==="."){ continue;}

			var bx = i%(bd.qcols+1)*2-1, by = ((i/(bd.qcols+1))<<1)-1;
			var excell = bd.getex(bx,by);
			if(!excell.isnull){
				excell.qnum = parseInt(ca);
			}

			var cell = bd.getc(bx,by);
			if(!cell.isnull){
				if     (ca==="#"){ cell.qans = 1;}
				else if(ca==="+"){ cell.qsub = 1;}
			}
		}
	},
	encodeData : function(){
		var bd = this.owner.board;
		for(var by=-1;by<bd.maxby;by+=2){
			for(var bx=-1;bx<bd.maxbx;bx+=2){
				var excell = bd.getex(bx,by);
				if(!excell.isnull){
					if(excell.id<bd.qcols+bd.qrows){
						this.datastr += (excell.qnum.toString()+" ");
					}
					else{
						this.datastr += ". ";
					}
					continue;
				}

				var cell = bd.getc(bx,by);
				if(!cell.isnull){
					if     (cell.qans===1){ this.datastr += "# ";}
					else if(cell.qsub===1){ this.datastr += "+ ";}
					else                  { this.datastr += ". ";}
					continue;
				}

				this.datastr += ". ";
			}
			this.datastr += "\n";
		}
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkShadeCells() ){ return 'nmSumRowShadeNe';}

		return null;
	},

	checkShadeCells : function(type){
		var result = true, bd = this.owner.board;
		for(var ec=0;ec<bd.excellmax;ec++){
			var excell = bd.excell[ec];
			var qn=excell.getQnum(), pos=excell.getaddr(), val=0, cell;
			var clist=new this.owner.CellList();
			if(pos.by===-1 && pos.bx>0 && pos.bx<2*bd.qcols){
				cell = pos.move(0,2).getc();
				while(!cell.isnull){
					if(cell.qans===1){ val+=((pos.by+1)>>1);}
					clist.add(cell);
					cell = pos.move(0,2).getc();
				}
			}
			else if(pos.bx===-1 && pos.by>0 && pos.by<2*bd.qrows){
				cell = pos.move(2,0).getc();
				while(!cell.isnull){
					if(cell.qans===1){ val+=((pos.bx+1)>>1);}
					clist.add(cell);
					cell = pos.move(2,0).getc();
				}
			}
			else{ continue;}

			if(qn!==val){
				if(this.checkOnly){ return false;}
				excell.seterr(1);
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	nmSumRowShadeNe : ["数字と黒マスになった数字の合計が正しくありません。","A number is not equal to the sum of the number of shaded cells."]
}
});

class Gomoku {

    static CANVAS_RATIO = 1; // (Height) / (Width)
    static LINE_WIDTH = 2;
    static LINE_SPACE = 30;
    static LINE_NUM = 15;
    static ROUND_SPACE = 15;
    static MAX_WIDTH = Gomoku.ROUND_SPACE * 2 + Gomoku.LINE_SPACE * (Gomoku.LINE_NUM - 1) + Gomoku.LINE_WIDTH * Gomoku.LINE_NUM;
    static SIDE_SPACE = 60;
    static TENGEN_RADIUS = 4;
    static STONE_RADIUS = 12;

    static WIDTH = Gomoku.MAX_WIDTH;
    static HEIGHT = Gomoku.MAX_WIDTH * Gomoku.CANVAS_RATIO;

    static instance = null;

    static BLACK = 1;
    static EMPTY = 0;
    static WHITE = -1;

    static X_AXIS_LABEL = ["１", "２", "３", "４", "５", "６", "７", "８", "９", "１０", "１１", "１２", "１３", "１４", "１５"].reverse();
    static Y_AXIS_LABEL = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五"];

    static MSG_ERROR = "エラー"
    static MSG_CANNOT_PUT = "$1$2にはすでに駒が置かれています";
    static MSG_VIOLATE = "警告";
    static MSG_CANNOT_PUT_1 = "黒の一手目は天元(８八)に置く必要があります";
    static MSG_CANNOT_PUT_2 = "白の一手目は天元に隣接させる必要があります";
    static MSG_CANNOT_PUT_3 = "黒の二手目は天元から一間飛びの範囲に置く必要があります";

    static MSG_END_MESSAGE = "$2$1の勝利です";
    static MSG_DUE_BLACK_MADE_TYOREN = "黒が長連を作ったため";
    static MSG_DUE_BLACK_MADE_YONYON = "黒が四四を作ったため";
    static MSG_DUE_BLACK_MADE_SANSAN = "黒が三三を作ったため";


    static EVALUATE_TYOREN = "長連";
    static EVALUATE_GOREN = "五連";
    static EVALUATE_YONREN = "四連";
    static EVALUATE_YON = "四";
    static EVALUATE_SAN = "三";

    static FILTER_3 = [
        [0, 1, 1, 1, 0],
        [1, 1, 0, 1, 0],
        [1, 0, 1, 1, 0],
        [0, 1, 0, 1, 1],
        [0, 1, 1, 0, 1]
    ];

    //棒四
    static FILTER_4_A = [
        [0, 1, 1, 1, 1, 0]
    ];

    //四
    static FILTER_4_B = [
        [0, 1, 1, 1, 1, -1],
        [-1, 1, 1, 1, 1, 0],
        [1, 1, 1, 0, 1],
        [1, 1, 0, 1, 1],
        [1, 0, 1, 1, 1],
    ];

    //五
    static FILTER_5 = [
        [1, 1, 1, 1, 1]
    ];

    //長連
    static FILTER_LONG = [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    static FILTER_LENGTH_5 = [
        [0, 1, 1, 1, 0],
        [1, 1, 0, 1, 0],
        [1, 0, 1, 1, 0],
        [0, 1, 0, 1, 1],
        [0, 1, 1, 0, 1],
        [1, 1, 1, 0, 1],
        [1, 1, 0, 1, 1],
        [1, 0, 1, 1, 1],
        [1, 1, 1, 1, 1]
    ];
    static FILTER_LENGTH_6 = [
        [0, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, -1],
        [-1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1]
    ]
    static FILTER_LENGTH_7 = [
        [1, 1, 1, 1, 1, 1, 1]
    ]
    static FILTER_LENGTH_8 = [
        [1, 1, 1, 1, 1, 1, 1, 1]
        
    ]
    static FILTER_LENGTH_9 = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]

    constructor() {
        this.w = 0;
        this.h = 0;

        //black turn
        this.black = true;
        this.t = 1;

        this.filter_3 = this.filters_to_nums(Gomoku.FILTER_3);
        this.filter_4_a = this.filters_to_nums(Gomoku.FILTER_4_A);
        this.filter_4_b = this.filters_to_nums(Gomoku.FILTER_4_B);
        this.filter_5 = this.filters_to_nums(Gomoku.FILTER_5);
        this.filter_long = this.filters_to_nums(Gomoku.FILTER_LONG);

        //検索用
        this.forSearch = [
            this.filters_to_nums(Gomoku.FILTER_LENGTH_9),
            this.filters_to_nums(Gomoku.FILTER_LENGTH_8),
            this.filters_to_nums(Gomoku.FILTER_LENGTH_7),
            this.filters_to_nums(Gomoku.FILTER_LENGTH_6),
            this.filters_to_nums(Gomoku.FILTER_LENGTH_5)
        ];

        window.onresize = this.resize;
        this.stage = [];
        this.kifu = [];
        this.initStage();

        document.getElementById("canvas").addEventListener("click", this.onClick);
        this.playing = false;
    }

    filters_to_nums(filters) {
        var nums = [];
        for (var i = 0; i < filters.length; i++) {
            nums[i] = this.filter_to_num(filters[i]);
        }
        return nums;
    }

    /**
     * フィルターは-1~1の値をとるので、+1して三進数とみなし、10進数に変換します。
     * @param {*} filter 
     */
    filter_to_num(filter) {
        var num = 0;
        var _t = 1;
        for (var i = 0; i < filter.length; i++) {
            num += (filter[i] + 1) * _t;
            _t *= 3;
        }
        return num;
    }

    static getInstance() {
        if (Gomoku.instance !== null) {
            return Gomoku.instance;
        }
        Gomoku.instance = new Gomoku();
        return Gomoku.instance;
    }

    initStage() {
        for (var x = 0; x < Gomoku.LINE_NUM; x++) {
            this.stage[x] = [];
            for (var y = 0; y < Gomoku.LINE_NUM; y++) {
                this.stage[x][y] = Gomoku.EMPTY;
            }
        }
        document.getElementById("log-text").textContent = "0: 対局開始";
    }

    onClick(e) {
        var _this = Gomoku.getInstance()
        if (!_this.playing) return;
        var rect = document.getElementById("canvas").getBoundingClientRect();
        var x = Math.floor((e.clientX - rect.x) / _this.r);
        var y = Math.floor((e.clientY - rect.y) / _this.r);

        var xx = Math.floor(x / (Gomoku.LINE_SPACE + Gomoku.LINE_WIDTH));
        var yy = Math.floor(y / (Gomoku.LINE_SPACE + Gomoku.LINE_WIDTH));

        _this.put(xx, yy);
    }

    put(x, y) {

        //黒の一手目が天元でなかった時
        if (this.t === 1 && (x !== 7 || y !== 7)) {
            this.warn(Gomoku.MSG_VIOLATE, Gomoku.MSG_CANNOT_PUT_1);
            return;
        }

        //白の一手目が天元に隣接していなかった時
        if (this.t === 2 && (6 > x || 8 < x || 6 > y || 8 < y)) {
            this.warn(Gomoku.MSG_VIOLATE, Gomoku.MSG_CANNOT_PUT_2);
            return;
        }

        //黒の二手目が天元から一間飛びの範囲でなかった時
        if (this.t === 3 && (5 > x || 9 < x || 5 > y || 9 < y)) {
            this.warn(Gomoku.MSG_VIOLATE, Gomoku.MSG_CANNOT_PUT_3);
            return;
        }

        //すでに駒があった時
        if (this.stage[x][y] !== Gomoku.EMPTY) {
            //警告メッセージを表示
            this.warn(Gomoku.MSG_ERROR, this.sprintf(Gomoku.MSG_CANNOT_PUT, Gomoku.X_AXIS_LABEL[x], Gomoku.Y_AXIS_LABEL[y]));
            return;
        }

        this.stage[x][y] = this.black ? Gomoku.BLACK : Gomoku.WHITE;


        //棋譜データの更新
        var mark = this.black ? "▲" : "△";
        var log = document.getElementById("log-text");
        log.textContent += "\n" + this.t + ":" + mark + Gomoku.X_AXIS_LABEL[x] + Gomoku.Y_AXIS_LABEL[y];

        //棋譜を最下部までスクロール
        log.scrollTop = log.scrollHeight;

        //時系列の更新
        this.t++;

        //描画
        this.draw();

        var evaluate;
        if (evaluate = this.evaluate(x, y)) {
            //黒が長連を作った時
            if (this.black && evaluate.includes(Gomoku.EVALUATE_TYOREN)) {
                this.end(this.sprintf(Gomoku.MSG_END_MESSAGE, "白", Gomoku.MSG_DUE_BLACK_MADE_TYOREN));
            }
            //黒が四四を作った時
            if (this.black && evaluate.findNum(x => x === Gomoku.EVALUATE_YONREN || x === Gomoku.EVALUATE_YON) > 1) {
                this.end(this.sprintf(Gomoku.MSG_END_MESSAGE, "白", Gomoku.MSG_DUE_BLACK_MADE_YONYON));
            }
            //黒が三三を作った時
            if (this.black && evaluate.findNum(x => x === Gomoku.EVALUATE_SAN) > 1) {
                this.end(this.sprintf(Gomoku.MSG_END_MESSAGE, "白", Gomoku.MSG_DUE_BLACK_MADE_SANSAN));
            }

            var put_stone = this.black ? "黒" : "白";
            if (evaluate.includes(Gomoku.EVALUATE_GOREN)) {
                this.end(this.sprintf(Gomoku.MSG_END_MESSAGE, put_stone, ""))
            }
        }

        //手番を反転
        this.black = !this.black;
    }

    //警告
    warn(title, msg) {
        iziToast.warning({
            title: title,
            message: msg,
            position: 'topRight'
        });
    }

    //情報を表示する関数
    info(title, msg){
        iziToast.info({
            title: title,
            message: msg,
            position: 'topRight'
        });
    }

    /**
     * 
     * @param {string} msg 
     */
    end(msg){
        this.info(msg, "");
        this.playing = false;
    }

    /**
     * 
     * @param {string} msg 
     * @param  {enum} args 
     */
    sprintf(msg, ...args) {
        for (var i = 1; i <= args.length; i++) {
            msg = msg.replace("$" + i, args[i - 1]);
        }
        return msg;
    }

    //置いた箇所の周囲六個までを検査
    evaluate(x, y) {
        var put_stone = this.black ? Gomoku.BLACK : Gomoku.WHITE;
        //置いた石を中心に、各方向の6 + 6 + 1=13個を格納するフィルタ
        var pickup = [
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]
        ];
        var c = 6;
        for (i = 1; i <= c; i++) {
            if (x + i < Gomoku.LINE_NUM) {
                pickup[1][c + i] = this.stage[x + i][y] === put_stone ? 1 : - Math.abs(this.stage[x + i][y]);

                //右上
                if (y - i >= 0) {
                    pickup[2][c + i] = this.stage[x + i][y - i] === put_stone ? 1 : - Math.abs(this.stage[x + i][y - i]);
                }

                //右下
                if (y + i < Gomoku.LINE_NUM) {
                    pickup[3][c + i] = this.stage[x + i][y + i] === put_stone ? 1 : - Math.abs(this.stage[x + i][y + i]);
                }
            } else {
                pickup[1][c + i] = -1;
                pickup[2][c + i] = -1;
                pickup[3][c + i] = -1;
            }

            if (x - i >= 0) {
                pickup[1][c - i] = this.stage[x - i][y] === put_stone ? 1 : - Math.abs(this.stage[x - i][y]);
                //左上
                if (y - i >= 0) {
                    pickup[3][c - i] = this.stage[x - i][y - i] === put_stone ? 1 : - Math.abs(this.stage[x - i][y - i]);
                }

                //左下
                if (y + i < Gomoku.LINE_NUM) {
                    pickup[2][c - i] = this.stage[x - i][y + i] === put_stone ? 1 : - Math.abs(this.stage[x - i][y + i]);
                }
            } else {
                pickup[1][c - i] = -1;
                pickup[2][c - i] = -1;
                pickup[3][c - i] = -1;
            }

            //下
            if (y + i < Gomoku.LINE_NUM) {
                pickup[0][c + i] = this.stage[x][y + i] === put_stone ? 1 : - Math.abs(this.stage[x][y + i]);
            } else {
                pickup[3][c + i] = -1;
                pickup[2][c - i] = -1;
                pickup[0][c + i] = -1;
            }

            //上
            if (y - i >= 0) {
                pickup[0][c - i] = this.stage[x][y - i] === put_stone ? 1 : - Math.abs(this.stage[x][y - i]);
            } else {
                pickup[2][c + i] = -1;
                pickup[3][c - i] = -1;
                pickup[0][c - i] = -1;
            }
        }

        var returns = [];

        for (var f = 9; f >= 5; f--) {
            var p = 0;
            while (f + p < 2 * c + 1) {
                for(var i = 0; i < 4; i++){
                    var _pickup = pickup[i].slice(p, f + p);
                    
                    var _p = this.filter_to_num(_pickup);

                    if(!this.forSearch[9 - f].includes(_p)) continue;

                    var flag = false;
                    if(this.filter_long.includes(_p)){
                        returns.push(Gomoku.EVALUATE_TYOREN);
                        flag = true;
                    }
                    if(this.filter_5.includes(_p)){
                        returns.push(Gomoku.EVALUATE_GOREN);
                        flag = true;
                    }
                    if(this.filter_4_b.includes(_p)){
                        returns.push(Gomoku.EVALUATE_YON);
                        flag = true;
                    }
                    if (this.filter_4_a.includes(_p)) {
                        returns.push(Gomoku.EVALUATE_YON);
                        flag = true;
                    }
                    if (this.filter_3.includes(_p)) {
                        returns.push(Gomoku.EVALUATE_SAN);
                        flag = true;
                    }
                    if(flag){
                        pickup[i].forEach(function (_, index, ary) {
                            if (index >= p && index < f + p) {
                                ary[index] = -1;
                            }
                        });
                    }
                }
                p++;
            }
        }
        console.log(returns);
        
        return returns;
    }

    /**
     * resize canvas to fit window size.
     */
    resize() {
        let _this = Gomoku.instance;
        var canvas = document.getElementById("canvas");
        var wWidth = document.getElementById("game").clientWidth;
        var left = Gomoku.MAX_WIDTH < wWidth - Gomoku.SIDE_SPACE ? (wWidth - Gomoku.MAX_WIDTH) / 2 : Gomoku.SIDE_SPACE / 2;
        var width = Gomoku.MAX_WIDTH < wWidth - Gomoku.SIDE_SPACE ? Gomoku.MAX_WIDTH : wWidth - Gomoku.SIDE_SPACE;
        var height = width * Gomoku.CANVAS_RATIO;

        canvas.style.width = width;
        canvas.style.height = height + "px";
        canvas.style.left = left + "px";
        canvas.style.position = "relative";

        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);

        _this.w = width;
        _this.h = height;
        _this.r = width / Gomoku.WIDTH;
        _this.draw();
    }

    draw() {
        let _this = Gomoku.getInstance();
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        var a = Gomoku.ROUND_SPACE * _this.r;
        var b = Gomoku.LINE_SPACE * _this.r;
        var c = Gomoku.LINE_WIDTH * _this.r;

        //背景
        ctx.beginPath();
        ctx.fillStyle = "#db9e02";
        ctx.fillRect(0, 0, _this.w, _this.h);

        //碁盤
        for (var i = 0; i < Gomoku.LINE_NUM; i++) {
            ctx.beginPath();
            ctx.fillStyle = "#000";
            ctx.fillRect(a, a + b * i + c * i, _this.w - a * 2, c);
            ctx.fillRect(a + b * i + c * i, a, c, _this.h - a * 2);
        }

        //天元
        for (var i = 3; i <= 11; i += 4) {
            for (var j = 3; j <= 11; j += 4) {
                ctx.beginPath();
                ctx.fillStyle = "#000";
                ctx.arc(
                    a + b * i + c * i + c / 2,
                    a + b * j + c * j + c / 2,
                    Gomoku.TENGEN_RADIUS * _this.r,
                    0,
                    Math.PI * 2,
                    false
                );
                ctx.fill();
            }
        }

        for (var x = 0; x < Gomoku.LINE_NUM; x += 1) {
            for (var y = 0; y < Gomoku.LINE_NUM; y += 1) {
                if (this.stage[x][y] === Gomoku.EMPTY) continue;

                ctx.beginPath();
                ctx.fillStyle = this.stage[x][y] === Gomoku.BLACK ? "#000" : "#fff";

                ctx.arc(
                    a + b * x + c * x + c / 2,
                    a + b * y + c * y + c / 2,
                    Gomoku.STONE_RADIUS * _this.r,
                    0,
                    Math.PI * 2,
                    false
                );
                ctx.fill();
            }
        }
    }

    start(){
        this.player_first = Math.random() < 0.5;
        var turn = this.player_first ? "先攻" : "後攻";
        this.info(this.sprintf("あなたは$1です", turn), "");
        this.playing = true;
    }
}

var gomoku = Gomoku.getInstance();
gomoku.resize();

function start(){
    document.getElementById("start-btn").style.display = "none";
    gomoku.start();
}

//Arrayにcount関数を追加
Object.defineProperties(Array.prototype, {
    findNum: {
        value: function(callback){
            var count = 0;
            for (let i = 0; i < this.length; i++){
                if(callback(this[i])){
                    count ++;
                }
            }
            return count;
        }
    }
})
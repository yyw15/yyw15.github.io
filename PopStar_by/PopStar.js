var column_width = 10, row_width = 10;  //分别代表列数和行数
var $star = [];  //星星元素数列
var timer;       //开始界面闪烁计时器
var scoretimer;  //分数更新计时器
var operaflag;   //星星的可点击标志
var passflag = true; //通关标志
//var clicknum;        //开始按钮点击次数
var showclearnum;    
var showcheerpic;
var addflag = false; //加分标志
var lastnumber = 0;      //最后一次消除的星星数量
var time_last = 0;      //每一关最后一次消除星星后的分数增加时间
var awardscore = 0;     //每一关的加分数
var visited = [];  //位置访问标记
var wipeX = [], wipeY = []; //选择一个星星后与之相连的星星位置
var direction_x = [1, 0, -1, 0],  direction_y = [0, 1, 0, -1];     //代表四个方向的遍历，配合使用

var star_img_name1 = ["red2.png", "purple2.png", "green2.png", "blue2.png", "yellow2.png"];
var star_img_name2 = ["red1.png", "purple1.png", "green1.png", "blue1.png", "yellow1.png"];
var ST_NONE = -1, ST_RED = 0, ST_PURPLE = 1, ST_GREEN = 2, ST_BLUE = 3, ST_YELLOW = 4;  //星星类型，对应上面的图片名
var starType = [];  //每个位置的星星类型，值取上面

var musicNode, bgMusicNode, cheerMusicNode, musicOn;  //音频元素
var level, score, new_score, goalScore;  //关数, 分数, 临时分数变量，目标分数
var bestscore = 0;
var lastlevelscore, lastlevelgoal;                 //上一关的实时得分,上一关的目标分数

var maxwipex = [],maxwipey = [];//存储当前最长可消除星星群
var showtimes = 0;      //提示出现的次数
var showtimestimer;       //控制提示时间的计时器
var showflag = true;    //true显示星星selected，否则显示normal

var gamestate;

//游戏初始化
function gameInit()
{
	for(var i = 0; i < row_width; ++ i){
		for(var j = 0; j < column_width; ++ j){
			starType[i][j] = parseInt(Math.random()*999999999) % 5;
            showStar(i, j, "normal");
		}
    }
    //$("#container").animate({top:'150px'},500);
    for(var i = 0; i < column_width; i++){
        $star[0][i].animate({marginTop:'550px'},2000);
    }
	operaflag = true;
}

function restartGame()
{
	score = 0;
	level = 1;
	goalScore = 1000;
    //$("#show").text("第" + level + "关").fadeIn();
    $("#show").text("第" + level + "关").fadeIn().animate({left:'210px'},300);
    $("#showTarget").text("目标分数:" + goalScore).fadeIn().animate({left:'160px'},1000);
    document.getElementById("show-goal").innerHTML = "第" + level + "关  目标分:" + goalScore;
    document.getElementById("show-score").innerHTML = score;
    var Goal = document.getElementById("show-goal");
    var goaltimer = setInterval(goalLiner, 20);
    var disaflag = 100;
    var aflag = 0;
    var count = 0;
    function goalLiner(){
        count += 1;
        if(disaflag >= 0){
            Goal.style.opacity = disaflag/100;                                          
            disaflag -= 20;
        }
        else{
            Goal.style.opacity = aflag/100;
            if(aflag < 100)
                aflag += 20;
            if(aflag == 80)
                {
                    aflag = 0;
                    disaflag = 100;
                }
        }
        if(count > 70){
            clearInterval(goaltimer);
            Goal.style.opacity = 1;
        }
    }

	setTimeout(function(){
        $("#show").hide();
        $("#showTarget").hide();
		gameInit();
	}, 2000);
}

function scorechanged(){
    if(new_score <= score){
        document.getElementById("show-score").innerHTML = new_score;
        new_score += 1;
    }
    else{
        clearInterval(scoretimer);
        if(addflag){
            $("#award").fadeOut();
            addflag = false;
        }
    }
}

//更新分数显示
function scoreupdate(length){
    new_score = score;
    score += 5*length*length;
    scoretimer = setInterval(scorechanged, 10);

    clearTimeout(showclearnum);
    document.getElementById("addscore").innerHTML = length + "连消" + 5*length*length + "分";
    $("#addscore").show();
    showclearnum = setTimeout(function(){
        $("#addscore").fadeOut();
    },2000);
    //document.getElementById("show-score").innerHTML = "分数: " + score;

    if(length >= 5){
        cheerMusicNode.currentTime = 1;
		cheerMusicNode.play();
    }

    if(length == 5){
        $("#cheer").css("background", "url(images/4.jpg) no-repeat left top");
        $("#cheer").css("background-size", "100% 100%");
        document.getElementById("cheer").className = "cheerPicture";
        cheer();
    }
    else if(length == 6 || length == 7){
        $("#cheer").css("background", "url(images/1.jpg) no-repeat left top");
        $("#cheer").css("background-size", "100% 100%");
        document.getElementById("cheer").className = "cheerPicture";
        cheer();
    }
    else if(length == 8){
        $("#cheer").css("background", "url(images/2.jpg) no-repeat left top");
        $("#cheer").css("background-size", "100% 100%");
        document.getElementById("cheer").className = "cheerPicture";
        cheer();
    }
    else if(length >= 9){
        $("#cheer").css("background", "url(images/3.jpg) no-repeat left top");
        $("#cheer").css("background-size", "100% 100%");
        document.getElementById("cheer").className = "cheerPicture";
        cheer();
    }

    if(score >= goalScore && passflag == true){
        document.getElementById("passed").className = "passLevel";
        passMusicNode.currentTime = 0;
        passMusicNode.play();
        setTimeout(function(){
            $("#passed").animate({
                height:'53px',
                width:'88px',
                left:'218px',
                top:'242px'
            });
            $("#passed").animate({
                top:'80px',
                left:'400px'
            });
        },500);
        passflag = false;
    }
}

//喝彩图片闪烁事件
function cheer(){
    clearTimeout(showcheerpic);
    var cheer = document.getElementById("cheer");
    $("#cheer").show();
    var cheertimer = setInterval(cheerLiner, 20);
    var disaflag = 100;
    var aflag = 0;
    var count = 0;
    function cheerLiner(){
        count += 1;
        if(disaflag >= 0){
            cheer.style.opacity = disaflag/100;                                          
            disaflag -= 20;
        }
        else{
            cheer.style.opacity = aflag/100;
            if(aflag < 100)
                aflag += 20;
            if(aflag == 80)
                {
                    aflag = 0;
                    disaflag = 100;
                }
        }
        if(count > 70){
            clearInterval(cheertimer);
            cheer.style.opacity = 1;
        }
    }
    showcheerpic = setTimeout(function(){
        $("#cheer").fadeOut();
    },2000);
}

//判断是否进入下一关
function nextlevel(){
    if(score < goalScore){
        operaflag = false;                   //此时无法操作星星
        console.log(goalScore);
        if(score > bestscore){
            bestscore = score;
        }
        document.getElementById("bestnum").innerHTML = bestscore;
        setTimeout(function(){
            document.getElementById("continue").disabled = false;
            document.getElementById("endpicture").className = "End";
            document.getElementById("restart").className = "Resume";
            document.getElementById("continue").className = "Continuepass";
            document.getElementById("endscore").className = "Showendscore";
            document.getElementById("endscore").innerHTML = "SCORE: " + score;
            document.getElementById("endbest").className = "Showendbest";
            document.getElementById("endbest").innerHTML = "BEST SCORE: " + bestscore;
            $("#show").text("游戏结束！").show();
        },3000);
    }
    else{
        lastlevelscore = score;
        lastlevelgoal = goalScore;
        level += 1;
        if(level == 2){
            goalScore += 1500;
        }
        else{
            goalScore += 2000 + 20*(level-3);
        }
        $("#show").css("left","435px");
        $("#showTarget").css("left","700px");
        $("#show").text("第" + level + "关").fadeIn().animate({left:'210px'},300);
        $("#showTarget").text("目标分数:" + goalScore).fadeIn().animate({left:'160px'},1000);

        document.getElementById("passed").className = "passlevel";
        passflag = true;
        $("#passed").css("top","190px");
        $("#passed").css("left","130px");
        $("#passed").css("width","265px");
        $("#passed").css("height","158px");

        document.getElementById("show-goal").innerHTML = "第" + level + "关  目标分:" + goalScore;
        document.getElementById("show-score").innerHTML = score;
        var Goal = document.getElementById("show-goal");
        var goaltimer = setInterval(goalLiner, 20);
        var disaflag = 100;
        var aflag = 0;
        var count = 0;
        function goalLiner(){
            count += 1;
            if(disaflag >= 0){
                Goal.style.opacity = disaflag/100;                                          
                disaflag -= 20;
            }
            else{
                Goal.style.opacity = aflag/100;
                if(aflag < 100)
                    aflag += 20;
                if(aflag == 80)
                    {
                        aflag = 0;
                        disaflag = 100;
                    }
            }
            if(count > 70){
                clearInterval(goaltimer);
                Goal.style.opacity = 1;
            }
        }

        setTimeout(function(){
            $("#show").hide();
            $("#showTarget").hide();
            for(var i = 0; i < column_width; i++){
                $star[0][i].css("margin-top", 0);
            }
            gameInit();
            if(level >= 4){
                timelimit();
            }
            if(score >= goalScore && passflag == true){
                document.getElementById("passed").className = "passLevel";
                passMusicNode.currentTime = 0;
                passMusicNode.play();
                setTimeout(function(){
                    $("#passed").animate({
                        height:'53px',
                        width:'88px',
                        left:'218px',
                        top:'242px'
                    });
                    $("#passed").animate({
                        top:'80px',
                        left:'400px'
                    });
                },500);
                passflag = false;
            }
        }, 2000);
	}
}

//显示或隐藏星星函数
function showStar(x, y, state)
{
	if(starType[x][y] !== -1){
		if(state === "normal"){
            $star[x][y].css("background-image", "url(images/img/" + star_img_name1[starType[x][y]] + ")");
            /*if(y == 0){
                console.log("1");
                $star[x][y].animate({top:'150px'},1000);
                console.log("1");
            }*/
        }
        else{
			$star[x][y].css("background-image", "url(images/img/" + star_img_name2[starType[x][y]] + ")");
		}
    }
    else{
		$star[x][y].css("background-image", "none");
	}
}

//开始按钮闪烁事件
function startplay(){
    document.getElementById("toplay").disabled = true;
    buttonMusicNode.currentTime = 0;
    buttonMusicNode.play();
    if(gamestate){
        setTimeout(play,1500);
    }
    else{
        setTimeout(function(){
            document.getElementById("gameName").className = "Game";
            document.getElementById("five_color").className = "Five";
            document.getElementById("toplay").className = "Start";
            document.getElementById("show-goal").className = "Goal";
            document.getElementById("show-score").className = 'Score';
            document.getElementById("bestscore").className = "Best";
            document.getElementById("bs").className = "Bshow";
            clearInterval(timer);
            for(var i = 0; i < column_width; i++){
                $star[0][i].css("margin-top", 0);
            }
             $("#show").css("left","435px");
            $("#showTarget").css("left","700px");
            restartGame();
        },1500);
    }
    var buttontimer = setInterval(buttonLiner, 20);
    var toplay = document.getElementById("toplay");
    var disaflag = 100;
    var aflag = 0;
    var count = 0;
    function buttonLiner(){
        count += 1;
        if(disaflag >= 0){
            toplay.style.opacity = disaflag/100;                                          
            disaflag -= 20;
        }
        else{
            toplay.style.opacity = aflag/100;
            if(aflag < 100)
                aflag += 20;
            if(aflag == 80)
                {
                    aflag = 0;
                    disaflag = 100;
                }
        }
        if(count > 60){
            clearInterval(buttontimer);
            toplay.style.opacity = 1;
        }
    }
}

//点击开始按钮游戏开始事件
function play(){
    document.getElementById("gameName").className = "Game";
    document.getElementById("five_color").className = "Five";
    document.getElementById("toplay").className = "Start";
    document.getElementById("show-goal").className = "Goal";
    document.getElementById("show-score").className = 'Score';
    document.getElementById("bestscore").className = "Best";
    document.getElementById("bs").className = "Bshow";
    clearInterval(timer);
    for(var i = 0; i < row_width; ++ i){
		starType[i] = [];
	}

	//创建星星元素
	var $container = $("#bg-container");
	for(var i = 0; i < row_width; ++ i){
		$star[i] = [];
		visited[i] = [];
		for(var j = 0; j < column_width; ++ j){
			$star[i][j] = $('<div class="star" data-x=\"' + i + '\" data-y="' + j + '\" ></div>');
			$star[i][j].click(function(){
				return selectDown(this.dataset.x, this.dataset.y);
			});
            $container.append($star[i][j]);
			visited[i][j] = false;
        }
    }
	/*musicNode = document.getElementById("music");
    bgMusicNode = document.getElementById("bg-music");
    cheerMusicNode = document.getElementById("cheer-music");
	musicSet(true);*/
	restartGame();
}

//点击结束界面按钮返回开始界面事件
function returnstart(){
    buttonMusicNode.currentTime = 0;
    buttonMusicNode.play();
     for(var i = 0; i < row_width; ++ i){
		for(var j = 0; j < column_width; ++ j){
            starType[i][j] = ST_NONE;
			showStar(i, j, "normal");
		}
    }
    
    document.getElementById("toplay").disabled = false;
    gamestate = false;
    timer = setInterval(colorLiner, 20);
    var count = 0;
    var disaflag = 100;
    var aflag = 0;
    var disaflag_2 = 100;
    var aflag_2 = 0;
    var blue = document.getElementById("blue_star");
    var green = document.getElementById("green_star");
    var purple = document.getElementById("purple_star");
    var red = document.getElementById("red_star");
    var yellow = document.getElementById("yellow_star");
    function colorLiner(){
        if(disaflag >= 0){
            blue.style.opacity = disaflag/100;
            yellow.style.opacity = disaflag/100;                                                
            disaflag -= 1;
        }
        else{
            blue.style.opacity = aflag/100;
            yellow.style.opacity = aflag/100;     
            if(aflag < 100)
                aflag += 1;
            if(aflag == 99)
                {
                    aflag = 0;
                    disaflag = 100;
                }
        }
        count += 1;
        if(count % 2 == 0)
            colorLiner_2();
    }
    function colorLiner_2(){
        if(disaflag_2 >= 0){
            green.style.opacity = disaflag_2/100;
            purple.style.opacity = disaflag_2/100;
            red.style.opacity = disaflag_2/100;                                          
            disaflag_2 -= 1;
        }
        else{
            green.style.opacity = aflag_2/100;
            purple.style.opacity = aflag_2/100;
            red.style.opacity = aflag_2/100;
            if(aflag_2 < 100)
                aflag_2 += 1;
            if(aflag_2 == 99)
                {
                    aflag_2 = 0;
                    disaflag_2 = 100;
                }
        }
    }
    document.getElementById("gameName").className = "game";
    document.getElementById("five_color").className = "five";
    document.getElementById("toplay").className = "start";
    document.getElementById("show-goal").className = "goal";
    document.getElementById("show-score").className = 'score';
    document.getElementById("bestscore").className = "best";
    document.getElementById("endpicture").className = "end";
    document.getElementById("restart").className = "resume";
    document.getElementById("continue").className = "continuepass";
    document.getElementById("endscore").className = "showendscore";
    document.getElementById("endbest").className = "showendbest";
    document.getElementById("bs").className = "bshow";
    $("#show").hide();
}

//点击星星事件
function selectDown(x, y){
    if(operaflag == true){
        x = parseInt(x);
        y = parseInt(y);
        //$star[x][y].addClass("redstar-five");
        if(starType[x][y] != ST_NONE){
            search_same_star(x, y);
            for(var i = 0; i < wipeX.length; i++){
                showStar(wipeX[i], wipeY[i], "selected");
            }
            //clear_same_star();
            setTimeout(function(){
                 //operaflag = false;
                 clear_same_star();
                 //operaflag = true;
                if(!Isconnected()){
                    //setTimeout(nextlevel, 5000);
                    operaflag = false;
                    award();
                    console.log(time_last);
                    console.log(awardscore);
                    if(document.getElementById("clockcontrol").className == "Clock"){     //进入下一关前清除时钟
                        clearInterval(clocktimer);
                        document.getElementById("clockcontrol").className = "clock";
                        clocknum = 30;
                    }
                    //setTimeout(nextlevel, time_last + 200 + 10*awardscore-6000);
                    setTimeout(nextlevel, time_last + 200 + 0.5*10*awardscore);
                }
            },200);
        }
    }
    else{
        return;
    }
}

function award(){
    var starnumber = 0;
    //var awardscore = 0;
    for(var x = 0; x < column_width; x++){
        for(var y = 0; y < row_width; y++){
            if(starType[x][y] != ST_NONE){
                starnumber += 1;
            }
        }
    }
    if(starnumber < 10){
        awardscore = 100*(10 - starnumber);
    }
    else{
        awardscore = 0;
    }
    $("#award").css("top", "300px");
    $("#award").css("left", "150px");
    document.getElementById("award").innerHTML = "剩余星星" + starnumber + "个" + " 奖励分数" + awardscore;
    $("#award").show();
    $("#award").animate({top:'120px'},2000);
    time_last = 50*lastnumber*lastnumber;
    setTimeout(function(){
        new_score = score;
        score += awardscore;
        addflag = true;
        scoretimer = setInterval(scorechanged, 10);
    }, time_last + 200);                         //有bug,最后一次消除数目小于10,否则new_score和score会被改
}

//判断是否还有连在一起的星星(可消除)
function Isconnected(){
    for(var i = 0; i < row_width; i++){
        for(var j = 0; j < column_width; j++){
            if(starType[i][j] != ST_NONE){
                for(var k = 0; k < 4; k++){
                    var new_x = i + direction_x[k];
                    var new_y = j + direction_y[k];
                    if(new_x >= 0 && new_x < row_width && new_y >= 0 && new_y < column_width && visited[new_x][new_y] == false && starType[i][j] == starType[new_x][new_y])
                        return true;
                }
            }
        }
    }
    return false;
}

//玩家点击一个星星后搜索与之相连的颜色相同的星星
function search_same_star(x, y){
    if(wipeX.indexOf(x) == wipeY.indexOf(y) && wipeX.indexOf(x) !== -1){
        return;
    }
    wipeX.push(x);
    wipeY.push(y);
    visited[x][y] = true;
    for(var i = 0;i < 4; i++){
        var new_x = x + direction_x[i];
        var new_y = y + direction_y[i];
        if(new_x >= 0 && new_x < row_width && new_y >= 0 && new_y < column_width && visited[new_x][new_y] == false && starType[x][y] == starType[new_x][new_y]){
            search_same_star(new_x, new_y);
        }
    }
}

//时钟限时30s通关
var clocknum = 30;
var clocktimer;
function timelimit(){
    clocknum = 30;
    document.getElementById("clockcontrol").className = "Clock";
    document.getElementById("clocknum").className = "showClock";
    document.getElementById("clocknum").innerHTML = clocknum;
    clocktimer = setInterval(clocknumchanged, 1000);
}

function clocknumchanged(){
    /*if(score >= goalScore){
        clearInterval(clocktimer);
        document.getElementById("clockcontrol").className = "clock";
    }*/
    if(clocknum > 0){
        clocknum -= 1;
        if(clocknum >= 10){
            document.getElementById("clocknum").innerHTML = clocknum;
        }
        else{
             document.getElementById("clocknum").innerHTML = "0" + clocknum;
        }
    }
    else{
        clearInterval(clocktimer);
        operaflag = false;
        document.getElementById("clockcontrol").className = "clock";
        nextlevel();
    }
}

//消除星星
function clear_same_star(){
    if(wipeX.length == 1){
        showStar(wipeX[0], wipeY[0], "normal");
		visited[wipeX[0]][wipeY[0]] = false;  //恢复访问标记
    }
    else if(wipeX.length >= 2){
        for(var i = 0; i < wipeX.length; i++){
            starType[wipeX[i]][wipeY[i]] = ST_NONE;
            showStar(wipeX[i],wipeY[i],"normal");
            visited[wipeX[i]][wipeY[i]] = false;
        }
        scoreupdate(wipeX.length);
        moveStar();

        /*if(musicOn){
			musicNode.currentTime = 0;
			musicNode.play();
        }*/
        musicNode.currentTime = 0;
        musicNode.play();
        lastnumber = wipeX.length;
    }
    wipeX.length = 0;
    wipeY.length = 0;
}

//移动星星填充空缺函数
function moveStar(){
    var min_y = column_width;
    for(var i = 0; i < wipeY.length; i++){
        if(wipeY[i] < min_y){
            min_y = wipeY[i];
        }
    }
    //向下移动星星
    for(var y = 0; y < column_width; y++){
        if(wipeY.indexOf(y) >= 0){
            var high_x = row_width - 1;
            for(var x = row_width - 1; x >= 0; x--){
                if(starType[x][y] != ST_NONE){
                    starType[high_x][y] = starType[x][y];
                    high_x -= 1;
                }
            }
            for(var j = 0; j <= high_x; j++){
                starType[j][y] = ST_NONE;
            }
        }
    }
    //向左移动星星
    for(var y = min_y; y < column_width; y++){
        if(starType[row_width-1][y] != ST_NONE){
            if(min_y != y){
                for(var x = 0; x < row_width; x++){
                    starType[x][min_y] = starType[x][y];
                }
            }
            min_y += 1;
        }
    }
    for(var i = column_width; i >= min_y; i--){
        for(var x = 0; x < row_width; x++){
            starType[x][i] = ST_NONE;
        }
    }

    //移动完毕后显示所有星星
    for(var i = 0; i < row_width; ++ i){
		for(var j = 0; j < column_width; ++ j){
			showStar(i, j, "normal");
		}
	}
}

//设置音乐
function musicSet(on)
{
	if(on){
		bgMusicNode.play();
    }
    else{
		bgMusicNode.pause();
	}
	musicOn = on;
}


//点击声控按钮停止音乐
function changemusic(){
    var musicstate = $("#changemusic");
    if(musicOn){
        musicstate.css("background-image", "url(images/menu_sound_off.png)");
        musicOn = false;
        musicSet(musicOn);
    }
    else{
        musicstate.css("background-image", "url(images/menu_sound_on.png)");
        musicOn = true;
        musicSet(musicOn);
    }
}

//找出最长星星群
function prompt(){
    for(var i = 0; i < column_width; i++)
    {
        for(var j = 0; j < row_width; j++)
        {
            if(starType[i][j] != -1)
            {
                wipeX.length = 0;
                wipeY.length = 0;
                search_same_star(i,j);
                if(wipeX.length > maxwipex.length)
                {
                    for(var k = 0; k < wipeX.length; k++)
                    {
                        maxwipex[k] = wipeX[k];
                        maxwipey[k] = wipeY[k];//保留节点信息
                    }
                }
            }
        }
    }
    for(var i = 0; i < column_width; i++)
    {
        for(var j = 0; j < row_width; j++)
        {
            visited[i][j] = false;
            showStar(i, j, "normal");
        }
    }
    showtimestimer = setInterval(showprompt,100);
    wipeX.length = 0;
    wipeY.length = 0;
}

function showprompt(){
    showtimes++;
    if(showflag)
    { 
        for(var i = 0; i < maxwipex.length; i++)
        {
            showStar(maxwipex[i], maxwipey[i], "selected");
        }    
        showflag = false;
    }
    else
    {
        for(var i = 0; i < maxwipex.length; i++)
        {
            showStar(maxwipex[i], maxwipey[i], "normal");
        }    
        showflag = true;
    }
    if(showtimes == 8)
    {
        clearInterval(showtimestimer);
        maxwipex.length = 0;
        maxwipey.length = 0;
        showtimes = 0;
    }
}

//点击继续通关按钮闪烁事件
function tocontinue(){
    document.getElementById("continue").disabled = true;
    buttonMusicNode.currentTime = 0;
    buttonMusicNode.play();
    setTimeout(continuepass,1500);
    var buttontimer = setInterval(buttonLiner, 20);
    var tocontinue = document.getElementById("continue");
    var disaflag = 100;
    var aflag = 0;
    var count = 0;
    function buttonLiner(){
        count += 1;
        if(disaflag >= 0){
            tocontinue.style.opacity = disaflag/100;                                          
            disaflag -= 20;
        }
        else{
            tocontinue.style.opacity = aflag/100;
            if(aflag < 100)
                aflag += 20;
            if(aflag == 80)
                {
                    aflag = 0;
                    disaflag = 100;
                }
        }
        if(count > 60){
            clearInterval(buttontimer);
            tocontinue.style.opacity = 1;
        }
    }
}

//点击继续通关按钮事件
function continuepass(){
    document.getElementById("show-score").innerHTML = lastlevelscore;
    document.getElementById("endpicture").className = "end";
    document.getElementById("restart").className = "resume";
    document.getElementById("continue").className = "continuepass";
    document.getElementById("endscore").className = "showendscore";
    document.getElementById("endbest").className = "showendbest";
    $("#show").hide();
    if(level != 1){
         score = lastlevelscore;
         goalScore = lastlevelgoal;
         level -= 1;
         nextlevel();
    }
    else{
        for(var i = 0; i < column_width; i++){
                $star[0][i].css("margin-top", 0);
        }
        $("#show").css("left","435px");
        $("#showTarget").css("left","700px");
        restartGame();
    } 
}

window.onload = function(){
    gamestate = true;
    timer = setInterval(colorLiner, 20);
    var count = 0;
    var disaflag = 100;
    var aflag = 0;
    var disaflag_2 = 100;
    var aflag_2 = 0;
    var blue = document.getElementById("blue_star");
    var green = document.getElementById("green_star");
    var purple = document.getElementById("purple_star");
    var red = document.getElementById("red_star");
    var yellow = document.getElementById("yellow_star");
    function colorLiner(){
        if(disaflag >= 0){
            blue.style.opacity = disaflag/100;
            yellow.style.opacity = disaflag/100;                                                
            disaflag -= 1;
        }
        else{
            blue.style.opacity = aflag/100;
            yellow.style.opacity = aflag/100;     
            if(aflag < 100)
                aflag += 1;
            if(aflag == 99)
                {
                    aflag = 0;
                    disaflag = 100;
                }
        }
        count += 1;
        if(count % 2 == 0)
            colorLiner_2();
    }
    function colorLiner_2(){
        if(disaflag_2 >= 0){
            green.style.opacity = disaflag_2/100;
            purple.style.opacity = disaflag_2/100;
            red.style.opacity = disaflag_2/100;                                          
            disaflag_2 -= 1;
        }
        else{
            green.style.opacity = aflag_2/100;
            purple.style.opacity = aflag_2/100;
            red.style.opacity = aflag_2/100;
            if(aflag_2 < 100)
                aflag_2 += 1;
            if(aflag_2 == 99)
                {
                    aflag_2 = 0;
                    disaflag_2 = 100;
                }
        }
    }
    musicNode = document.getElementById("music");
    bgMusicNode = document.getElementById("bg-music");
    cheerMusicNode = document.getElementById("cheer-music");
    buttonMusicNode = document.getElementById("button-music");
    passMusicNode = document.getElementById("pass-music");
	musicSet(true);
}
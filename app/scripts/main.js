/**
  * wait until the doc is ready to obey orders
  */
  var player="b";
  var bot="b";
document.addEventListener("DOMContentLoaded",function(e){
  /**
    * once content is loaded
    */
  setupPlayerOption();
  setupPlayerInput();
});

function setupPlayerOption(){
  var playerChoice=function(){
    bot=(this.classList.contains("x")) ? "o" : "x";
    player=(bot==="x") ? "o" : "x";
    var game=document.querySelector('.game');
    game.classList.remove('off');
    game.classList.add('on');
    var status=document.querySelector('.status');
    status.innerText="Game on";
    if(bot==="x")
      firstMove();
  };

  function firstMove(){
    var r=Math.floor(Math.random()*3)+1;
    var c=Math.floor(Math.random()*3)+1;
    var rand=document.querySelector("#r"+ r + "c" +c);
    rand.classList.add("x");
  };

  var playerOptions=document.querySelectorAll('.player');
  playerOptions[0].onclick=playerChoice;
  playerOptions[1].onclick=playerChoice;

}

function setupPlayerInput(){
  var buttons=document.querySelectorAll(".game button");
  var buttonClickHandler=function(){
    var positions=getGamePositions();
    var winner=getWinner(positions);
    // do nothing if the block already has x or o (and the game is still on)
    if(!winner && !this.classList.contains("x") && !this.classList.contains("o")){
      this.classList.add(player);
    }
    /*positions=getGamePositions(); //get positions again, based on last user input
    winner=getWinner(positions);
    console.log(winner);
    if(winner){
      formatWinner(winner);
      return; //gameover
    }*/
    var gameStatus=evaluateGameStatus(); //for user input
    console.log("game status after user input: " + gameStatus);
    if(gameStatus=="Game on"){
      botResponse();
      evaluateGameStatus(); //for bot response
    }
  };

  function evaluateGameStatus(){
    result="Game on";
    positions=getGamePositions(); //get positions again, based on last user input
    winner=getWinner(positions);
    if(winner){
      formatWinner(winner);
      result=(winner[0]==bot)? "Bot ("+ bot + ") wins." : "You (" + player + ") win!";
    }else if (gameTie()){
      result="It's a tie!";
    }
    var status=document.querySelector('.status');
    status.innerText=result;
    return result;
  }
  function gameTie(){
    positions=getGamePositions();
    winner=getWinner(positions);
    return (!winner && !positions.toString().includes("b")); //no one has won and no blanks;
  }
  function botResponse(){
    positions=getGamePositions(); //get current game positions
    var winPatterns=[bot+bot+"b",bot+"b"+bot,"b"+bot+bot];
    //try to win first
    var next=fillNextBestSlot(positions,winPatterns);
    console.log("fill " + next + " to win.");
    if(next){
      /*var nextBlock=document.querySelector("#r"+next[0]+"c"+next[1]);
      nextBlock.classList.add(bot);*/
      /*positions=getGamePositions();
      winner=getWinner(positions);
      console.log("winner:"+winner);
      if(winner){
        formatWinner(winner);
        return; //gameover
      }*/
    }else{
      //second is to try and defend
      var defencePatterns=[player+player+"b",player+"b"+player,"b"+player+player];
      next=fillNextBestSlot(positions,defencePatterns);
      console.log("fill " + next + " to defend");
      if(next){
        /*var nextBlock=document.querySelector("#r"+next[0]+"c"+next[1]);
        nextBlock.classList.add(bot);*/
      }else{ //third, try to position bot side by side, in readiness for next win
        var strategicWinPatterns=[bot+"bb","bb"+bot,"b"+bot+"b"];
        next=fillNextBestSlot(positions,strategicWinPatterns);
        console.log("fill " + next + " to position strategically");
        if(next){
          /*var nextBlock=document.querySelector("#r"+next[0]+"c"+next[1]);
          nextBlock.classList.add(bot);*/
        }else{ //must be early stages, try to position right next to the player
          var strategicDefencePatterns=[player+"bb","bb"+player,"b"+player+"b"];
          next=fillNextBestSlot(positions,strategicDefencePatterns);
          console.log("fill " + next + " to position next to player");
          if(next){
            /*var nextBlock=document.querySelector("#r"+next[0]+"c"+next[1]);
            nextBlock.classList.add(bot);*/
          }else{
            var oneLastSlotPatterns=[
              player+"b"+bot,
              bot+"b"+player,
              "b"+player+bot,
              "b"+bot+player
            ];
            next=fillNextBestSlot(positions,strategicDefencePatterns);
            console.log("fill " + next + " to cover last position");
            if(next){
              /*var nextBlock=document.querySelector("#r"+next[0]+"c"+next[1]);
              nextBlock.classList.add(bot);*/
            }
            //#TODO: still remaining block is not filled
          }
        }
      }
    }
  }

  /**
    * format winner order
    */
  function formatWinner(winner){
    if(winner[1]==winner[3] || winner[2]==winner[4]){ //row or column
      for(var r=winner[1];r<=winner[3];r++){
        for(var c=winner[2];c<=winner[4];c++){
          var block=document.querySelector("#r" + r + "c" + c);
          block.classList.add("win");
        }
      }
    }else if(winner[1]==1 && winner[2]==3){ //bottom left to top right
      for(var i=1;i<4;i++){
        var block=document.querySelector("#r" + i + "c" + (4-i));
        block.classList.add("win");
      }
    }else if(winner[1]==1 && winner[2]==1){ //top left to bottom right
      for(var i=1;i<4;i++){
        var block=document.querySelector("#r" + i + "c" + i);
        block.classList.add("win");
      }
    }
  }

  /**
    * look for provided patters in the current positions
    * and return best slot that matches the pattern
    * return false if no such match
    */
  function fillNextBestSlot(positions,patterns){
    //look for completed rows or columns in positions
    //return the winner if found
    console.log("patterns: " + patterns);
    var result=false;
    for(var i=0;i<3;i++){
      var column=positions[0][i]+positions[1][i]+positions[2][i];

      if(patterns.includes(positions[i])){
        c=positions[i].indexOf("b")+1;
        r=i+1;
        result= [r,c];
      } else if(patterns.includes(column)){
        r=column.indexOf("b")+1;
        c=i+1;
        result= [r,c];
      }
    }
    /*if(result){
      console.log("row/col result:" + result);
      return result;
    }*/

    //check for completed positions diagonally
    var diag1=positions[0][0]+positions[1][1]+positions[2][2];
    var diag2=positions[0][2]+positions[1][1]+positions[2][0];
    if(patterns.includes(diag1)){
      var index=diag1.indexOf("b");
      r=index+1;
      c=index+1;
      result= [r,c];
    } else if(patterns.includes(diag2)){
      var index=diag2.indexOf("b");
      c=3-index;
      r=index+1;
      result= [r,c];
    }
    console.log("after diagonal check result:" + result);
    if(result){
      console.log("findbestslot:trying to fill slot");
      var nextBlock=document.querySelector("#r"+result[0]+"c"+result[1]);
      nextBlock.classList.add(bot);
    }
    return result;
  };

  function getWinner(positions){
    //look for completed rows or columns in positions
    //return the winner if found
    var result=false;
    for(var i=0;i<3;i++){
      var column=positions[0][i]+positions[1][i]+positions[2][i];
      if(positions[i]==="xxx"){
        result=["x",i+1,1,i+1,3];
      } else if(positions[i]==="ooo"){
        result=["o",i+1,1,i+1,3];
      } else if(column==="xxx") {
        result=["x",1,i+1,3,i+1];
      } else if(column==="ooo"){
        result=["o",1,i+1,3,i+1];
      }
      if(result)
        break;
    }

    //check for completed positions diagonally
    var diag1=positions[0][0]+positions[1][1]+positions[2][2];
    var diag2=positions[0][2]+positions[1][1]+positions[2][0];
    if(!result){
      if(diag1==="xxx"){
        result=["x",1,1,3,3];
      }else if (diag2==="xxx"){
        result=["x",1,3,3,1];
      }else if(diag1==="ooo"){
        result=["o",1,1,3,3];
      }else if(diag2==="ooo"){
        result=["0",1,3,3,1];
      }
    }
    return result;
  };

  function getGamePositions(){
    var gamePositions=[];
    for(var i=1;i<4;i++){
      var row="";
      for(var j=1;j<4;j++){
        var position=document.querySelector("#r" + i + "c" + j);
        if(position.classList.contains("x"))
          row+="x";
        else if(position.classList.contains("o"))
          row+="o";
        else
          row+="b";
      }
      gamePositions.push(row);
    }
    return gamePositions;
  };

  for(var i=0;i<buttons.length;i++){
    buttons[i].onclick=buttonClickHandler;
  }

}

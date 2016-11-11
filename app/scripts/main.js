/**
  * wait until the doc is ready to obey orders
  */
  var player="b";
  var bot="b";
document.addEventListener("DOMContentLoaded",function(e){
  /**
    * once content is loaded
    * bind slider functionality - to update text box
    * bind text box functionality - to update slider
    * bind button click to start/stop clock
    */
  setupPlayerOption();
  setupPlayerInput();
});

function setupPlayerOption(){
  var playerChoice=function(){
    console.log("inside player choice");
    bot=(this.classList.contains("x")) ? "o" : "x";
    player=(bot==="x") ? "o" : "x";
    console.log("bot:" + bot + ";player:" + player);
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
    if(!winner && !this.classList.contains("x") && !this.classList.contains("o"))
      this.classList.add(player);
    positions=getGamePositions(); //get positions again, based on last user input
    winner=getWinner(positions);

    console.log(winner);

    var winPatterns=[bot+bot+"b",bot+"b"+bot,"b"+bot+bot];
    var defencePatterns=[player+player+"b",player+"b"+player,"b"+player+player];

    //try to win first
    var next=fill(positions,winPatterns);
    console.log("fill " + next + " to win.");
    if(next){
      var nextBlock=document.querySelector("#r"+next[0]+"c"+next[1]);
      nextBlock.classList.add(bot);
    }
    positions=getGamePositions();
    winner=getWinner(positions);
    console.log("winner:"+winner);

    //second is to try and defend
    next=fill(positions,defencePatterns);
    console.log("fill " + next + " to defend");
    if(next){
      var nextBlock=document.querySelector("#r"+next[0]+"c"+next[1]);
      nextBlock.classList.add(bot);
    }
    //third, strategic fill when the game is early
    //#TODO: strategic fill
  };
  /**
    * Try to win first (look for two consecutive bot options and fill in the third)
    */
  function fill(positions,patterns){
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
    if(result){
      console.log("row/col result:" + result);
      return result;
    }
    //check for completed positions diagonally
    var diag1=positions[0][0]+positions[1][1]+positions[2][2];
    var diag2=positions[0][2]+positions[1][1]+positions[2][0];
    console.log("diag1:"+diag1+";diag2:"+diag2);
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
    return result;
  };

  function getWinner(positions){
    //look for completed rows or columns in positions
    //return the winner if found
    for(var i=0;i<3;i++){
      var column=positions[0][i]+positions[1][i]+positions[2][i];
      if(positions[i]==="xxx"){
        return "x";
      } else if(positions[i]==="ooo"){
        return "o";
      } else if(column==="xxx") {
        return "x";
      } else if(column==="ooo"){
        return "o";
      }
    }
    //check for completed positions diagonally
    var diag1=positions[0][0]+positions[1][1]+positions[2][2];
    var diag2=positions[0][2]+positions[1][1]+positions[2][0];
    if(diag1==="xxx" || diag2==="xxx"){
      return "x";
    }else if(diag1==="ooo" || diag2==="ooo  "){
      return "o";
    }else{
      return false; //return false if no-one has won
    }
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
    console.log(gamePositions);
    return gamePositions;
  };

  for(var i=0;i<buttons.length;i++){
    buttons[i].onclick=buttonClickHandler;
  }

}

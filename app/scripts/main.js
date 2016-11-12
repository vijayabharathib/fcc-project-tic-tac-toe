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
  processPlayerInput();
});

/**
  * handle player choice of x or o at the start of each game
  * get the game board ready
  * let the bot make first move if player choses to be 'o'
  */
function setupPlayerOption(){

  //called to handle user choice before each game
  //also starts the game if bot has to make first move
  var playerChoice=function(){
    // start the game by revealing the board
    var buttons=document.querySelectorAll(".game button");
    for(var i=0;i<buttons.length;i++){
      buttons[i].classList.remove("reset");
    }
    //remember player choice and determine option for bot
    bot=(this.classList.contains("x")) ? "o" : "x";
    player=(bot==="x") ? "o" : "x";
    // clone option panel
    var game=document.querySelector('.game');
    game.classList.remove('off');
    game.classList.add('on');
    // set the proper status for user experience
    var status=document.querySelector('.status');
    status.innerText="Game on";
    //make a move -OR- ask the player to start
    if(bot==="x")
      firstMove();
    else
      status.innerText="Your move";
  };

  /**
    * make a random pick if bot plays first
    * each block has #rXcY id hook like #r1c1
    */
  function firstMove(){
    var r=Math.floor(Math.random()*3)+1;
    var c=Math.floor(Math.random()*3)+1;
    var rand=document.querySelector("#r"+ r + "c" +c);
    rand.classList.add("x"); // add bot class
  };

  //call player choice, once the user makes a selection
  var playerOptions=document.querySelectorAll('.player');
  playerOptions[0].onclick=playerChoice;
  playerOptions[1].onclick=playerChoice;

}

/**
  * process user selection during game
  * determine if the game is over
  * if the game is still on, send bot's response
  * and evaluate if the game is still on.
  */
function processPlayerInput(){
  /**
    * handle user click on the game blocks
    */
  var buttonClickHandler=function(){
    //get current board positions
    var positions=getGamePositions();
    //check for winner positions
    var winner=getWinner(positions);
    // do nothing if the block already has x or o (and the game is still on)
    if(!winner && !this.classList.contains("x") && !this.classList.contains("o")){
      this.classList.add(player);
    }

    var gameStatus=evaluateGameStatus(); //evaluate the board for user input
    console.log("game status after user input: " + gameStatus);
    if(gameStatus=="Game on"){
      botResponse(); //if the game is still in progress, respond back with selection
      evaluateGameStatus(); //evaluate the board for bot response
    }
  };

  /**
    * evaluate the board for current status
    * possible game status
    * -- "Game on" --default
    * -- "You win"
    * -- "Bot wins"
    * -- "It's a tie"
    */
  function evaluateGameStatus(){
    result="Game on";
    var status=document.querySelector('.status');

    positions=getGamePositions(); //get positions again, based on last user input
    winner=getWinner(positions);

    if(winner){
      /**
        * if either the player or the bot has won
        * format the board and send the status back
        * call back resetGame to get ready for next game
        */
      formatWinner(winner);
      if(winner[0]==bot){
        result="Bot ("+ bot + ") wins.";
        status.classList.add("lost");
      }else{
        result="You (" + player + ") win!";
        status.classList.add("won");
      }
      /*result=(winner[0]==bot)? "Bot ("+ bot + ") wins." : "You (" + player + ") win!";
      status.classList.add("won"); //call for attention*/
      window.setTimeout(resetGame,3000);
    }else if (gameTie()){
      //if it's a tie call back resetGame to get ready for next game
      result="It's a tie!";
      status.classList.add("tie"); //call for attention
      window.setTimeout(resetGame,3000);
    }
    //update status field
    status.innerText=result;
    return result;
  }

  //get ready for the next game
  function resetGame(){
    //reset player choice
    bot="b";
    player="b";
    /**
      * set the flag to game off
      * this will hide the board and show the option panel
      * for user to make a choice again
      */
    var game=document.querySelector('.game');
    game.classList.remove('on');
    game.classList.add('off');
    /**
      * remove earlier player and bot selections from blocks
      * add reset class for ux
      * remove win class to reset any highlights of won block order
      */
    var buttons=document.querySelectorAll(".game button");
    for(var i=0;i<buttons.length;i++){
      buttons[i].classList.add("reset");
      buttons[i].classList.remove("x");
      buttons[i].classList.remove("o");
      buttons[i].classList.remove("win");
    }
    //reset status field
    var status=document.querySelector('.status');
    status.classList.remove("won");
    status.classList.remove("tie");
    status.classList.remove("lost");
    status.innerText="...";
  }

  //boolean answer "is it a tie?" (true / false )
  function gameTie(){
    positions=getGamePositions();
    winner=getWinner(positions);
    //no one has won and no blanks (all blocks filled in)
    return (!winner && !positions.toString().includes("b"));
  }

  /**
    * the brain of the bot
    * first, try to win, this is important
    *  don't give another option for the player
    * second, try to defend, cut off player from winning in the next move
    * third, in anticipation to win in the next move, create a series
    * fourth, in early stages of the game, stay close to the player
    * fifth, looks like the game is almost at the end, may be one block left
    *  just fill it in.
    */
  function botResponse(){
    positions=getGamePositions(); //get current game positions
    //try to win first
    var winPatterns=[bot+bot+"b",bot+"b"+bot,"b"+bot+bot];
    var next=fillNextBestSlot(positions,winPatterns);
    if(next){

    }else{
      //second is to try and defend
      var defencePatterns=[player+player+"b",player+"b"+player,"b"+player+player];
      next=fillNextBestSlot(positions,defencePatterns);
      if(next){
      }else{ //third, try to position bot side by side, in readiness for next win
        var strategicWinPatterns=[bot+"bb","bb"+bot,"b"+bot+"b"];
        next=fillNextBestSlot(positions,strategicWinPatterns);
        if(next){
        }else{ //must be early stages, try to position right next to the player
          var strategicDefencePatterns=[player+"bb","bb"+player,"b"+player+"b"];
          next=fillNextBestSlot(positions,strategicDefencePatterns);
          if(next){
          }else{
            var oneLastSlotPatterns=[
              player+"b"+bot,
              bot+"b"+player,
              "b"+player+bot,
              "b"+bot+player,
              bot+player+"b",
              player+bot+"b"
            ];
            next=fillNextBestSlot(positions,oneLastSlotPatterns);
            if(next){
            }
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

  var buttons=document.querySelectorAll(".game button");
  for(var i=0;i<buttons.length;i++){
    buttons[i].onclick=buttonClickHandler;
  }

}

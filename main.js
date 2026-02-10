var game = {
  board: [[null,null,null],[null,null,null],[null,null,null]],
  playerMark: "",
  aiMark: "",
  turnsPlayed: 0,
  playerTurn: true,
  nextMove: [null,null],
  winner: "",
  gameOver: false,
  difficulty: "hard" // default
};

var darkColor = "#2c3e50";

var computerThreats = ["Prepare to suffer!", "I will destroy you!", "You cannot win!", "Fear me!"];

$(document).ready(function() {
  $("#game-narrative-one").fadeIn(500);
  $("#header, #game-configuration, #game-grid, #game-over").hide();
});

// Narrative buttons
$("#narrative-one-btn").click(()=>transition($("#game-narrative-one"), $("#game-narrative-two")));
$("#narrative-two-btn").click(()=>transition($("#game-narrative-two"), $("#game-narrative-three")));

$("#narrative-three-btn").click(function() {
  $("#game-narrative-three").fadeOut(500, function() {
    $("#header").show();
    $("#tic-text").fadeIn(500, ()=>$("#tac-text").fadeIn(500, ()=>{ $("body").css("background-color", darkColor); $("#doom-text").fadeIn(500, ()=>$("#game-configuration").fadeIn(500));})));
  });
});

// Transition helper
function transition(from, to){ from.fadeOut(500, ()=>to.fadeIn(500)); }

// Choose mark
$(".identity-cell").click(function() {
  game.playerMark = $(this).attr("value");
  game.aiMark = (game.playerMark==="X")?"O":"X";
  $(".identity-cell").off("click"); // disable after selection
});

// Choose difficulty
$(".difficulty-cell").click(function() {
  game.difficulty = $(this).attr("value");
  startGame();
});

// Start game
function startGame(){
  $("#game-configuration").hide();
  $("#game-grid").fadeIn(500);
  if(!game.playerTurn) aiPlay();
}

// Player move
$(".game-cell").click(function() {
  if(!game.playerTurn || game.gameOver) return;
  var cell = $(this).attr("id"), row=parseInt(cell[1]), col=parseInt(cell[2]);
  if(spaceFree(game.board,row,col)) makePlay(game.playerMark,row,col), checkPlay(game.playerMark);
});

// AI move
function aiPlay(){
  var randThreat = computerThreats[Math.floor(Math.random()*computerThreats.length)];
  $("#computer-threat-text").text(randThreat).fadeIn(250).fadeOut(2250);

  setTimeout(()=>{
    var move;
    if(game.difficulty==="easy") move = aiRandomMove();
    else move = aiMinimaxMove();
    makePlay(game.aiMark, move[0], move[1]);
    checkPlay(game.aiMark);
  }, 800);
}

// Easy AI
function aiRandomMove(){
  var moves=[];
  for(var r=0;r<3;r++) for(var c=0;c<3;c++) if(spaceFree(game.board,r,c)) moves.push([r,c]);
  return moves[Math.floor(Math.random()*moves.length)];
}

// Hard AI
function aiMinimaxMove(){
  minimax(game,0);
  return game.nextMove;
}

// Check win/draw
function checkPlay(mark){
  if(hasWon()) { game.gameOver=true; setTimeout(()=>gameOver(mark), 800); }
  else if(game.turnsPlayed>=9){ game.gameOver=true; setTimeout(()=>gameOver("draw"),800); }
  else{ game.playerTurn=!game.playerTurn; if(!game.playerTurn) aiPlay(); }
}

// Make move
function makePlay(mark,row,col){
  game.board[row][col]=mark;
  game.turnsPlayed++;
  $("#c"+row+col).text(mark).addClass("cell-selected");
}

// Free space check
function spaceFree(board,row,col){ return board[row][col]===null; }

// Win check
function hasWon(){
  const b=game.board;
  // rows
  for(var r=0;r<3;r++) if(b[r][0]&&b[r][0]===b[r][1]&&b[r][1]===b[r][2]){$("#c"+r+"0,#c"+r+"1,#c"+r+"2").addClass("cell-win"); return true; }
  // cols
  for(var c=0;c<3;c++) if(b[0][c]&&b[0][c]===b[1][c]&&b[1][c]===b[2][c]){ $("#c0"+c+",#c1"+c+",#c2"+c).addClass("cell-win"); return true; }
  // diagonals
  if(b[0][0]&&b[0][0]===b[1][1]&&b[1][1]===b[2][2]){$("#c00,#c11,#c22").addClass("cell-win");return true;}
  if(b[0][2]&&b[0][2]===b[1][1]&&b[1][1]===b[2][0]){$("#c02,#c11,#c20").addClass("cell-win");return true;}
  return false;
}

// Game over screen
function gameOver(winner){
  $("#game-grid").hide(); $("#game-over").fadeIn(500);
  if(winner===game.playerMark){ $("#game-end-heading").text("You have claimed victory."); $("#game-end-subheading").text("May you bathe in tic-tac-toe glory."); }
  else if(winner===game.aiMark){ $("#game-end-heading").text("The computer has claimed victory!"); $("#game-end-subheading").text("Its circuits bask in victory."); }
  else { $("#game-end-heading").text("It's a draw."); $("#game-end-subheading").text("Perhaps their feud will continue..."); }
}

// Reset
$("#game-reset-btn").click(function(){
  $(".game-cell").empty().removeClass("cell-selected cell-win");
  game.board=[[null,null,null],[null,null,null],[null,null,null]];
  game.turnsPlayed=0; game.playerTurn=true; game.gameOver=false; game.winner=""; $("#game-over").hide(); $("#game-configuration").fadeIn(500); $("#computer-threat-text").text("");
});

// Minimax logic
function minimax(state,depth){
  var gs=JSON.parse(JSON.stringify(state)); depth++;
  if(gs.gameOver){ return getScore(gs,depth); }
  var moves=generateAllAvailableMoves(gs); var scores=[];
  for(var i=0;i<moves.length;i++){ var g=generatePossibleGame(gs,moves[i]); scores.push(minimax(g,depth)); }
  if(gs.playerTurn){ var maxI=findIndexOfMax(scores); game.nextMove=moves[maxI]; return scores[maxI]; }
  else{ var minI=findIndexOfMin(scores); game.nextMove=moves[minI]; return scores[minI]; }
}

function getScore(gs,d){ if(gs.gameOver&&gs.winner===gs.playerMark) return 10-d; else if(gs.gameOver&&gs.winner===gs.aiMark) return d-10; else return 0; }
function generateAllAvailableMoves(gs){ var m=[]; for(var r=0;r<3;r++) for(var c=0;c<3;c++) if(spaceFree(gs.board,r,c)) m.push([r,c]); return m; }
function generatePossibleGame(s,m){ var gs=JSON.parse(JSON.stringify(s)); if(gs.playerTurn) gs.board[m[0]][m[1]]=gs.playerMark; else gs.board[m[0]][m[1]]=gs.aiMark; gs.turnsPlayed++; if(checkWinState(gs)){ gs.gameOver=true; gs.winner=gs.playerTurn?gs.playerMark:gs.aiMark; } else if(gs.turnsPlayed>=9){ gs.gameOver=true; gs.winner="draw"; } else gs.playerTurn=!gs.playerTurn; return gs; }
function checkWinState(gs){ const b=gs.board; for(var r=0;r<3;r++) if(b[r][0]&&b[r][0]===b[r][1]&&b[r][1]===b[r][2]) return true; for(var c=0;c<3;c++) if(b[0][c]&&b[0][c]===b[1][c]&&b[1][c]===b[2][c]) return true; if(b[0][0]&&b[0][0]===b[1][1]&&b[1][1]===b[2][2]) return true; if(b[0][2]&&b[0][2]===b[1][1]&&b[1][1]===b[2][0]) return true; return false; }
function findIndexOfMax(a){ var mi=0; for(var i=1;i<a.length;i++) if(a[i]>a[mi]) mi=i; return mi; }
function findIndexOfMin(a){ var mi=0; for(var i=1;i<a.length;i++) if(a[i]<a[mi]) mi=i; return mi; }

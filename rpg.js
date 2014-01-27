var w;

var character = Backbone.Model.extend({
	defaults : {
	  id : 0,
		name : "character",
		hp : 1,
		attack : 1, 
		initiative :  0,
		currentInitiative: 1
	},
	setNewInitiative : function(){
  	this.set('currentInitiative', roll() + this.get('initiative'));
	},
	myTurn : function(){
  	var z = this;
  	console.log(z);
  	debug(z.get("name")+"'s Turn");
	},
	attack : function(myEnemy){
  	var z = this;
  	debug(z.get("name")+" attacked "+myEnemy.get("name"));
  	myEnemy.hit(z.get("attack"));
  	myEnemy.update();
	},
	hit : function(damage){
    var z = this,
    hp = z.get("hp");
  	z.set({"hp":hp - damage});
  	if(hp-damage <= 0){
    	z.die();
  	}
	},
	update : function(){
  	var z = this;
  	if(z.get("hp") <= 0){
    	$("."+z.get("id")+"_"+z.get("name")).hide().remove();
  	}else {
  	  $("."+z.get("id")+"_"+z.get("name")).html(z.get("name")+" / "+z.get("hp"));
  	}
	},
	die : function(){
  	var z = this;
  	debug(z.get("name")+" died");
	}
});
var enemy = character.extend({
  myTurn : function(){
    var z = this;
    debug(z.get("name")+"'s Turn");
    
    var num = roll(w.pcs.length) - 1;
    console.log(num, w.pcs);
    z.attack(w.pcs[num]);
    //debug(z.get("name")+" attacked "+w.pcs[num].get("name"));
    
    w.nextTurn();
  },
  die : function(){
    w.battleOrder.splice(w.battleOrder.indexOf(this));
    w.enemies.splice(w.enemies.indexOf(this));
    this.update();
    debug(this.get("name")+" died");
  }
});
var playerCharacter = character.extend({
  draw : function(){
   
  },
  myTurn : function(){
    var z = this;
    
    debug(z.get("name")+"'s Turn");
    
    w.menu.find(".title").html(z.get('name')+"'s Turn");
    w.menu.find(".actions").html("<li class='action attack'>Attack</li><li class='action defend'>Defend</li>");
    $(".action").click(function(){
      var action = $(this);
      if(action.hasClass("attack")){
        var enemies = w.enemies;
        console.log(enemies);
        $.each(enemies, function(i, e){
          $(".attack").append("<span class='enemy' rel='"+i+"'>"+e.get("name")+"</span>");
        });
        $(".enemy").click(function(){
          $(".enemy").remove();
          z.attack(w.enemies[$(this).attr("rel")]);
          w.nextTurn();
        });
        
      } else {
        w.nextTurn();
      }
    });
  }
});

var world = Backbone.Model.extend({
	pcs : [],
	enemies : [],
	battleOrder : [],
	currentTurn : 0,
	pcWorld : $("#pcs"),
	enemyWorld : $("#enemies"),
	menu: $("#menu"),
	
	initialize : function(){
		//Load Player Characters
		var z = this;
		$.getJSON("character.json", function(json){
			
			$.each(json, function(k,v){
				//console.log(v);
				var pc = new playerCharacter(v),
				name = pc.get("name");
				z.pcs.push(pc);
				z.pcWorld.append($("<li>").addClass(pc.get("id")+"_"+name).html(
				  name + " / " + pc.get("hp")
				));
				debug(name+" created");
			});
		});
		//Load Enemies
		$.getJSON("enemies.json", function(json){
  		$.each(json, function(k,v){
    		var e = new enemy(v),
    		name = e.get("name");
    		z.enemies.push(e);
    		z.enemyWorld.append($("<li>").addClass(e.get("id")+"_"+name).html(
				  name + " / " + e.get("hp")
				));
				debug(name+" created");
  		});
		});
		
		setTimeout(function(){
		console.log("DEBUG", z.pcs, z.enemies);
		  z.startBattle();
		}, 1000);
	},//end initialize
	
	startBattle : function(){
  	var z = this;
  	z.battleOrder = z.pcs.concat(z.enemies);
  	for(var k =0; k < z.battleOrder.length; k++){
    	z.battleOrder[k].setNewInitiative();
  	}
  	z.battleOrder.sort(function(a,b){
  	  //Sort in descending order by current iniative
    	return b.get('currentInitiative') - a.get('currentInitiative');
  	});
  	
  	z.currentTurn = 0;
  	z.battleOrder[z.currentTurn].myTurn();
  	
  	//setTimeout(function(){
  	console.log(z.battleOrder);
  	//}, 1000);
	},
	
	nextTurn : function(){
	  var z = this;
  	if(z.currentTurn >= z.battleOrder.length){
    	z.currentTurn = 0;
  	} else {
    	z.currentTurn++;
  	}
  	
  	z.battleOrder[z.currentTurn].myTurn();
	}
});

var roll = function(sides=20, num=1, add=0){
  var total = 0;
  for(var k = 0; k < num; k++){
    total += Math.floor(Math.random()*(sides));
  }
  return total + add;
}

var debug = function(message){
  $("#debug").append("<p>"+message+"</p>");
}

$(function(){
  console.log("START");
  w = new world();
});
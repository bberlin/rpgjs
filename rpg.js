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
  	myEnemy.hit(z.get("attack"));
	},
	hit : function(damage){
    var z = this,
    hp = z.get("hp");
  	z.set({"hp":hp - damage});
	}
});
var enemy = character.extend({
  myTurn : function(){
    var z = this;
    debug(z.get("name")+"'s Turn");
    
    var num = roll(w.pcs.length);
    console.log(num, w.pcs);
    z.attack(w.pcs[num]);
    debug(z.get("name")+" attacked "+w.pcs[num].get("name"));
  }
});
var playerCharacter = character.extend({
  draw : function(){
   
  },
  myTurn : function(){
    var z = this;
    
    debug(z.get("name")+"'s Turn");
    
    w.menu.find(".title").html(z.get('name')+"'s Turn");
    w.menu.find(".actions").html("<li class='attack'>Attack</li><li class='defend'>Defend</li>");
  }
});

var world = Backbone.Model.extend({
	pcs : [],
	enemies : [],
	battleOrder : [],
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
  	
  	z.battleOrder[0].myTurn();
  	
  	//setTimeout(function(){
  	console.log(z.battleOrder);
  	//}, 1000);
	}
});

var roll = function(sides=20, num=1, add=0){
  var total = 0;
  for(var k = 0; k < num; k++){
    total += Math.floor(Math.random()*(sides+1));
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